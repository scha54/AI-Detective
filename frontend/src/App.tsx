import { useState, useEffect, useRef } from 'react';
import { API, GameInitResponse, Suspect, Message } from './api';
import './index.css';

function App() {
  const [gameState, setGameState] = useState<GameInitResponse | null>(null);
  const [selectedSuspect, setSelectedSuspect] = useState<Suspect | null>(null);
  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>({});
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAccuseModal, setShowAccuseModal] = useState(false);
  const [gameResult, setGameResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    API.getInit().then(data => setGameState(data)).catch(console.error);
  }, []);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistories, selectedSuspect, isTyping]);

  if (!gameState) return <div style={{color:'white', padding: '2rem'}}>Loading Case Files...</div>;

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedSuspect || isTyping || gameResult) return;

    const messageText = inputText.trim();
    const suspectId = selectedSuspect.id;
    
    setInputText('');
    
    // Add user message to history
    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: messageText };
    setChatHistories(prev => ({
      ...prev,
      [suspectId]: [...(prev[suspectId] || []), userMessage]
    }));

    setIsTyping(true);

    try {
      const res = await API.chat(suspectId, messageText);
      const suspectMsg: Message = { id: Date.now().toString() + 's', role: 'suspect', text: res.response };
      
      setChatHistories(prev => ({
        ...prev,
        [suspectId]: [...(prev[suspectId] || []), suspectMsg]
      }));
    } catch (e) {
      console.error(e);
      setChatHistories(prev => ({
        ...prev,
        [suspectId]: [...(prev[suspectId] || []), { id: Date.now()+'e', role: 'suspect', text: "*Silence... something went wrong.*" }]
      }));
    } finally {
      setIsTyping(false);
    }
  };

  const handleAccuse = async (suspectId: string, reason: string) => {
    setShowAccuseModal(false);
    try {
      const result = await API.accuse(suspectId, reason);
      setGameResult(result);
    } catch (e) {
      console.error(e);
    }
  };

  const currentHistory = selectedSuspect ? (chatHistories[selectedSuspect.id] || []) : [];

  return (
    <div className="app-container">
      <header>
        <h1>{gameState.scenario.title}</h1>
        <p>{gameState.scenario.description}</p>
        <p style={{ marginTop: '0.5rem', color: '#888' }}>
          <strong>Victim:</strong> {gameState.scenario.victim}
        </p>
      </header>

      <div className="main-content">
        <div className="suspect-list">
          {gameState.suspects.map(suspect => (
            <div 
              key={suspect.id} 
              className={`suspect-card ${selectedSuspect?.id === suspect.id ? 'selected' : ''}`}
              onClick={() => setSelectedSuspect(suspect)}
            >
              <h3>{suspect.name}</h3>
              <p>Age: {suspect.age}</p>
              <p style={{marginTop: '0.5rem'}}>{suspect.description}</p>
            </div>
          ))}
          
          <button 
            className="accuse-btn" 
            onClick={() => setShowAccuseModal(true)}
            disabled={!!gameResult}
            style={{ opacity: gameResult ? 0.5 : 1 }}
          >
            MAKE FINAL ACCUSATION
          </button>
        </div>

        <div className="chat-container">
          {gameResult ? (
            <div style={{ padding: '2rem', textAlign: 'center', margin: 'auto' }}>
              <h2 style={{ color: gameResult.success ? 'var(--primary-color)' : 'var(--accent-color)' }}>
                {gameResult.success ? 'CASE CLOSED' : 'CASE FAILED'}
              </h2>
              <p style={{ marginTop: '1rem', fontSize: '1.2rem' }}>{gameResult.message}</p>
              <button 
                onClick={() => window.location.reload()} 
                style={{ marginTop: '2rem', padding: '0.8rem 2rem', backgroundColor: 'var(--secondary-color)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Start New Investigation
              </button>
            </div>
          ) : selectedSuspect ? (
            <>
              <div className="chat-header">
                <h2>Interrogating: {selectedSuspect.name}</h2>
              </div>
              <div className="chat-messages">
                {currentHistory.length === 0 && (
                  <p style={{textAlign: 'center', color: '#888', fontStyle: 'italic', marginTop: 'auto'}}>
                    Begin the interrogation. Ask a question.
                  </p>
                )}
                {currentHistory.map(msg => (
                  <div key={msg.id} className={`message ${msg.role}`}>
                    <p>{msg.text}</p>
                  </div>
                ))}
                {isTyping && (
                  <div className="message suspect typing">
                    <p>{selectedSuspect.name} is thinking...</p>
                  </div>
                )}
                <div ref={endOfMessagesRef} />
              </div>
              <div className="chat-input">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder={`Ask ${selectedSuspect.name} something...`}
                  disabled={isTyping}
                />
                <button onClick={handleSendMessage} disabled={isTyping || !inputText.trim()}>
                  Ask
                </button>
              </div>
            </>
          ) : (
            <div style={{ margin: 'auto', color: '#888', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h2 style={{ color: 'var(--primary-color)' }}>Awaiting Interrogation</h2>
              <p>Select a suspect from the list to begin.</p>
            </div>
          )}
        </div>
      </div>

      {showAccuseModal && (
        <AccusationModal 
          suspects={gameState.suspects} 
          onClose={() => setShowAccuseModal(false)}
          onAccuse={handleAccuse}
        />
      )}
    </div>
  );
}

function AccusationModal({ suspects, onClose, onAccuse }: { 
  suspects: Suspect[], 
  onClose: () => void, 
  onAccuse: (id: string, reason: string) => void 
}) {
  const [selectedId, setSelectedId] = useState(suspects[0]?.id);
  const [reason, setReason] = useState('');

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 style={{color: 'var(--accent-color)'}}>Final Accusation</h2>
        <p style={{marginTop: '1rem', color: '#aaa'}}>
          You only get one chance. If you accuse the wrong person, your career is over.
        </p>
        
        <select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
          {suspects.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        
        <textarea 
          rows={4} 
          placeholder="State your evidence..."
          value={reason}
          onChange={e => setReason(e.target.value)}
        />
        
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-confirm" onClick={() => onAccuse(selectedId, reason)}>
            Make Accusation
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
