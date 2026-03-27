import React, { useState } from 'react';
import { api } from '../services/api';

export default function AccusationPanel({ suspects, onComplete, onCancel }) {
  const [selectedId, setSelectedId] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedId || !reasoning) return;
    setLoading(true);
    try {
      const result = await api.accuse(selectedId, reasoning);
      onComplete(result);
    } catch (e) {
      alert("Failed to send accusation");
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 style={{color: 'var(--accent-color)'}}>Make an Accusation</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)} disabled={loading}>
            <option value="" disabled>Select a suspect...</option>
            {suspects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <textarea 
            placeholder="Your reasoning..." 
            rows={5} 
            value={reasoning} 
            onChange={e => setReasoning(e.target.value)}
            disabled={loading}
          />
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
            <button type="button" onClick={onCancel} disabled={loading} className="btn-cancel">Cancel</button>
            <button type="submit" disabled={loading || !selectedId || !reasoning} className="btn-confirm">
              {loading ? 'Submitting...' : 'Submit Evidence'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
