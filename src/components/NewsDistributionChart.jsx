import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

const NewsDistributionChart = ({ articles, onFilter }) => {
  // Process data for chart
  const distribution = articles.reduce((acc, article) => {
    const source = article.source;
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  const data = Object.keys(distribution).map(name => ({
    name,
    value: distribution[name]
  })).sort((a, b) => b.value - a.value).slice(0, 5);

  return (
    <div className="glass-card" style={{ height: '350px' }}>
      <h3 style={{ marginBottom: '1.5rem' }}>News Sources Distribution</h3>
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            onClick={(data) => onFilter(data.name)}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--card-bg)', 
              borderColor: 'var(--border-color)',
              borderRadius: '0.75rem'
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            align="center"
            wrapperStyle={{ fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NewsDistributionChart;
