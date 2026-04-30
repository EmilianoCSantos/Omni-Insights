import React from 'react';

function StatsPanel({ stats, totalRows }) {
  const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    const match = duration.match(/(\d+):(\d+):(\d+)/);
    if (match) {
      const hours = match[1];
      const minutes = match[2];
      const seconds = match[3];
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m ${seconds}s`;
    }
    return duration;
  };

  return (
    <div className="stats-panel">
      <div className="stat-card">
        <div className="stat-label">Total Rows</div>
        <div className="stat-value">{totalRows}</div>
      </div>

      <div className="stat-card">
        <div className="stat-label">Duration</div>
        <div className="stat-value">{formatDuration(stats?.duration)}</div>
      </div>

      <div className="stat-card">
        <div className="stat-label">Avg Magnitude (mm)</div>
        <div className="stat-value">{stats?.avgMagnitude?.toFixed(2) || 'N/A'}</div>
      </div>

      <div className="stat-card">
        <div className="stat-label">Max Magnitude (mm)</div>
        <div className="stat-value">{stats?.maxMagnitude?.toFixed(2) || 'N/A'}</div>
      </div>

      <div className="stat-card">
        <div className="stat-label">Avg Variability (mm)</div>
        <div className="stat-value">{stats?.avgVariability?.toFixed(3) || 'N/A'}</div>
      </div>
    </div>
  );
}

export default StatsPanel;
