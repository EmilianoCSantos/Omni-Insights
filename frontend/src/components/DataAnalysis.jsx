import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import FileUploadDropZone from './FileUploadDropZone';

export default function DataAnalysis() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileStats, setFileStats] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [yAxisDomain, setYAxisDomain] = useState([]);
  const [chartBackgroundColor, setChartBackgroundColor] = useState('#fff');
  const [activeTab, setActiveTab] = useState('position'); // 'position', 'rotation', 'statistics'

  // Hämta tidigare filer från localStorage
  useEffect(() => {
    const loadFilesFromStorage = () => {
      const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
      setUploadedFiles(sessions);
    };

    // Läs från localStorage på mount
    loadFilesFromStorage();

    // Lyssna på custom event när ny fil uploadad
    window.addEventListener('fileUploaded', loadFilesFromStorage);
    
    return () => window.removeEventListener('fileUploaded', loadFilesFromStorage);
  }, []);

  // Ladda fil när den är vald
  const handleSelectFile = useCallback(async (fileId) => {
    setIsLoading(true);
    setSelectedFile(fileId);
    
    try {
      // Hämta statistik
      const statsRes = await fetch(`http://localhost:5170/api/comparison/file-stats?sessionId=${fileId}`);
      const statsData = await statsRes.json();
      setFileStats(statsData);

      // Hämta grafer
      const graphRes = await fetch(`http://localhost:5170/api/comparison/file-graphs?sessionId=${fileId}`);
      const graphDataList = await graphRes.json();
      
      // Omvandla till rätt format för Recharts (med index för x-axel)
      const formattedData = graphDataList.map((point, index) => ({
        index,
        timestamp: new Date(point.timestamp).toLocaleTimeString(),
        x_mm: parseFloat(point.x_mm),
        y_mm: parseFloat(point.y_mm),
        z_mm: parseFloat(point.z_mm),
        magnitude_mm: parseFloat(point.magnitude_mm),
        pitch_deg: parseFloat(point.pitch_deg),
        roll_deg: parseFloat(point.roll_deg),
        yaw_deg: parseFloat(point.yaw_deg),
        beamOn: point.beamOn || false
      }));
      
      // Beräkna bakgrundsfärg baserat på BeamOn status
      const beamOnCount = formattedData.filter(d => d.beamOn).length;
      const beamOnPercentage = (beamOnCount / formattedData.length) * 100;
      
      // Om mer än 50% är BeamOn, använd ljusgrön, annars vit
      const bgColor = beamOnPercentage > 50 ? '#f0fff0' : '#fff';
      setChartBackgroundColor(bgColor);
      
      setGraphData(formattedData);
    } catch (err) {
      console.error('Error loading file data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);



  const formatTime = (seconds) => {
    if (!seconds || seconds < 0) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.round((seconds % 60) * 100) / 100;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  // Beräkna standardavvikelse
  const calculateStdDev = (values) => {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  };

  // Beräkna statistik för en axis
  const calculateAxisStats = () => {
    if (!graphData || graphData.length === 0) return null;

    const tolerance = {
      position: 2, // mm
      rotation: 2  // grader
    };

    const stats = {
      x: {
        name: 'Lateral (X)',
        unit: 'mm',
        mean: fileStats?.avgX || 0,
        maxAbs: Math.max(...graphData.map(d => Math.abs(d.x_mm))),
        stdDev: calculateStdDev(graphData.map(d => d.x_mm)),
        inTolerance: (graphData.filter(d => Math.abs(d.x_mm) < tolerance.position).length / graphData.length) * 100
      },
      y: {
        name: 'Longitudinal (Y)',
        unit: 'mm',
        mean: fileStats?.avgY || 0,
        maxAbs: Math.max(...graphData.map(d => Math.abs(d.y_mm))),
        stdDev: calculateStdDev(graphData.map(d => d.y_mm)),
        inTolerance: (graphData.filter(d => Math.abs(d.y_mm) < tolerance.position).length / graphData.length) * 100
      },
      z: {
        name: 'Vertical (Z)',
        unit: 'mm',
        mean: fileStats?.avgZ || 0,
        maxAbs: Math.max(...graphData.map(d => Math.abs(d.z_mm))),
        stdDev: calculateStdDev(graphData.map(d => d.z_mm)),
        inTolerance: (graphData.filter(d => Math.abs(d.z_mm) < tolerance.position).length / graphData.length) * 100
      },
      pitch: {
        name: 'Pitch',
        unit: '°',
        mean: Math.abs(graphData.reduce((sum, d) => sum + d.pitch_deg, 0) / graphData.length),
        maxAbs: Math.max(...graphData.map(d => Math.abs(d.pitch_deg))),
        stdDev: calculateStdDev(graphData.map(d => d.pitch_deg)),
        inTolerance: (graphData.filter(d => Math.abs(d.pitch_deg) < tolerance.rotation).length / graphData.length) * 100
      },
      roll: {
        name: 'Roll',
        unit: '°',
        mean: Math.abs(graphData.reduce((sum, d) => sum + d.roll_deg, 0) / graphData.length),
        maxAbs: Math.max(...graphData.map(d => Math.abs(d.roll_deg))),
        stdDev: calculateStdDev(graphData.map(d => d.roll_deg)),
        inTolerance: (graphData.filter(d => Math.abs(d.roll_deg) < tolerance.rotation).length / graphData.length) * 100
      },
      yaw: {
        name: 'Yaw',
        unit: '°',
        mean: Math.abs(graphData.reduce((sum, d) => sum + d.yaw_deg, 0) / graphData.length),
        maxAbs: Math.max(...graphData.map(d => Math.abs(d.yaw_deg))),
        stdDev: calculateStdDev(graphData.map(d => d.yaw_deg)),
        inTolerance: (graphData.filter(d => Math.abs(d.yaw_deg) < tolerance.rotation).length / graphData.length) * 100
      }
    };

    return stats;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>📊 Data Analysis</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        {/* Vänster panel: Upload och filhistorik */}
        <div>
          <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
            <h2>Upload New File</h2>
            <FileUploadDropZone showFileList={false} hideTitle={true} />
          </div>

          {/* Filhistorik */}
          <div style={{ marginTop: '20px', backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
            <h3>Uploaded Files</h3>
            {uploadedFiles.length === 0 ? (
              <p style={{ color: '#666' }}>No files uploaded yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {uploadedFiles.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => handleSelectFile(file.id)}
                    style={{
                      padding: '10px 15px',
                      backgroundColor: selectedFile === file.id ? '#007bff' : '#fff',
                      color: selectedFile === file.id ? '#fff' : '#000',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.3s'
                    }}
                  >
                    <div style={{ fontWeight: 'bold' }}>
                      {file.fileName}
                      {file.fileType && (
                        <span style={{ fontWeight: 'normal', fontSize: '12px', marginLeft: '8px', opacity: 0.8 }}>
                          ({file.fileType})
                        </span>
                      )}
                    </div>
                    <small style={{ opacity: 0.7 }}>
                      {new Date(file.uploadDate).toLocaleString()}
                    </small>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Höger panel: Statistik och grafer */}
        <div>
          {isLoading ? (
            <p>Loading file data...</p>
          ) : selectedFile && fileStats ? (
            <>
              {/* Statistik */}
              <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3>📈 File Statistics</h3>
                <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e8f4f8', borderRadius: '4px' }}>
                  <strong>File:</strong> {fileStats.fileName}
                  {fileStats.fileType && (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      Type: {fileStats.fileType}
                    </div>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                  <div><strong>Rows:</strong> {fileStats.rowCount}</div>
                  <div><strong>Avg X:</strong> {fileStats.avgX?.toFixed(2)} mm</div>
                  <div><strong>Avg Y:</strong> {fileStats.avgY?.toFixed(2)} mm</div>
                  <div><strong>Avg Z:</strong> {fileStats.avgZ?.toFixed(2)} mm</div>
                  <div><strong>Avg Magnitude:</strong> {fileStats.avgMagnitude?.toFixed(2)} mm</div>
                  <div style={{ gridColumn: '1 / -1', backgroundColor: '#fffacd', padding: '10px', borderRadius: '4px', marginTop: '10px' }}>
                    <strong>⏱️ Time within threshold:</strong> {formatTime(fileStats.timeWithinThreshold)}
                  </div>
                  <div style={{ gridColumn: '1 / -1', backgroundColor: '#e8f4f8', padding: '10px', borderRadius: '4px' }}>
                    <strong>⏱️ Total duration:</strong> {formatTime(fileStats.totalDuration)}
                  </div>
                </div>
              </div>

              {/* Grafer med tabbar */}
              {graphData && graphData.length > 0 ? (
                <div>
                  <h3>📊 Movement Over Time</h3>
                  
                  {/* Tabbknappar */}
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', borderBottom: '2px solid #ddd' }}>
                    <button
                      onClick={() => setActiveTab('position')}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: activeTab === 'position' ? '#007bff' : '#f5f5f5',
                        color: activeTab === 'position' ? '#fff' : '#000',
                        border: 'none',
                        borderBottom: activeTab === 'position' ? '3px solid #0056b3' : 'none',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'position' ? 'bold' : 'normal',
                        transition: 'all 0.3s'
                      }}
                    >
                      Position (X/Y/Z)
                    </button>
                    <button
                      onClick={() => setActiveTab('rotation')}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: activeTab === 'rotation' ? '#007bff' : '#f5f5f5',
                        color: activeTab === 'rotation' ? '#fff' : '#000',
                        border: 'none',
                        borderBottom: activeTab === 'rotation' ? '3px solid #0056b3' : 'none',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'rotation' ? 'bold' : 'normal',
                        transition: 'all 0.3s'
                      }}
                    >
                      Rotation (Pitch/Roll/Yaw)
                    </button>
                    <button
                      onClick={() => setActiveTab('statistics')}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: activeTab === 'statistics' ? '#007bff' : '#f5f5f5',
                        color: activeTab === 'statistics' ? '#fff' : '#000',
                        border: 'none',
                        borderBottom: activeTab === 'statistics' ? '3px solid #0056b3' : 'none',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'statistics' ? 'bold' : 'normal',
                        transition: 'all 0.3s'
                      }}
                    >
                      Statistics
                    </button>
                  </div>

                  {/* Position Graf */}
                  {activeTab === 'position' && (
                    <div style={{ backgroundColor: chartBackgroundColor, padding: '15px', borderRadius: '8px' }}>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={graphData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="timestamp" 
                            label={{ value: 'Time', position: 'insideBottomRight', offset: -5 }}
                            tick={{ fontSize: 11 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis 
                            domain={yAxisDomain.length > 0 ? yAxisDomain : ['auto', 'auto']}
                            tickFormatter={(value) => value.toFixed(1)}
                            label={{ value: 'Position (mm)', angle: -90, position: 'insideLeft' }} 
                          />
                          <Tooltip 
                            formatter={(value) => value.toFixed(2)}
                            labelFormatter={(label) => `Point ${label}`}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="x_mm" stroke="#ff7300" dot={false} name="X (mm)" strokeWidth={2} />
                          <Line type="monotone" dataKey="y_mm" stroke="#0088fe" dot={false} name="Y (mm)" strokeWidth={2} />
                          <Line type="monotone" dataKey="z_mm" stroke="#00c49f" dot={false} name="Z (mm)" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Rotation Graf */}
                  {activeTab === 'rotation' && (
                    <div style={{ backgroundColor: '#f0f8ff', padding: '15px', borderRadius: '8px' }}>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={graphData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="timestamp" 
                            label={{ value: 'Time', position: 'insideBottomRight', offset: -5 }}
                            tick={{ fontSize: 11 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis 
                            tickFormatter={(value) => value.toFixed(1)}
                            label={{ value: 'Rotation (degrees)', angle: -90, position: 'insideLeft' }} 
                          />
                          <Tooltip 
                            formatter={(value) => value.toFixed(2)}
                            labelFormatter={(label) => `Point ${label}`}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="pitch_deg" stroke="#ff4444" dot={false} name="Pitch (°)" strokeWidth={2} />
                          <Line type="monotone" dataKey="roll_deg" stroke="#44ff44" dot={false} name="Roll (°)" strokeWidth={2} />
                          <Line type="monotone" dataKey="yaw_deg" stroke="#4444ff" dot={false} name="Yaw (°)" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Statistics Tab */}
                  {activeTab === 'statistics' && (() => {
                    const axisStats = calculateAxisStats();
                    if (!axisStats) return <p>No data available</p>;

                    return (
                      <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#007bff', color: '#fff' }}>
                              <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Axis</th>
                              <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}>Mean</th>
                              <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}>Max |x|</th>
                              <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}>Std Dev</th>
                              <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}>% In Tol.</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[axisStats.x, axisStats.y, axisStats.z, axisStats.pitch, axisStats.roll, axisStats.yaw].map((stat, idx) => (
                              <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f5f5f5' }}>
                                <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>{stat.name}</td>
                                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                                  {stat.mean.toFixed(2)} {stat.unit}
                                </td>
                                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                                  {stat.maxAbs.toFixed(2)} {stat.unit}
                                </td>
                                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                                  {stat.stdDev.toFixed(2)} {stat.unit}
                                </td>
                                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold', color: stat.inTolerance >= 95 ? '#28a745' : stat.inTolerance >= 80 ? '#ffc107' : '#dc3545' }}>
                                  {stat.inTolerance.toFixed(1)}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <p>No graph data available</p>
              )}
            </>
          ) : (
            <div style={{ backgroundColor: '#f5f5f5', padding: '40px', textAlign: 'center', borderRadius: '8px' }}>
              <p style={{ color: '#666' }}>Select a file or upload a new one to see analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
