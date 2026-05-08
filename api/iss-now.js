export default async function handler(req, res) {
  try {
    const response = await fetch('http://api.open-notify.org/iss-now.json');
    const data = await response.json();
    
    // Set CORS headers just in case
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
  } catch (error) {
    // Fallback to WhereTheISS.at if open-notify is down
    try {
      const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
      const data = await response.json();
      res.status(200).json({
        iss_position: {
          latitude: data.latitude,
          longitude: data.longitude
        },
        timestamp: data.timestamp,
        message: 'success'
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch ISS data' });
    }
  }
}
