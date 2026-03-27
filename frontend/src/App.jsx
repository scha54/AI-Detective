import { useState } from 'react';
import Home from './pages/Home';
import Game from './pages/Game';
import Result from './pages/Result';

export default function App() {
  const [currentPage, setCurrentPage] = useState('HOME');
  const [gameState, setGameState] = useState(null);
  const [resultState, setResultState] = useState(null);

  if (currentPage === 'HOME') {
    return (
      <Home 
        onStart={(data) => {
          setGameState(data);
          setCurrentPage('GAME');
        }} 
      />
    );
  }

  if (currentPage === 'GAME') {
    return (
      <Game 
        caseData={gameState} 
        onAccuse={(resultData) => {
          setResultState(resultData);
          setCurrentPage('RESULT');
        }} 
      />
    );
  }

  if (currentPage === 'RESULT') {
    return (
      <Result 
        result={resultState} 
        onRestart={() => setCurrentPage('HOME')} 
      />
    );
  }

  return null;
}
