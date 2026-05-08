import axios from 'axios';

const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const BASE_URL = 'https://newsdata.io/api/1/news';

const CACHE_KEY = 'news_dashboard_data_v3';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in ms

export const fetchNews = async (category = 'top', query = '') => {
  // Check cache first
  const cacheId = `${category}_${query}`;
  const cachedData = localStorage.getItem(`${CACHE_KEY}_${cacheId}`);
  if (cachedData) {
    const { data, timestamp } = JSON.parse(cachedData);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }

  try {
    if (!API_KEY || API_KEY.startsWith('your_')) {
       return getMockNews(category);
    }

    // Using NewsData.io as per latest user request
    const response = await axios.get(BASE_URL, {
      params: {
        apikey: API_KEY,
        language: 'en',
        ...(query ? { q: query } : { category: category === 'general' ? 'top' : category }),
      }
    });

    const results = response.data.results || [];
    
    let articles = results.map(item => ({
      title: item.title || 'Breaking News',
      source: item.source_id || 'Global News',
      author: item.creator?.[0] || 'News Editor',
      date: item.pubDate || new Date().toISOString(),
      image: item.image_url || 'https://images.unsplash.com/photo-1585007600263-ad12200a09a5?auto=format&fit=crop&q=80&w=1000',
      description: item.description || 'No summary available.',
      url: item.link,
      category: category
    }));

    // Limit to 10 articles
    articles = articles.slice(0, 10);

    // Save to cache
    localStorage.setItem(`${CACHE_KEY}_${cacheId}`, JSON.stringify({
      data: articles,
      timestamp: Date.now()
    }));

    return articles.length > 0 ? articles : getMockNews(category);
  } catch (error) {
    console.error('Error fetching news from NewsData.io:', error);
    return getMockNews(category);
  }
};

const getMockNews = (category) => {
  return [
    {
      title: `ISS Crew Successfully Completes Space Walk in ${category} zone`,
      source: 'Space News',
      author: 'John Doe',
      date: new Date().toISOString(),
      image: 'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?auto=format&fit=crop&q=80&w=1000',
      description: 'The astronauts currently aboard the ISS have successfully completed a routine maintenance spacewalk.',
      url: '#',
      category: category
    },
    {
      title: 'New Galaxy Discovered by James Webb Telescope',
      source: 'Science Daily',
      author: 'Jane Smith',
      date: new Date().toISOString(),
      image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=1000',
      description: 'Astronomers are baffled by a newly discovered galaxy that seems to defy current physics models.',
      url: '#',
      category: category
    },
    {
      title: 'Global Tech Summit 2024 Announces New AI Standards',
      source: 'TechCrunch',
      author: 'Alice Cooper',
      date: new Date().toISOString(),
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000',
      description: 'Leaders in AI technology have come together to sign a new ethics agreement for large language models.',
      url: '#',
      category: category
    },
    {
      title: 'Climate Change: Arctic Ice Melting Faster Than Predicted',
      source: 'Nature',
      author: 'Robert Brown',
      date: new Date().toISOString(),
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000',
      description: 'A new study reveals that Arctic sea ice is disappearing at a rate that could lead to ice-free summers by 2030.',
      url: '#',
      category: category
    },
    {
      title: 'Electric Vehicle Revolution: Solid State Batteries Near Production',
      source: 'Automotive News',
      author: 'Sarah Jenkins',
      date: new Date().toISOString(),
      image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000',
      description: 'Major automakers are reporting breakthroughs in solid-state battery technology, promising longer range and faster charging.',
      url: '#',
      category: category
    }
  ];
};
