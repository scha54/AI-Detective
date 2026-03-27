import React from 'react';

export default function Result({ result, onRestart }) {
  if (!result) return null;

  return (
    <div className="app-container" style={{ textAlign: 'center', marginTop: '5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1 style={{ fontSize: '3rem', color: result.correct ? 'var(--primary-color)' : 'var(--accent-color)' }}>
        {result.correct ? 'CASE SOLVED' : 'CASE CLOSED (INCORRECT)'}
      </h1>
      <p style={{ margin: '2rem 0', maxWidth: '800px', fontSize: '1.2rem', lineHeight: '1.8' }}>
        {result.explanation}
      </p>
      <button 
        onClick={onRestart} 
        style={{ padding: '1rem 3rem', fontSize: '1.2rem', backgroundColor: 'var(--secondary-color)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Play Again
      </button>
    </div>
  );
}
