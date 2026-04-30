import React, { useState } from 'react';

export default function RowDifferencesComparison({ data }) {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [sortBy, setSortBy] = useState('magnitude');
  const [sortOrder, setSortOrder] = useState('desc');

  if (!data || !data.differences) return null;

  const sortedDifferences = [...data.differences].sort((a, b) => {
    let aVal, bVal;
    
    switch (sortBy) {
      case 'magnitude':
        aVal = Math.abs(a.magnitudeDiff);
        bVal = Math.abs(b.magnitudeDiff);
        break;
      case 'x':
        aVal = Math.abs(a.xDiff);
        bVal = Math.abs(b.xDiff);
        break;
      case 'y':
        aVal = Math.abs(a.yDiff);
        bVal = Math.abs(b.yDiff);
        break;
      case 'z':
        aVal = Math.abs(a.zDiff);
        bVal = Math.abs(b.zDiff);
        break;
      default:
        aVal = a.rowIndex;
        bVal = b.rowIndex;
    }

    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const outOfTolerance = sortedDifferences.filter(d => d.exceedsTolerance).length;

  const toggleRow = (index) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setExpandedRows(newSet);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  return (
    <div className="row-differences card">
      <h2>🔍 Row-by-Row Differences</h2>

      <div className="comparison-summary">
        <p>Total rows compared: <strong>{data.totalCompared}</strong></p>
        <p>
          Out of tolerance (>5mm): 
          <strong style={{ color: outOfTolerance > 0 ? '#ff6b6b' : '#51cf66' }}>
            {outOfTolerance}
          </strong>
        </p>
      </div>

      <div className="table-wrapper">
        <table className="differences-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>#</th>
              <th 
                onClick={() => handleSort('x')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                ΔX (mm) {sortBy === 'x' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th 
                onClick={() => handleSort('y')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                ΔY (mm) {sortBy === 'y' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th 
                onClick={() => handleSort('z')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                ΔZ (mm) {sortBy === 'z' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th 
                onClick={() => handleSort('magnitude')}
                style={{ cursor: 'pointer', userSelect: 'none', fontWeight: 'bold' }}
              >
                ΔMagnitude (mm) {sortBy === 'magnitude' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th style={{ width: '100px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedDifferences.map((diff, idx) => (
              <React.Fragment key={diff.rowIndex}>
                <tr 
                  className={diff.exceedsTolerance ? 'out-of-tolerance' : 'in-tolerance'}
                  onClick={() => toggleRow(diff.rowIndex)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{diff.rowIndex}</td>
                  <td>{diff.xDiff.toFixed(3)}</td>
                  <td>{diff.yDiff.toFixed(3)}</td>
                  <td>{diff.zDiff.toFixed(3)}</td>
                  <td style={{ fontWeight: 'bold' }}>
                    {diff.magnitudeDiff.toFixed(3)}
                  </td>
                  <td>
                    {diff.exceedsTolerance ? (
                      <span className="badge-danger">⚠️ OUT</span>
                    ) : (
                      <span className="badge-success">✓ OK</span>
                    )}
                  </td>
                </tr>
                {expandedRows.has(diff.rowIndex) && (
                  <tr className="detail-row">
                    <td colSpan="6">
                      <div className="detail-content">
                        <p><strong>Timestamp A:</strong> {new Date(diff.timestamp1).toLocaleTimeString()}</p>
                        <p><strong>Timestamp B:</strong> {new Date(diff.timestamp2).toLocaleTimeString()}</p>
                        <p>
                          <strong>Magnitude A:</strong> (calculated from X, Y, Z) <br />
                          <strong>Magnitude B:</strong> (calculated from X, Y, Z)
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-info">
        <p>💡 Click rows to expand details. Sort by clicking column headers.</p>
        <p>⚠️ Rows with Magnitude difference > 5mm are highlighted.</p>
      </div>
    </div>
  );
}
