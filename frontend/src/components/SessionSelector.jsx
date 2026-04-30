import React, { useState, useEffect } from 'react';

function SessionSelector({ onSessionSelect, selectedSessionId }) {
  const [sessions, setSessions] = useState([]);
  const [inputValue, setInputValue] = useState(selectedSessionId || '');

  // Ladda tidigare sessioner från localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('sessions');
    if (savedSessions) {
      try {
        setSessions(JSON.parse(savedSessions));
      } catch (error) {
        console.error('Error parsing sessions from localStorage:', error);
        setSessions([]);
      }
    }
  }, []);

  const handleSelectChange = (e) => {
    const selected = e.target.value;
    setInputValue(selected);
    onSessionSelect(selected);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputSubmit = () => {
    if (inputValue.trim()) {
      onSessionSelect(inputValue.trim());
    }
  };

  return (
    <div className="session-selector">
      <h3>Select or Enter Session ID</h3>
      
      <div className="selector-inputs">
        {/* Dropdown with previous sessions */}
        {Array.isArray(sessions) && sessions.length > 0 && (
          <select value={selectedSessionId || ''} onChange={handleSelectChange} className="session-dropdown">
            <option value="">-- Choose from recent sessions --</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.fileName} ({session.id.substring(0, 8)}...)
              </option>
            ))}
          </select>
        )}

        {/* Or enter manually */}
        <div className="manual-input">
          <input
            type="text"
            placeholder="Or paste SessionId here..."
            value={inputValue}
            onChange={handleInputChange}
            className="session-input"
          />
          <button onClick={handleInputSubmit} className="session-button">
            Load Data
          </button>
        </div>
      </div>
    </div>
  );
}

export default SessionSelector;
