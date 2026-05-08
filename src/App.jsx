import React from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Navigation, Activity, RefreshCw } from 'lucide-react';
import { useDashboardData } from './hooks/useDashboardData';
import ISSMap from './components/ISSMap';
import ISSSpeedChart from './components/ISSSpeedChart';
import NewsDashboard from './components/NewsDashboard';
import NewsDistributionChart from './components/NewsDistributionChart';
import AIChatbot from './components/AIChatbot';
import AstronautsList from './components/AstronautsList';
import ThemeToggle from './components/ThemeToggle';

function App() {
  const { 
    issData, 
    astronauts, 
    news, 
    refreshISS, 
    refreshNews 
  } = useDashboardData();

  const handleRefreshISS = () => {
    refreshISS();
    toast.success('ISS data updated!');
  };

  return (
    <div className="dashboard-container">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="header glass-card">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-primary)', letterSpacing: '0.1em' }}>MISSION CONTROL DASHBOARD</span>
          <h1 style={{ fontSize: '2rem' }}>Real-Time ISS and News Intelligence</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Grid: ISS Tracking & Charts */}
      <section style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem' }}>ISS Live Tracking</h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={handleRefreshISS}>
                <RefreshCw size={16} className={issData.loading ? 'animate-spin' : ''} />
                Refresh Now
              </button>
              <div style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem', background: 'var(--bg-color)', fontSize: '0.875rem', fontWeight: 500 }}>
                Auto-Refresh: ON
              </div>
            </div>
          </div>

          <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="glass-card stat-item">
              <span className="stat-label">Latitude / Longitude</span>
              <span className="stat-value" style={{ fontSize: '1.1rem' }}>{issData.latitude.toFixed(3)}, {issData.longitude.toFixed(3)}</span>
            </div>
            <div className="glass-card stat-item">
              <span className="stat-label">Speed</span>
              <span className="stat-value" style={{ fontSize: '1.1rem' }}>{issData.speed.toFixed(2)} km/h</span>
            </div>
            <div className="glass-card stat-item">
              <span className="stat-label">Nearest Place</span>
              <span className="stat-value" style={{ fontSize: '0.9rem' }}>{issData.nearestPlace}</span>
            </div>
            <div className="glass-card stat-item">
              <span className="stat-label">Tracked Positions</span>
              <span className="stat-value" style={{ fontSize: '1.1rem' }}>{issData.path.length}</span>
            </div>
          </div>
          
          <ISSMap 
            latitude={issData.latitude} 
            longitude={issData.longitude} 
            path={issData.path} 
          />
        </div>
      </section>

      {/* Sidebar: Speed Trend & Astronauts */}
      <aside style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <ISSSpeedChart data={issData.speedHistory} />
        <AstronautsList astronauts={astronauts} />
        <NewsDistributionChart articles={news.articles} onFilter={(source) => refreshNews(news.category, source)} />
      </aside>

      {/* Breaking News Section */}
      <section style={{ gridColumn: 'span 12' }}>
        <NewsDashboard 
          news={news} 
          onRefresh={(cat) => refreshNews(cat, '')} 
          onSearch={(cat, query) => refreshNews(cat, query)} 
        />
      </section>

      <AIChatbot dashboardData={{ iss: issData, astronauts, news: news.articles }} />
      
      <footer style={{ gridColumn: 'span 12', textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        &copy; 2024 ISS Mission Control Dashboard • Real-time orbital intelligence
      </footer>
    </div>
  );
}

export default App;
