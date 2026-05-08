// ISS API service
// Robust version for both local dev and production (Vercel)

const delay = (ms) => new Promise(r => setTimeout(r, ms));

const fetchWithRetry = async (url, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        await delay((i + 1) * 3000);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      await delay(2000);
    }
  }
};

export const fetchISSLocation = async () => {
  // Primary: WhereTheISS.at (HTTPS native)
  // We use AllOrigins proxy for production to guarantee bypass of CORS on Vercel
  const PROXY = 'https://api.allorigins.win/get?url=';
  const TARGET = 'https://api.wheretheiss.at/v1/satellites/25544';
  
  try {
    const res = await fetch(`${PROXY}${encodeURIComponent(TARGET)}`);
    const json = await res.json();
    const data = JSON.parse(json.contents);
    
    return {
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      timestamp: data.timestamp,
      velocity: parseFloat(data.velocity),
    };
  } catch (err) {
    console.warn('Primary ISS fetch failed, trying direct fallback:', err.message);
    try {
      const data = await fetchWithRetry(TARGET);
      return {
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        timestamp: data.timestamp,
        velocity: parseFloat(data.velocity),
      };
    } catch (e) {
      // Last resort: open-notify (might be blocked by mixed content but worth a shot)
      const data = await fetchWithRetry('https://api.allorigins.win/get?url=http://api.open-notify.org/iss-now.json');
      const parsed = JSON.parse(data.contents);
      return {
        latitude: parseFloat(parsed.iss_position.latitude),
        longitude: parseFloat(parsed.iss_position.longitude),
        timestamp: parsed.timestamp,
        velocity: null,
      };
    }
  }
};

export const fetchAstronauts = async () => {
  const PROXY = 'https://api.allorigins.win/get?url=';
  const TARGET = 'http://api.open-notify.org/astros.json';
  
  try {
    const res = await fetch(`${PROXY}${encodeURIComponent(TARGET)}`);
    const json = await res.json();
    const data = JSON.parse(json.contents);
    return { count: data.number, people: data.people };
  } catch (e) {
    console.warn('Astronaut live fetch failed, using fallback crew data');
    return {
      count: 12,
      people: [
        { name: 'Oleg Kononenko', craft: 'ISS' },
        { name: 'Nikolai Chub', craft: 'ISS' },
        { name: 'Tracy Caldwell Dyson', craft: 'ISS' },
        { name: 'Matthew Dominick', craft: 'ISS' },
        { name: 'Michael Barratt', craft: 'ISS' },
        { name: 'Jeanette Epps', craft: 'ISS' },
        { name: 'Alexander Grebenkin', craft: 'ISS' },
        { name: 'Butch Wilmore', craft: 'ISS' },
        { name: 'Sunita Williams', craft: 'ISS' },
        { name: 'Li Guangsu', craft: 'Tiangong' },
        { name: 'Li Cong', craft: 'Tiangong' },
        { name: 'Ye Guangfu', craft: 'Tiangong' },
      ],
    };
  }
};

export const fetchNearestPlace = async (lat, lon) => {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const parts = [data.locality, data.city, data.countryName].filter(Boolean);
    if (parts.length > 0) return parts.join(', ');
    return data.continent || 'Over the Ocean';
  } catch (err) {
    console.error('Geocoding error:', err.message);
    return 'Over the Ocean / Remote Area';
  }
};
