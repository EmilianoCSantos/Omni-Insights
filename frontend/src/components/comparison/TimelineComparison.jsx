import React from 'react';

export default function TimelineComparison({ data }) {
  if (!data || !data.events) return null;

  const events = data.events;

  return (
    <div className="timeline-comparison card">
      <h2>⏱️ Timeline - Major Changes</h2>

      <div className="timeline-summary">
        <p>Total data points analyzed: <strong>{data.dataPointsAnalyzed}</strong></p>
        <p>Major change events detected: <strong>{data.totalEventsFound}</strong></p>
      </div>

      {events.length === 0 ? (
        <div className="no-events">
          <p>✓ No major changes detected (jump > 2mm)</p>
        </div>
      ) : (
        <div className="timeline-container">
          <div className="timeline">
            {events.map((event, idx) => (
              <div key={idx} className="timeline-event">
                <div className="timeline-marker"></div>
                
                <div className="event-content">
                  <div className="event-header">
                    <span className="event-timestamp">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="event-index">
                      Row {event.index}
                    </span>
                    <span className={`event-badge ${getEventType(event.description)}`}>
                      {event.description}
                    </span>
                  </div>

                  <div className="event-data">
                    <div className="event-data-row">
                      <div className="data-item file-a">
                        <strong>File A Jump:</strong>
                        <span className={event.delta1 > 2 ? 'highlight' : ''}>
                          {event.delta1.toFixed(3)} mm
                        </span>
                      </div>
                      <div className="data-item file-b">
                        <strong>File B Jump:</strong>
                        <span className={event.delta2 > 2 ? 'highlight' : ''}>
                          {event.delta2.toFixed(3)} mm
                        </span>
                      </div>
                      <div className="data-item delta">
                        <strong>Jump Difference:</strong>
                        <span className={event.deltaDiff > 1 ? 'warning' : ''}>
                          {event.deltaDiff.toFixed(3)} mm
                        </span>
                      </div>
                    </div>

                    <div className="event-data-row">
                      <div className="data-item file-a">
                        <strong>File A Magnitude:</strong>
                        <span>{event.mag1.toFixed(3)} mm</span>
                      </div>
                      <div className="data-item file-b">
                        <strong>File B Magnitude:</strong>
                        <span>{event.mag2.toFixed(3)} mm</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="timeline-info">
        <p>💡 Events show rows where magnitude jumped by more than 2mm</p>
        <p>📊 Use this to identify synchronization issues or measurement anomalies</p>
      </div>
    </div>
  );
}

function getEventType(description) {
  if (description.includes('Both')) return 'both-jump';
  if (description.includes('File A')) return 'file-a-jump';
  if (description.includes('File B')) return 'file-b-jump';
  return 'other-jump';
}
