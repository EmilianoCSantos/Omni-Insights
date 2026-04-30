import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function GroupComparison() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [groupA, setGroupA] = useState([]);
  const [groupB, setGroupB] = useState([]);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('position'); // 'position', 'rotation', 'statistics'

  // Hämta tidigare filer från localStorage
  useEffect(() => {
    const loadFilesFromStorage = () => {
      const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
      setUploadedFiles(sessions);
    };

    loadFilesFromStorage();

    // Lyssna på custom event när ny fil uploadad
    window.addEventListener('fileUploaded', loadFilesFromStorage);
    
    return () => window.removeEventListener('fileUploaded', loadFilesFromStorage);
  }, []);

  // Toggle fil i Grupp A
  const toggleGroupA = (fileId) => {
    setGroupA(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  // Toggle fil i Grupp B
  const toggleGroupB = (fileId) => {
    setGroupB(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  // Utför jämföring
  const handleCompare = async () => {
    if (groupA.length === 0 || groupB.length === 0) {
      alert('Please select at least one file in each group');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5170/api/comparison/group-comparison', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          groupA: groupA,
          groupB: groupB
        })
      });

      const data = await response.json();
      setComparisonResult(data);
    } catch (err) {
      console.error('Error comparing groups:', err);
      alert('Error comparing groups');
    } finally {
      setIsLoading(false);
    }
  };

  // Formatera nummer
  const formatNumber = (value, decimals = 2) => {
    if (value === null || value === undefined) return 'N/A';
    return parseFloat(value).toFixed(decimals);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1600px', margin: '0 auto' }}>
      <h1>📊 Group Comparison</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '20px' }}>
        {/* Grupp A */}
        <div style={{ backgroundColor: '#f0f8ff', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ color: '#0066cc' }}>Group A</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
            {uploadedFiles.map((file) => (
              <label key={file.id} style={{ display: 'flex', alignItems: 'center', padding: '8px', backgroundColor: '#fff', borderRadius: '4px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={groupA.includes(file.id)}
                  onChange={() => toggleGroupA(file.id)}
                  style={{ marginRight: '10px', cursor: 'pointer' }}
                />
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{file.fileName}</div>
                  <small style={{ opacity: 0.7 }}>{file.fileType}</small>
                </div>
              </label>
            ))}
          </div>
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e0ebff', borderRadius: '4px' }}>
            <strong>Selected: {groupA.length} file(s)</strong>
          </div>
        </div>

        {/* Grupp B */}
        <div style={{ backgroundColor: '#f0fff0', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ color: '#009900' }}>Group B</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
            {uploadedFiles.map((file) => (
              <label key={file.id} style={{ display: 'flex', alignItems: 'center', padding: '8px', backgroundColor: '#fff', borderRadius: '4px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={groupB.includes(file.id)}
                  onChange={() => toggleGroupB(file.id)}
                  style={{ marginRight: '10px', cursor: 'pointer' }}
                />
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{file.fileName}</div>
                  <small style={{ opacity: 0.7 }}>{file.fileType}</small>
                </div>
              </label>
            ))}
          </div>
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e0ffe0', borderRadius: '4px' }}>
            <strong>Selected: {groupB.length} file(s)</strong>
          </div>
        </div>

        {/* Jämföringsknapp */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '10px' }}>
          <button
            onClick={handleCompare}
            disabled={isLoading || groupA.length === 0 || groupB.length === 0}
            style={{
              padding: '15px 20px',
              backgroundColor: groupA.length > 0 && groupB.length > 0 ? '#007bff' : '#ccc',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: groupA.length > 0 && groupB.length > 0 ? 'pointer' : 'not-allowed',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            {isLoading ? 'Comparing...' : 'Compare Groups'}
          </button>
          
          <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px', fontSize: '12px', color: '#666' }}>
            <div>Group A: {groupA.length} file(s), {comparisonResult?.groupADataPoints || 0} data points</div>
            <div>Group B: {groupB.length} file(s), {comparisonResult?.groupBDataPoints || 0} data points</div>
          </div>
        </div>
      </div>

      {/* Resultat */}
      {comparisonResult && (
        <div style={{ marginTop: '40px' }}>
          <h2>Comparison Results</h2>

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

          {/* Position Tab */}
          {activeTab === 'position' && (
            <div style={{ backgroundColor: '#f0f8ff', padding: '15px', borderRadius: '8px' }}>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={[
                    {
                      axis: 'Lateral (X)',
                      'Group A': parseFloat(comparisonResult.groupA.x_mean),
                      'Group B': parseFloat(comparisonResult.groupB.x_mean),
                      unit: 'mm'
                    },
                    {
                      axis: 'Longitudinal (Y)',
                      'Group A': parseFloat(comparisonResult.groupA.y_mean),
                      'Group B': parseFloat(comparisonResult.groupB.y_mean),
                      unit: 'mm'
                    },
                    {
                      axis: 'Vertical (Z)',
                      'Group A': parseFloat(comparisonResult.groupA.z_mean),
                      'Group B': parseFloat(comparisonResult.groupB.z_mean),
                      unit: 'mm'
                    }
                  ]}
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="axis" />
                  <YAxis label={{ value: 'Mean Value (mm)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => value.toFixed(2)} />
                  <Legend />
                  <Line type="monotone" dataKey="Group A" stroke="#0066cc" strokeWidth={2} />
                  <Line type="monotone" dataKey="Group B" stroke="#00aa00" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Rotation Tab */}
          {activeTab === 'rotation' && (
            <div style={{ backgroundColor: '#ffe8e8', padding: '15px', borderRadius: '8px' }}>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={[
                    {
                      axis: 'Pitch',
                      'Group A': parseFloat(comparisonResult.groupA.pitch_mean),
                      'Group B': parseFloat(comparisonResult.groupB.pitch_mean),
                      unit: '°'
                    },
                    {
                      axis: 'Roll',
                      'Group A': parseFloat(comparisonResult.groupA.roll_mean),
                      'Group B': parseFloat(comparisonResult.groupB.roll_mean),
                      unit: '°'
                    },
                    {
                      axis: 'Yaw',
                      'Group A': parseFloat(comparisonResult.groupA.yaw_mean),
                      'Group B': parseFloat(comparisonResult.groupB.yaw_mean),
                      unit: '°'
                    }
                  ]}
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="axis" />
                  <YAxis label={{ value: 'Mean Value (°)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => value.toFixed(2)} />
                  <Legend />
                  <Line type="monotone" dataKey="Group A" stroke="#0066cc" strokeWidth={2} />
                  <Line type="monotone" dataKey="Group B" stroke="#00aa00" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'statistics' && (
            <div style={{ overflowX: 'auto', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#007bff', color: '#fff' }}>
                    <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Axis</th>
                    <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}>Group A (Mean ± SD)</th>
                    <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}>Group B (Mean ± SD)</th>
                    <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}>Difference</th>
                    <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}>Significant</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Position Axes */}
                  <tr style={{ backgroundColor: '#fff' }}>
                    <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>Lateral (X)</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {formatNumber(comparisonResult.groupA.x_mean)} ± {formatNumber(comparisonResult.groupA.x_stdDev)} mm
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {formatNumber(comparisonResult.groupB.x_mean)} ± {formatNumber(comparisonResult.groupB.x_stdDev)} mm
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {formatNumber(comparisonResult.comparison.x.difference)} mm
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', color: comparisonResult.comparison.x.significant ? '#28a745' : '#dc3545' }}>
                      {comparisonResult.comparison.x.significant ? '✓' : '✗'}
                    </td>
                  </tr>

                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>Longitudinal (Y)</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {formatNumber(comparisonResult.groupA.y_mean)} ± {formatNumber(comparisonResult.groupA.y_stdDev)} mm
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {formatNumber(comparisonResult.groupB.y_mean)} ± {formatNumber(comparisonResult.groupB.y_stdDev)} mm
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {formatNumber(comparisonResult.comparison.y.difference)} mm
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', color: comparisonResult.comparison.y.significant ? '#28a745' : '#dc3545' }}>
                      {comparisonResult.comparison.y.significant ? '✓' : '✗'}
                    </td>
                  </tr>

                  <tr style={{ backgroundColor: '#fff' }}>
                    <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>Vertical (Z)</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {formatNumber(comparisonResult.groupA.z_mean)} ± {formatNumber(comparisonResult.groupA.z_stdDev)} mm
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {formatNumber(comparisonResult.groupB.z_mean)} ± {formatNumber(comparisonResult.groupB.z_stdDev)} mm
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {formatNumber(comparisonResult.comparison.z.difference)} mm
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', color: comparisonResult.comparison.z.significant ? '#28a745' : '#dc3545' }}>
                      {comparisonResult.comparison.z.significant ? '✓' : '✗'}
                    </td>
                  </tr>

                  {/* Rotation Axes */}
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>Pitch</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {formatNumber(comparisonResult.groupA.pitch_mean)} ± {formatNumber(comparisonResult.groupA.pitch_stdDev)} °
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {formatNumber(comparisonResult.groupB.pitch_mean)} ± {formatNumber(comparisonResult.groupB.pitch_stdDev)} °
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {formatNumber(comparisonResult.comparison.pitch.difference)} °
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', color: comparisonResult.comparison.pitch.significant ? '#28a745' : '#dc3545' }}>
                      {comparisonResult.comparison.pitch.significant ? '✓' : '✗'}
                    </td>
                  </tr>

                  <tr style={{ backgroundColor: '#fff' }}>
                    <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>Roll</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {formatNumber(comparisonResult.groupA.roll_mean)} ± {formatNumber(comparisonResult.groupA.roll_stdDev)} °
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {formatNumber(comparisonResult.groupB.roll_mean)} ± {formatNumber(comparisonResult.groupB.roll_stdDev)} °
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {formatNumber(comparisonResult.comparison.roll.difference)} °
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', color: comparisonResult.comparison.roll.significant ? '#28a745' : '#dc3545' }}>
                      {comparisonResult.comparison.roll.significant ? '✓' : '✗'}
                    </td>
                  </tr>

                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>Yaw</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {formatNumber(comparisonResult.groupA.yaw_mean)} ± {formatNumber(comparisonResult.groupA.yaw_stdDev)} °
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {formatNumber(comparisonResult.groupB.yaw_mean)} ± {formatNumber(comparisonResult.groupB.yaw_stdDev)} °
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {formatNumber(comparisonResult.comparison.yaw.difference)} °
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', color: comparisonResult.comparison.yaw.significant ? '#28a745' : '#dc3545' }}>
                      {comparisonResult.comparison.yaw.significant ? '✓' : '✗'}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px', fontSize: '12px' }}>
                <strong>Legend:</strong> ✓ = statistically significant difference, ✗ = not significant
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
