import React from 'react';
import { Users, User } from 'lucide-react';

const AstronautsList = ({ astronauts }) => {
  return (
    <div className="glass-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Users size={24} color="var(--accent-primary)" />
        <h2>People in Space</h2>
      </div>
      
      <div className="stat-item" style={{ marginBottom: '1.5rem' }}>
        <span className="stat-label">Total Astronauts</span>
        <span className="stat-value">{astronauts.count}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto' }}>
        {astronauts.people.map((person, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', borderRadius: '0.5rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
            <User size={16} color="var(--text-secondary)" />
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{person.name}</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--border-color)', padding: '0.1rem 0.5rem', borderRadius: '1rem' }}>
              {person.craft}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AstronautsList;
