import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchISSLocation, fetchAstronauts, fetchNearestPlace } from '../services/issService';
import { fetchNews } from '../services/newsService';
import { calculateDistance, calculateSpeed } from '../utils/geoUtils';

export const useDashboardData = () => {
  const [issData, setIssData] = useState({
    latitude: 0,
    longitude: 0,
    timestamp: 0,
    speed: 0,
    nearestPlace: 'Loading...',
    path: [],
    speedHistory: [],
    loading: true,
    error: null
  });

  const [astronauts, setAstronauts] = useState({
    count: 0,
    people: [],
    loading: true
  });

  const [news, setNews] = useState({
    articles: [],
    loading: true,
    error: null,
    category: 'general',
    query: ''
  });

  const lastPosRef = useRef(null);

  const updateISS = useCallback(async () => {
    try {
      const data = await fetchISSLocation();

      // Update nearest place 
      let place = lastPosRef.current?.nearestPlace || 'Loading...';
      if (!lastPosRef.current || Math.abs(lastPosRef.current.latitude - data.latitude) > 0.5) {
        place = await fetchNearestPlace(data.latitude, data.longitude);
      }

      setIssData(prev => {
        // Use wheretheiss.at velocity directly (already in km/h), fall back to Haversine
        let currentSpeed = data.velocity || prev.speed;

        if (!data.velocity && lastPosRef.current) {
          const distance = calculateDistance(
            lastPosRef.current.latitude,
            lastPosRef.current.longitude,
            data.latitude,
            data.longitude
          );
          const timeDiff = data.timestamp - lastPosRef.current.timestamp;
          if (timeDiff > 0) {
            currentSpeed = calculateSpeed(distance, timeDiff);
          }
        }

        lastPosRef.current = { ...data, nearestPlace: place };

        const newPath = [...prev.path, [data.latitude, data.longitude]].slice(-15);
        const newSpeedHistory = [
          ...prev.speedHistory,
          {
            time: new Date(data.timestamp * 1000).toLocaleTimeString(),
            speed: parseFloat(currentSpeed.toFixed(2))
          }
        ].slice(-30);

        return {
          ...prev,
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: data.timestamp,
          speed: currentSpeed,
          nearestPlace: place,
          path: newPath,
          speedHistory: newSpeedHistory,
          loading: false,
          error: null
        };
      });
    } catch (err) {
      console.error('ISS Update Error:', err);
      setIssData(prev => ({ ...prev, loading: false, error: 'Failed to fetch ISS data' }));
    }
  }, []);

  const updateAstronauts = useCallback(async () => {
    try {
      const data = await fetchAstronauts();
      if (data) {
        setAstronauts({ ...data, loading: false });
      }
    } catch {
      setAstronauts(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const updateNews = useCallback(async (category = 'general', query = '') => {
    setNews(prev => ({ ...prev, loading: true, category, query }));
    try {
      const articles = await fetchNews(category, query);
      setNews(prev => ({ ...prev, articles, loading: false, error: null }));
    } catch {
      setNews(prev => ({ ...prev, error: 'Failed to fetch news', loading: false }));
    }
  }, []);

  useEffect(() => {
    // Fetch all data immediately on mount
    updateISS();
    updateAstronauts();
    updateNews();

    // Update ISS every 15 seconds
    const issInterval = setInterval(updateISS, 15000);
    // Update astronauts once per minute
    const astrosInterval = setInterval(updateAstronauts, 60000);

    return () => {
      clearInterval(issInterval);
      clearInterval(astrosInterval);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    issData,
    astronauts,
    news,
    refreshISS: updateISS,
    refreshNews: (cat, q) => updateNews(cat, q)
  };
};
