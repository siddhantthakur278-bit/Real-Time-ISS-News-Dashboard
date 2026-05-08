// ISS API service
// Dev: uses Vite proxy to bypass CORS for open-notify.org
// Production: uses wheretheiss.at (HTTPS native, no CORS issues)

const isDev = import.meta.env.DEV;

const delay = (ms) => new Promise(r => setTimeout(r, ms));

const fetchWithRetry = async (url, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        console.warn(`Rate limited, waiting ${(i + 1) * 3}s...`);
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
  // In dev mode, use Vite proxy -> open-notify.org
  if (isDev) {
    try {
      const data = await fetchWithRetry('/iss-now');
      return {
        latitude: parseFloat(data.iss_position.latitude),
        longitude: parseFloat(data.iss_position.longitude),
        timestamp: data.timestamp,
        velocity: null,
      };
    } catch (e) {
      console.warn('Dev proxy failed, trying direct API:', e.message);
    }
  }

  // Production fallback (or dev fallback): wheretheiss.at supports HTTPS natively
  const data = await fetchWithRetry('https://api.wheretheiss.at/v1/satellites/25544');
  return {
    latitude: parseFloat(data.latitude),
    longitude: parseFloat(data.longitude),
    timestamp: data.timestamp,
    velocity: parseFloat(data.velocity),
  };
};

export const fetchAstronauts = async () => {
  // In dev mode, use Vite proxy -> open-notify.org
  if (isDev) {
    try {
      const data = await fetchWithRetry('/astros');
      return { count: data.number, people: data.people };
    } catch (e) {
      console.warn('Dev proxy failed for astros:', e.message);
    }
  }

  // Production: open-notify.org astros.json works over HTTPS directly
  try {
    const data = await fetchWithRetry('https://api.open-notify.org/astros.json');
    return { count: data.number, people: data.people };
  } catch {
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
