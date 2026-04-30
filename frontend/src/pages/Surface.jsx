import React, { useState, useEffect } from 'react';
import SessionSelector from '../components/SessionSelector';
import PCDViewer from '../components/PCDViewer';
import '../styles/Surface.css';

const Surface = () => {
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [pcdData, setPcdData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hämta PCD-data när en session är vald
  useEffect(() => {
    if (!selectedSessionId) {
      setPcdData(null);
      return;
    }

    const fetchPcdData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `http://localhost:5170/api/pcd/data/${selectedSessionId}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch PCD data: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setPcdData(data);
        } else {
          setError(data.message || 'Failed to load PCD data');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching PCD data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPcdData();
  }, [selectedSessionId]);

  return (
    <div className="surface-container">
      <div className="surface-sidebar">
        <h2>Surface Visualization</h2>
        <p className="subtitle">3D Point Cloud Visualization</p>

        <div className="session-selector-wrapper">
          <h3>Select Session</h3>
          <SessionSelector
            onSessionSelect={setSelectedSessionId}
            selectedSessionId={selectedSessionId}
          />
        </div>

        {selectedSessionId && (
          <div className="pcd-info-panel">
            {loading && (
              <div className="loading">
                <div className="spinner"></div>
                <p>Loading PCD data...</p>
              </div>
            )}

            {error && (
              <div className="error-message">
                <span>⚠️</span>
                <p>{error}</p>
              </div>
            )}

            {pcdData && !loading && (
              <div className="info-content">
                <div className="info-item">
                  <label>File Name:</label>
                  <span>{pcdData.fileName}</span>
                </div>

                <div className="info-item">
                  <label>Point Count:</label>
                  <span>{pcdData.pointCount.toLocaleString()}</span>
                </div>

                <div className="info-item">
                  <label>Valid Points:</label>
                  <span>{pcdData.validPointsRead.toLocaleString()}</span>
                </div>

                <div className="info-item">
                  <label>File Size:</label>
                  <span>{(pcdData.fileSizeBytes / 1024 / 1024).toFixed(2)} MB</span>
                </div>

                <div className="info-item">
                  <label>Uploaded:</label>
                  <span>{new Date(pcdData.uploadedAt).toLocaleString()}</span>
                </div>

                <div className="bounds-section">
                  <h4>Bounds</h4>
                  <div className="bounds-grid">
                    <div className="bound-item">
                      <label>X Min:</label>
                      <span>{pcdData.bounds.min.x.toFixed(2)}</span>
                    </div>
                    <div className="bound-item">
                      <label>X Max:</label>
                      <span>{pcdData.bounds.max.x.toFixed(2)}</span>
                    </div>
                    <div className="bound-item">
                      <label>Y Min:</label>
                      <span>{pcdData.bounds.min.y.toFixed(2)}</span>
                    </div>
                    <div className="bound-item">
                      <label>Y Max:</label>
                      <span>{pcdData.bounds.max.y.toFixed(2)}</span>
                    </div>
                    <div className="bound-item">
                      <label>Z Min:</label>
                      <span>{pcdData.bounds.min.z.toFixed(2)}</span>
                    </div>
                    <div className="bound-item">
                      <label>Z Max:</label>
                      <span>{pcdData.bounds.max.z.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="metadata-section">
                  <h4>Metadata</h4>
                  <div className="info-item">
                    <label>Version:</label>
                    <span>{pcdData.metadata.version || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <label>Width × Height:</label>
                    <span>{pcdData.metadata.width} × {pcdData.metadata.height}</span>
                  </div>
                  <div className="info-item">
                    <label>Fields:</label>
                    <span>{pcdData.metadata.fields?.join(', ') || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="surface-viewer">
        {selectedSessionId && pcdData && !loading ? (
          <PCDViewer
            vertices={pcdData.vertices}
            bounds={pcdData.bounds}
            fileName={pcdData.fileName}
          />
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h2>Select a Session</h2>
            <p>Choose a previous session from the list to view its point cloud data</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Surface;
