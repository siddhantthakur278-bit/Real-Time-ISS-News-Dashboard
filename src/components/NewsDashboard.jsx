import React, { useState } from 'react';
import { Search, RefreshCw, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const categories = ['general', 'science', 'technology', 'health', 'business'];

const NewsDashboard = ({ news, onRefresh, onSearch }) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(news.category, searchInput);
  };

  return (
    <div className="news-section">
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h2>Global News Dashboard</h2>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
              <input 
                type="text" 
                className="chat-input" 
                placeholder="Search news..." 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{ paddingRight: '2.5rem', width: '250px' }}
              />
              <button type="submit" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <Search size={18} />
              </button>
            </form>
            
            <button className="btn btn-secondary" onClick={() => onRefresh(news.category)}>
              <RefreshCw size={18} className={news.loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {categories.map(cat => (
            <button 
              key={cat}
              className={`btn ${news.category === cat ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => onRefresh(cat)}
              style={{ textTransform: 'capitalize' }}
            >
              {cat}
            </button>
          ))}
        </div>

        {news.loading ? (
          <div className="news-grid">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="glass-card loading-skeleton" style={{ height: '350px' }} />
            ))}
          </div>
        ) : (
          <motion.div 
            className="news-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {news.articles.map((article, idx) => (
              <motion.div 
                key={idx}
                className="glass-card news-card"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <img src={article.image} alt={article.title} className="news-image" />
                <div className="news-content">
                  <div className="news-meta">
                    <span>{article.source}</span>
                    <span>{new Date(article.date).toLocaleDateString()}</span>
                  </div>
                  <h3 className="news-title">{article.title}</h3>
                  <p className="news-desc">{article.description}</p>
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>By {article.author}</span>
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-primary" 
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
                    >
                      Read More <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NewsDashboard;
