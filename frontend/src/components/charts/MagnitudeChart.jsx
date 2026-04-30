import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

function MagnitudeChart({ data }) {
  if (!data || data.length === 0) {
    return <div>No data available for magnitude chart</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart
        data={data}
        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
      >
        <defs>
          <linearGradient id="colorMagnitude" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="index" 
          label={{ value: 'Sample Index', position: 'insideBottomRight', offset: -5 }}
        />
        <YAxis 
          label={{ value: 'Magnitude (mm)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          formatter={(value) => value.toFixed(2)}
          labelFormatter={(label) => `Sample ${label}`}
        />
        <Area
          type="monotone"
          dataKey="magnitude"
          stroke="#667eea"
          fillOpacity={1}
          fill="url(#colorMagnitude)"
          isAnimationActive={false}
          name="Magnitude (mm)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default MagnitudeChart;
