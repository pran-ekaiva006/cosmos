import React from 'react';

const Game = () => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      background: 'radial-gradient(circle at center, #1e1e24 0%, #0d0d12 100%)'
    }}>
      <h1 style={{ 
        opacity: 0.8, 
        letterSpacing: '2px', 
        fontWeight: 300,
        textTransform: 'uppercase'
      }}>
        Cosmos Environment
      </h1>
    </div>
  );
};

export default Game;
