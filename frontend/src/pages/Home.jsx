import React, { useState } from 'react';
import { api } from '../services/api';

export default function Home({ onStart }) {
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      const data = await api.start();
      onStart(data);
    } catch (e) {
      alert("Failed to start case");
      setLoading(false);
    }
  };

  return (
    <div className="home-container" style={{ textAlign: 'center', marginTop: '10rem' }}>
      <h1 style={{ fontSize: '3rem', color: 'var(--primary-color)' }}>AI Detective</h1>
      <p style={{ margin: '1rem 0' }}>A generative murder mystery awaits.</p>
      <button 
        onClick={handleStart} 
        disabled={loading}
        style={{ padding: '1rem 2rem', fontSize: '1.2rem', cursor: loading ? 'wait' : 'pointer', backgroundColor: 'var(--primary-color)', color: 'black', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
      >
        {loading ? 'Generating Case...' : 'Start Investigation'}
      </button>
    </div>
  );
}
