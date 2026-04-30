import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

function TrackingChart({ data }) {
  if (!data || data.length === 0) {
    return <div>No data available for tracking chart</div>;
  }

  // Vi ska visa X, Y, Z som separate lines
  // Men vi har bara Magnitude i magnitudeTrend
  // Vi behöver den raw tracking data från analyticsen
  // För nu visar vi bara Magnitude som en proxy

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="index" 
          label={{ value: 'Sample Index', position: 'insideBottomRight', offset: -5 }}
        />
        <YAxis 
          label={{ value: 'Position (mm)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          formatter={(value) => value.toFixed(2)}
          labelFormatter={(label) => `Sample ${label}`}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="magnitude"
          stroke="#667eea"
          dot={false}
          isAnimationActive={false}
          name="Magnitude (mm)"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default TrackingChart;
