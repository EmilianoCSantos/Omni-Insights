import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SessionSelector from '../components/SessionSelector';
import StatsPanel from '../components/charts/StatsPanel';
import TrackingChart from '../components/charts/TrackingChart';
import MagnitudeChart from '../components/charts/MagnitudeChart';
import DimensionStatsCards from '../components/charts/DimensionStatsCards';
import '../styles/Dashboard.css';

function Dashboard() {
  const [searchParams] = useSearchParams();
  const [sessionId, setSessionId] = useState(searchParams.get('sessionId') || '');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previousSessions, setPreviousSessions] = useState([]);

  // Hämta tidigare sessions från localStorage
  useEffect(() => {
    const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
    setPreviousSessions(sessions);
  }, []);

  // Hämta analytics data när sessionId ändras
  useEffect(() => {
    if (sessionId) {
      const fetchAnalyticsData = async () => {
        setLoading(true);
        setError(null);
        
        try {
          const response = await fetch(`http://localhost:5170/api/analytics/analyze/${sessionId}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch analytics data');
          }
          
          const result = await response.json();
          
          if (result.success) {
            setAnalyticsData(result.data);
          } else {
            setError(result.message || 'Error analyzing session');
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchAnalyticsData();
    }
  }, [sessionId]);

  const fetchAnalytics = async () => {
    if (sessionId) {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`http://localhost:5170/api/analytics/analyze/${sessionId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        
        const result = await response.json();
        
        if (result.success) {
          setAnalyticsData(result.data);
        } else {
          setError(result.message || 'Error analyzing session');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSessionSelect = (selectedSessionId) => {
    setSessionId(selectedSessionId);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Analytics Dashboard</h1>
        <p>Analyze tracking data from your SGRT sessions</p>
      </div>

      <div className="dashboard-container">
        {/* Session Selector */}
        <SessionSelector 
          selectedSessionId={sessionId}
          onSessionSelect={handleSessionSelect}
        />

        {/* Loading State */}
        {loading && (
          <div className="loading">
            <p>Loading analytics data...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error">
            <p>Error: {error}</p>
          </div>
        )}

        {/* Analytics Content */}
        {analyticsData && !loading && (
          <div className="analytics-content">
            {/* Stats Panel */}
            <StatsPanel stats={analyticsData.overallStats} totalRows={analyticsData.totalRows} />

            {/* Tracking Chart */}
            <div className="chart-container">
              <h2>Position Tracking (X, Y, Z)</h2>
              <TrackingChart data={analyticsData.magnitudeTrend} />
            </div>

            {/* Magnitude Chart */}
            <div className="chart-container">
              <h2>Motion Magnitude Over Time</h2>
              <MagnitudeChart data={analyticsData.magnitudeTrend} />
            </div>

            {/* Dimension Stats Cards */}
            <div className="chart-container">
              <h2>Dimension Statistics</h2>
              <DimensionStatsCards dimensions={analyticsData.dimensions} />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!sessionId && !loading && !error && (
          <div className="empty-state">
            <p>Select a session to view analytics</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
