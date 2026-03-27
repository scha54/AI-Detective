import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import AccusationPanel from '../components/AccusationPanel';

export default function Game({ caseData, onAccuse }) {
  const [selectedSuspect, setSelectedSuspect] = useState(null);
  const [histories, setHistories] = useState({});
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAccuse, setShowAccuse] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [histories, selectedSuspect, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !selectedSuspect || isTyping) return;
    const msg = input.trim();
    const sId = selectedSuspect.id;
    setInput('');
    setIsTyping(true);

    setHistories(prev => ({
      ...prev,
      [sId]: [...(prev[sId] || []), { role: 'user', text: msg }]
    }));

    try {
      const res = await api.interrogate(sId, msg);
      setHistories(prev => ({
        ...prev,
        [sId]: [...(prev[sId] || []), { role: 'suspect', text: res.response }]
      }));
    } catch (e) {
      setHistories(prev => ({
        ...prev,
        [sId]: [...(prev[sId] || []), { role: 'suspect', text: "(Error reaching suspect)" }]
      }));
    } finally {
      setIsTyping(false);
    }
  };

  const currentHistory = selectedSuspect ? (histories[selectedSuspect.id] || []) : [];

  return (
    <div className="app-container">
      <header>
        <p style={{ fontSize: '1.2rem', color: '#ccc', marginBottom: '1rem' }}>{caseData.case_summary}</p>
        <p><strong>Victim:</strong> {caseData.victim}</p>
      </header>

      <div className="main-content">
        <div className="suspect-list">
          {caseData.suspects.map(s => (
            <div 
              key={s.id} 
              className={`suspect-card ${selectedSuspect?.id === s.id ? 'selected' : ''}`}
              onClick={() => setSelectedSuspect(s)}
            >
              <h3>{s.name}</h3>
              <p>{s.identity}</p>
            </div>
          ))}
          <button className="accuse-btn" onClick={() => setShowAccuse(true)}>Make Accusation</button>
        </div>

        <div className="chat-container">
          {selectedSuspect ? (
            <>
              <div className="chat-header">
                <h3>Interrogating: {selectedSuspect.name}</h3>
              </div>
              <div className="chat-messages">
                {currentHistory.length === 0 && (
                  <p style={{ textAlign: 'center', color: '#888', marginTop: 'auto' }}>
                    Ask a question to begin...
                  </p>
                )}
                {currentHistory.map((m, i) => (
                  <div key={i} className={`message ${m.role} ${m.role === 'suspect' ? 'model' : 'user'}`}>
                    <p>{m.text}</p>
                  </div>
                ))}
                {isTyping && <div className="message suspect typing"><p>Suspect is thinking...</p></div>}
                <div ref={scrollRef} />
              </div>
              <div className="chat-input">
                <input 
                  value={input} 
                  onChange={e => setInput(e.target.value)} 
                  disabled={isTyping}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask a question..."
                />
                <button onClick={handleSend} disabled={isTyping || !input.trim()}>Send</button>
              </div>
            </>
          ) : (
            <div style={{margin:'auto', color:'#888'}}>Select a suspect to interrogate.</div>
          )}
        </div>
      </div>

      {showAccuse && (
        <AccusationPanel 
          suspects={caseData.suspects} 
          onCancel={() => setShowAccuse(false)} 
          onComplete={onAccuse} 
        />
      )}
    </div>
  );
}
