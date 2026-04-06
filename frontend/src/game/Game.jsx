import React from 'react';
import GameCanvas from './GameCanvas';
import usePlayerMovement from '../hooks/usePlayerMovement';

const Game = () => {
  const { position } = usePlayerMovement();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      background: 'radial-gradient(circle at center, #1e1e24 0%, #0d0d12 100%)',
      position: 'relative'
    }}>
      <h1 style={{ 
        opacity: 0.8, 
        letterSpacing: '2px', 
        fontWeight: 300,
        textTransform: 'uppercase',
        zIndex: 0
      }}>
        Cosmos Environment
      </h1>
      <GameCanvas position={position} />
    </div>
  );
};

export default Game;
