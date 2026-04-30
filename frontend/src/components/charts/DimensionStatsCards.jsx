import React from 'react';

function DimensionStatsCards({ dimensions }) {
  if (!dimensions) {
    return <div>No dimension data available</div>;
  }

  const dimensionLabels = {
    'X': 'Lateral (X)',
    'Y': 'Horizontal (Y)',
    'Z': 'Vertical (Z)',
    'Pitch': 'Pitch (°)',
    'Roll': 'Roll (°)',
    'Yaw': 'Yaw (°)'
  };

  return (
    <div className="dimension-stats-grid">
      {Object.entries(dimensions).map(([key, stats]) => (
        <div key={key} className="dimension-card">
          <h3>{dimensionLabels[key] || key}</h3>
          <div className="stat-row">
            <span className="stat-name">Mean:</span>
            <span className="stat-value">{stats.mean?.toFixed(2) || 'N/A'}</span>
          </div>
          <div className="stat-row">
            <span className="stat-name">Std Dev:</span>
            <span className="stat-value">{stats.stdDev?.toFixed(3) || 'N/A'}</span>
          </div>
          <div className="stat-row">
            <span className="stat-name">Min:</span>
            <span className="stat-value">{stats.min?.toFixed(2) || 'N/A'}</span>
          </div>
          <div className="stat-row">
            <span className="stat-name">Max:</span>
            <span className="stat-value">{stats.max?.toFixed(2) || 'N/A'}</span>
          </div>
          <div className="stat-row">
            <span className="stat-name">Range:</span>
            <span className="stat-value">{stats.range?.toFixed(2) || 'N/A'}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default DimensionStatsCards;
