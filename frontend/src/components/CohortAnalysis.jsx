import React, { useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const COLORS = ['#0066cc', '#00aa00', '#ff6600', '#cc0000', '#6600cc', '#00cccc', '#ffaa00', '#cc6600'];

export default function CohortAnalysis() {
  const [cohorts, setCohorts] = useState([]);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('position');
  const [editingCohortId, setEditingCohortId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const dragCounter = useRef(0);

  // Lägg till ny cohort
  const addCohort = () => {
    const newCohort = {
      id: Date.now(),
      name: `Cohort ${cohorts.length + 1}`,
      files: []
    };
    setCohorts([...cohorts, newCohort]);
  };

  // Ta bort cohort
  const removeCohort = (cohortId) => {
    setCohorts(cohorts.filter(c => c.id !== cohortId));
  };

  // Starta edit av namn
  const startEditName = (cohortId, currentName) => {
    setEditingCohortId(cohortId);
    setEditingName(currentName);
  };

  // Spara nytt namn
  const saveEditName = (cohortId) => {
    setCohorts(cohorts.map(c => c.id === cohortId ? { ...c, name: editingName } : c));
    setEditingCohortId(null);
  };

  // Handle folder drop
  const handleFolderDrop = async (e, cohortId) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;

    console.log('Drop event triggered on cohort:', cohortId);

    const files = e.dataTransfer.files;
    const items = e.dataTransfer.items;
    
    if (!items && !files) {
      console.log('No items or files in drop');
      return;
    }

    const fileList = [];

    // Method 1: Try using items (supports folders)
    if (items && items.length > 0) {
      console.log('Using dataTransfer.items');
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            await new Promise(resolve => {
              traverseFileTree(entry, fileList, resolve);
            });
          }
        }
      }
    } else if (files && files.length > 0) {
      // Method 2: Fallback to files
      console.log('Using dataTransfer.files (fallback)');
      for (let i = 0; i < files.length; i++) {
        if (files[i].name.toLowerCase().endsWith('.csv')) {
          fileList.push(files[i]);
        }
      }
    }

    console.log('Files collected:', fileList.length);
    if (fileList.length > 0) {
      await addFilesToCohort(cohortId, fileList);
    }
  };

  // Recursive function to traverse directory tree
  const traverseFileTree = (item, fileList, callback) => {
    if (item.isFile) {
      item.file(file => {
        console.log('Found file:', file.name);
        if (file.name.toLowerCase().endsWith('.csv')) {
          fileList.push(file);
        }
        callback();
      }, err => {
        console.error('Error reading file:', err);
        callback();
      });
    } else if (item.isDirectory) {
      const reader = item.createReader();
      reader.readEntries(entries => {
        console.log('Directory entries:', entries.length);
        let entriesProcessed = 0;
        
        if (entries.length === 0) {
          callback();
          return;
        }

        entries.forEach(entry => {
          traverseFileTree(entry, fileList, () => {
            entriesProcessed++;
            if (entriesProcessed === entries.length) {
              callback();
            }
          });
        });
      }, err => {
        console.error('Error reading directory:', err);
        callback();
      });
    }
  };

  // Lägg till filer till cohort
  const addFilesToCohort = async (cohortId, fileList) => {
    setIsLoading(true);
    const uploadedSessionIds = [];

    try {
      for (const file of fileList) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('http://localhost:5170/api/fileupload/upload', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          if (data.sessionId) {
            uploadedSessionIds.push(data.sessionId);
            console.log('Uploaded file:', file.name, 'SessionId:', data.sessionId);
          }
        } else {
          console.error('Upload failed for:', file.name, 'Status:', response.status);
        }
      }

      console.log('Total uploaded:', uploadedSessionIds.length, 'files');

      // Uppdatera cohort med nya session IDs
      setCohorts(cohorts.map(c => {
        if (c.id === cohortId) {
          return {
            ...c,
            files: [...c.files, ...uploadedSessionIds]
          };
        }
        return c;
      }));

      // Uppdatera localStorage
      const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
      for (const sessionId of uploadedSessionIds) {
        const existingSession = sessions.find(s => s.id === sessionId);
        if (!existingSession) {
          sessions.unshift({
            id: sessionId,
            fileName: `File ${sessionId.slice(0, 8)}`,
            fileType: 'Unknown',
            uploadDate: new Date().toISOString()
          });
        }
      }
      localStorage.setItem('sessions', JSON.stringify(sessions.slice(0, 50)));
      
      // Notifiera om uppdatering
      window.dispatchEvent(new Event('fileUploaded'));

    } catch (err) {
      console.error('Error uploading files:', err);
      alert('Error uploading files');
    } finally {
      setIsLoading(false);
    }
  };

  // Ta bort fil från cohort
  const removeFileFromCohort = (cohortId, fileIndex) => {
    setCohorts(cohorts.map(c => {
      if (c.id === cohortId) {
        return {
          ...c,
          files: c.files.filter((_, idx) => idx !== fileIndex)
        };
      }
      return c;
    }));
  };

  // Jämför alla cohorts
  const handleCompare = async () => {
    if (cohorts.length < 2) {
      alert('Please add at least 2 cohorts');
      return;
    }

    const emptyCohorts = cohorts.filter(c => c.files.length === 0);
    if (emptyCohorts.length > 0) {
      alert('All cohorts must have at least one file');
      return;
    }

    setIsLoading(true);
    try {
      // Funktionen för att beräkna Beam On procent
      const calculateBeamOnPercentage = async (fileIds) => {
        let totalBeamOnCount = 0;
        let totalPoints = 0;

        for (const fileId of fileIds) {
          try {
            const graphRes = await fetch(`http://localhost:5170/api/comparison/file-graphs?sessionId=${fileId}`);
            const graphDataList = await graphRes.json();
            
            if (graphDataList && graphDataList.length > 0) {
              const beamOnCount = graphDataList.filter(d => d.beamOn).length;
              totalBeamOnCount += beamOnCount;
              totalPoints += graphDataList.length;
            }
          } catch (err) {
            console.error('Error fetching beam on data:', err);
          }
        }

        return totalPoints > 0 ? (totalBeamOnCount / totalPoints) * 100 : 0;
      };

      // Gör pairwise comparisons mellan cohort 1 och de andra
      const comparisons = [];
      for (let i = 1; i < cohorts.length; i++) {
        const response = await fetch('http://localhost:5170/api/comparison/group-comparison', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            groupA: cohorts[0].files,
            groupB: cohorts[i].files
          })
        });

        const data = await response.json();

        // Beräkna Beam On procent för båda grupperna
        const groupA_beamOnPercentage = await calculateBeamOnPercentage(cohorts[0].files);
        const groupB_beamOnPercentage = await calculateBeamOnPercentage(cohorts[i].files);

        comparisons.push({
          cohortA: cohorts[0].name,
          cohortB: cohorts[i].name,
          data: {
            ...data,
            groupA_beamOnPercentage,
            groupB_beamOnPercentage
          }
        });
      }

      setComparisonResult(comparisons);
    } catch (err) {
      console.error('Error comparing cohorts:', err);
      alert('Error comparing cohorts');
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (value, decimals = 2) => {
    if (value === null || value === undefined) return 'N/A';
    return parseFloat(value).toFixed(decimals);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      // Reset drag state
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1600px', margin: '0 auto' }}>
      <h1>📊 Cohort Analysis</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        {/* Vänster panel: Cohorts */}
        <div>
          <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
            <h3>Cohorts ({cohorts.length})</h3>
            {cohorts.length === 0 ? (
              <p style={{ color: '#666', marginBottom: '20px' }}>No cohorts yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                {cohorts.map((cohort, idx) => (
                  <div
                    key={cohort.id}
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => { handleDragEnter(e); }}
                    onDragLeave={(e) => { handleDragLeave(e); }}
                    onDrop={(e) => handleFolderDrop(e, cohort.id)}
                    style={{
                      backgroundColor: dragCounter.current > 0 ? '#e3f2fd' : '#fff',
                      border: '2px dashed #ddd',
                      borderRadius: '8px',
                      padding: '15px',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      borderColor: dragCounter.current > 0 ? '#007bff' : '#ddd'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '16px',
                            height: '16px',
                            backgroundColor: COLORS[idx % COLORS.length],
                            borderRadius: '3px'
                          }}
                        />
                        {editingCohortId === cohort.id ? (
                          <input
                            autoFocus
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onBlur={() => saveEditName(cohort.id)}
                            onKeyPress={(e) => e.key === 'Enter' && saveEditName(cohort.id)}
                            style={{
                              padding: '4px 8px',
                              border: '1px solid #007bff',
                              borderRadius: '4px',
                              fontSize: '14px'
                            }}
                          />
                        ) : (
                          <strong
                            onClick={() => startEditName(cohort.id, cohort.name)}
                            style={{ cursor: 'pointer', fontSize: '14px' }}
                          >
                            {cohort.name}
                          </strong>
                        )}
                      </div>
                      <button
                        onClick={() => removeCohort(cohort.id)}
                        style={{
                          padding: '4px 12px',
                          backgroundColor: '#dc3545',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Remove
                      </button>
                    </div>

                    <p style={{ fontSize: '12px', color: '#666', margin: '0 0 10px 0' }}>
                      Drag & drop CSV files or folders here
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                      {cohort.files.map((fileId, fileIdx) => {
                        const allSessions = JSON.parse(localStorage.getItem('sessions') || '[]');
                        const file = allSessions.find(s => s.id === fileId);
                        return (
                          <div
                            key={fileIdx}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '6px 8px',
                              backgroundColor: '#f9f9f9',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}
                          >
                            <span>{file?.fileName || 'Unknown'}</span>
                            <button
                              onClick={() => removeFileFromCohort(cohort.id, fileIdx)}
                              style={{
                                padding: '2px 8px',
                                backgroundColor: '#f5f5f5',
                                border: '1px solid #ddd',
                                borderRadius: '2px',
                                cursor: 'pointer',
                                fontSize: '11px'
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px', fontSize: '12px' }}>
                      <strong>{cohort.files.length} file(s)</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={addCohort}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#28a745',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginBottom: '15px'
              }}
            >
              + Add Cohort
            </button>

            <button
              onClick={handleCompare}
              disabled={isLoading || cohorts.length < 2 || cohorts.some(c => c.files.length === 0)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: cohorts.length >= 2 && cohorts.every(c => c.files.length > 0) ? '#007bff' : '#ccc',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: cohorts.length >= 2 && cohorts.every(c => c.files.length > 0) ? 'pointer' : 'not-allowed',
                fontWeight: 'bold'
              }}
            >
              {isLoading ? 'Comparing...' : 'Compare Cohorts'}
            </button>
          </div>
        </div>

        {/* Höger panel: Results */}
        <div>
          {isLoading ? (
            <div style={{ backgroundColor: '#f5f5f5', padding: '40px', textAlign: 'center', borderRadius: '8px' }}>
              <p>Loading comparison...</p>
            </div>
          ) : comparisonResult ? (
            <>
              <h2>Comparison Results</h2>

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
                    fontWeight: activeTab === 'position' ? 'bold' : 'normal'
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
                    fontWeight: activeTab === 'rotation' ? 'bold' : 'normal'
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
                    fontWeight: activeTab === 'statistics' ? 'bold' : 'normal'
                  }}
                >
                  Statistics
                </button>
              </div>

              {activeTab === 'position' && (
                <div style={{ backgroundColor: '#f0f8ff', padding: '15px', borderRadius: '8px' }}>
                  {comparisonResult.map((comparison, idx) => (
                    <div key={idx} style={{ marginBottom: '20px' }}>
                      <h4 style={{ fontSize: '14px', marginBottom: '10px' }}>
                        {comparison.cohortA} vs {comparison.cohortB}
                      </h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                          data={[
                            {
                              axis: 'X',
                              [comparison.cohortA]: parseFloat(comparison.data.groupA.x_mean),
                              [comparison.cohortB]: parseFloat(comparison.data.groupB.x_mean)
                            },
                            {
                              axis: 'Y',
                              [comparison.cohortA]: parseFloat(comparison.data.groupA.y_mean),
                              [comparison.cohortB]: parseFloat(comparison.data.groupB.y_mean)
                            },
                            {
                              axis: 'Z',
                              [comparison.cohortA]: parseFloat(comparison.data.groupA.z_mean),
                              [comparison.cohortB]: parseFloat(comparison.data.groupB.z_mean)
                            }
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="axis" />
                          <YAxis />
                          <Tooltip formatter={(value) => value.toFixed(2)} />
                          <Legend />
                          <Line type="monotone" dataKey={comparison.cohortA} stroke="#0066cc" strokeWidth={2} />
                          <Line type="monotone" dataKey={comparison.cohortB} stroke="#00aa00" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'rotation' && (
                <div style={{ backgroundColor: '#ffe8e8', padding: '15px', borderRadius: '8px' }}>
                  {comparisonResult.map((comparison, idx) => (
                    <div key={idx} style={{ marginBottom: '20px' }}>
                      <h4 style={{ fontSize: '14px', marginBottom: '10px' }}>
                        {comparison.cohortA} vs {comparison.cohortB}
                      </h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                          data={[
                            {
                              axis: 'Pitch',
                              [comparison.cohortA]: parseFloat(comparison.data.groupA.pitch_mean),
                              [comparison.cohortB]: parseFloat(comparison.data.groupB.pitch_mean)
                            },
                            {
                              axis: 'Roll',
                              [comparison.cohortA]: parseFloat(comparison.data.groupA.roll_mean),
                              [comparison.cohortB]: parseFloat(comparison.data.groupB.roll_mean)
                            },
                            {
                              axis: 'Yaw',
                              [comparison.cohortA]: parseFloat(comparison.data.groupA.yaw_mean),
                              [comparison.cohortB]: parseFloat(comparison.data.groupB.yaw_mean)
                            }
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="axis" />
                          <YAxis />
                          <Tooltip formatter={(value) => value.toFixed(2)} />
                          <Legend />
                          <Line type="monotone" dataKey={comparison.cohortA} stroke="#0066cc" strokeWidth={2} />
                          <Line type="monotone" dataKey={comparison.cohortB} stroke="#00aa00" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'statistics' && (
                <div style={{ overflowX: 'auto', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
                  {comparisonResult.map((comparison, idx) => (
                    <div key={idx} style={{ marginBottom: '30px' }}>
                      <h4 style={{ fontSize: '14px', marginBottom: '10px' }}>
                        {comparison.cohortA} vs {comparison.cohortB}
                      </h4>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#007bff', color: '#fff' }}>
                            <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Axis</th>
                            <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>{comparison.cohortA}</th>
                            <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>{comparison.cohortB}</th>
                            <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>Difference</th>
                            <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>Significant</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { axis: 'Lateral (X)', key: 'x', unit: 'mm' },
                            { axis: 'Longitudinal (Y)', key: 'y', unit: 'mm' },
                            { axis: 'Vertical (Z)', key: 'z', unit: 'mm' },
                            { axis: 'Pitch', key: 'pitch', unit: '°' },
                            { axis: 'Roll', key: 'roll', unit: '°' },
                            { axis: 'Yaw', key: 'yaw', unit: '°' }
                          ].map((row, rowIdx) => (
                            <tr key={rowIdx} style={{ backgroundColor: rowIdx % 2 === 0 ? '#fff' : '#f5f5f5' }}>
                              <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>{row.axis}</td>
                              <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                                {formatNumber(comparison.data.groupA[`${row.key}_mean`])} ± {formatNumber(comparison.data.groupA[`${row.key}_stdDev`])} {row.unit}
                              </td>
                              <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                                {formatNumber(comparison.data.groupB[`${row.key}_mean`])} ± {formatNumber(comparison.data.groupB[`${row.key}_stdDev`])} {row.unit}
                              </td>
                              <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                                {formatNumber(comparison.data.comparison[row.key].difference)} {row.unit}
                              </td>
                              <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', color: comparison.data.comparison[row.key].significant ? '#28a745' : '#dc3545' }}>
                                {comparison.data.comparison[row.key].significant ? '✓' : '✗'}
                              </td>
                            </tr>
                          ))}
                          {/* Beam On Row */}
                          <tr style={{ backgroundColor: '#fff3cd' }}>
                            <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>📡 Beam On %</td>
                            <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontSize: '13px', fontWeight: 'bold' }}>
                              {comparison.data.groupA_beamOnPercentage?.toFixed(1) || 'N/A'}%
                            </td>
                            <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontSize: '13px', fontWeight: 'bold' }}>
                              {comparison.data.groupB_beamOnPercentage?.toFixed(1) || 'N/A'}%
                            </td>
                            <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontSize: '13px' }}>
                              {comparison.data.groupA_beamOnPercentage && comparison.data.groupB_beamOnPercentage
                                ? (comparison.data.groupB_beamOnPercentage - comparison.data.groupA_beamOnPercentage).toFixed(1)
                                : 'N/A'}%
                            </td>
                            <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>-</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ backgroundColor: '#f5f5f5', padding: '40px', textAlign: 'center', borderRadius: '8px' }}>
              <p style={{ color: '#666' }}>Create cohorts and add files to compare</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
