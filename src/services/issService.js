// ISS API service
// Uses server-side Vercel API routes to bypass all CORS/Mixed Content issues

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
  try {
    // Calling our own serverless function which handles the external API call
    const data = await fetchWithRetry('/api/iss-now');
    
    return {
      latitude: parseFloat(data.iss_position.latitude),
      longitude: parseFloat(data.iss_position.longitude),
      timestamp: data.timestamp,
      velocity: null, // open-notify doesn't provide velocity
    };
  } catch (err) {
    console.error('ISS fetch failed via serverless function:', err.message);
    // Silent fallback to direct wheretheiss (HTTPS native) if our own API fails
    try {
       const fb = await fetchWithRetry('https://api.wheretheiss.at/v1/satellites/25544');
       return {
         latitude: parseFloat(fb.latitude),
         longitude: parseFloat(fb.longitude),
         timestamp: fb.timestamp,
         velocity: parseFloat(fb.velocity),
       };
    } catch (e) {
       throw err;
    }
  }
};

export const fetchAstronauts = async () => {
  try {
    const data = await fetchWithRetry('/api/astros');
    return { count: data.number, people: data.people };
  } catch (e) {
    console.warn('Astronaut fetch failed via serverless function, using fallback');
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
