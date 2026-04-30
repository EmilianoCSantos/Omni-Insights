import React from 'react';

export default function StatsComparison({ data }) {
  if (!data) return null;

  console.log('StatsComparison data:', data);
  console.log('File1 stats:', data.file1);
  console.log('File2 stats:', data.file2);

  const formatNum = (val) => (val !== null ? val.toFixed(2) : 'N/A');
  const formatDiff = (val) => {
    const num = parseFloat(val);
    const color = Math.abs(num) > 0.5 ? '#ff6b6b' : '#51cf66';
    return <span style={{ color }}>{num > 0 ? '+' : ''}{num.toFixed(2)}</span>;
  };
  const formatTime = (seconds) => {
    if (!seconds || seconds < 0) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.round((seconds % 60) * 100) / 100;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };
  const formatTimeDiff = (seconds) => {
    if (seconds === undefined || seconds === null) return '0.00 sec';
    const absVal = Math.abs(seconds);
    if (absVal < 1) return `${seconds.toFixed(2)} sec`;
    const mins = Math.floor(absVal / 60);
    const secs = Math.round((absVal % 60) * 100) / 100;
    if (mins > 0) return `${seconds > 0 ? '+' : ''}${mins}m ${secs}s`;
    return `${seconds > 0 ? '+' : ''}${secs}s`;
  };

  return (
    <div className="stats-comparison card">
      <h2>📈 Statistical Comparison</h2>
      
      <div className="stats-grid">
        <div className="stat-box file-a">
          <h3>File A</h3>
          <table>
            <tbody>
              <tr>
                <td>Rows:</td>
                <td><strong>{data.file1.rowCount}</strong></td>
              </tr>
              <tr>
                <td>Avg X:</td>
                <td>{formatNum(data.file1.avgX)} mm</td>
              </tr>
              <tr>
                <td>Avg Y:</td>
                <td>{formatNum(data.file1.avgY)} mm</td>
              </tr>
              <tr>
                <td>Avg Z:</td>
                <td>{formatNum(data.file1.avgZ)} mm</td>
              </tr>
              <tr>
                <td>Avg Magnitude:</td>
                <td><strong>{formatNum(data.file1.avgMagnitude)} mm</strong></td>
              </tr>
              <tr className="highlight">
                <td>Time within threshold:</td>
                <td><strong>{formatTime(data.file1.timeWithinThreshold)}</strong></td>
              </tr>
              <tr className="highlight">
                <td>Total duration:</td>
                <td><strong>{formatTime(data.file1.totalDuration)}</strong></td>
              </tr>
              <tr className="highlight">
                <td>Magnitude Std Dev:</td>
                <td>{formatNum(data.file1.stdDevMagnitude)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="stat-box differences">
          <h3>Differences</h3>
          <table>
            <tbody>
              <tr>
                <td>Row Diff:</td>
                <td>{formatDiff(data.differences.rowCountDiff)}</td>
              </tr>
              <tr>
                <td>Avg X Diff:</td>
                <td>{formatDiff(data.differences.avgXDiff)}</td>
              </tr>
              <tr>
                <td>Avg Y Diff:</td>
                <td>{formatDiff(data.differences.avgYDiff)}</td>
              </tr>
              <tr>
                <td>Avg Z Diff:</td>
                <td>{formatDiff(data.differences.avgZDiff)}</td>
              </tr>
              <tr className="highlight">
                <td>Avg Magnitude Diff:</td>
                <td>{formatDiff(data.differences.avgMagnitudeDiff)}</td>
              </tr>
              <tr className="highlight">
                <td>Time within threshold Diff:</td>
                <td style={{ color: Math.abs(data.differences.timeWithinThresholdDiff) > 1 ? '#ff6b6b' : '#51cf66' }}>
                  {data.differences.timeWithinThresholdDiff > 0 ? '+' : ''}{data.differences.timeWithinThresholdDiff?.toFixed(2) || '0.00'} sec
                </td>
              </tr>
              <tr className="highlight">
                <td>Total duration Diff:</td>
                <td style={{ color: Math.abs(data.differences.totalDurationDiff) > 1 ? '#ff6b6b' : '#51cf66' }}>
                  {formatTimeDiff(data.differences.totalDurationDiff)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="stat-box file-b">
          <h3>File B</h3>
          <table>
            <tbody>
              <tr>
                <td>Rows:</td>
                <td><strong>{data.file2.rowCount}</strong></td>
              </tr>
              <tr>
                <td>Avg X:</td>
                <td>{formatNum(data.file2.avgX)} mm</td>
              </tr>
              <tr>
                <td>Avg Y:</td>
                <td>{formatNum(data.file2.avgY)} mm</td>
              </tr>
              <tr>
                <td>Avg Z:</td>
                <td>{formatNum(data.file2.avgZ)} mm</td>
              </tr>
              <tr>
                <td>Avg Magnitude:</td>
                <td><strong>{formatNum(data.file2.avgMagnitude)} mm</strong></td>
              </tr>
              <tr className="highlight">
                <td>Time within threshold:</td>
                <td><strong>{formatTime(data.file2.timeWithinThreshold)}</strong></td>
              </tr>
              <tr className="highlight">
                <td>Total duration:</td>
                <td><strong>{formatTime(data.file2.totalDuration)}</strong></td>
              </tr>
              <tr className="highlight">
                <td>Magnitude Std Dev:</td>
                <td>{formatNum(data.file2.stdDevMagnitude)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
