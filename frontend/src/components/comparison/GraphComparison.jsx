import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function GraphComparison({ data }) {
  if (!data) {
    return null;
  }

  // Transform data for Recharts - combine both datasets for better comparison
  const comparisonData = [];
  const maxLength = Math.max(data.file1.length, data.file2.length);

  for (let i = 0; i < maxLength; i++) {
    const point = { index: i };
    if (i < data.file1.length) {
      point.magnitude1 = parseFloat(data.file1[i].magnitude_mm);
    }
    if (i < data.file2.length) {
      point.magnitude2 = parseFloat(data.file2[i].magnitude_mm);
    }
    comparisonData.push(point);
  }

  return (
    <div className="graph-comparison card">
      <h2>📉 Time Series Graphs</h2>
      
      <div className="graphs-container">
        <div className="graph-box">
          <h3>File A - Magnitude over time</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data.file1}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" label={{ value: 'Row Index', position: 'insideBottomRight', offset: -5 }} />
              <YAxis label={{ value: 'Magnitude (mm)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => value.toFixed(3)} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="magnitude_mm" 
                stroke="#8884d8" 
                dot={false} 
                isAnimationActive={false}
                name="Magnitude (mm)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="graph-box">
          <h3>File B - Magnitude over time</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data.file2}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" label={{ value: 'Row Index', position: 'insideBottomRight', offset: -5 }} />
              <YAxis label={{ value: 'Magnitude (mm)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => value.toFixed(3)} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="magnitude_mm" 
                stroke="#82ca9d" 
                dot={false}
                isAnimationActive={false}
                name="Magnitude (mm)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="graph-overlay-section" style={{ marginTop: '30px' }}>
        <h3>Overlay Comparison (Both Files)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="index" label={{ value: 'Row Index', position: 'insideBottomRight', offset: -5 }} />
            <YAxis label={{ value: 'Magnitude (mm)', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => (value ? value.toFixed(3) : 'N/A')} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="magnitude1" 
              stroke="#8884d8" 
              dot={false}
              isAnimationActive={false}
              name="File A"
            />
            <Line 
              type="monotone" 
              dataKey="magnitude2" 
              stroke="#82ca9d" 
              dot={false}
              isAnimationActive={false}
              name="File B"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="graph-info">
        <p>📌 <strong>File A:</strong> {data.file1.length} data points</p>
        <p>📌 <strong>File B:</strong> {data.file2.length} data points</p>
      </div>
    </div>
  );
}
