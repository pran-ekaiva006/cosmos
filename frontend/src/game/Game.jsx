import React, { useEffect, useRef } from 'react';
import GameCanvas from './GameCanvas';
import usePlayerMovement from '../hooks/usePlayerMovement';
import socket from '../socket/socket';

const Game = () => {
  const { position } = usePlayerMovement();
  const lastEmitTime = useRef(0);
  const emitTimeout = useRef(null);

  // Throttled Network Emission (100ms limit)
  useEffect(() => {
    if (!position) return;

    const now = Date.now();
    const timeSinceLastEmit = now - lastEmitTime.current;

    const emitMove = () => {
      console.log('Throttled network payload emitted:', { x: position.x, y: position.y });
      socket.emit('move', { x: position.x, y: position.y });
      lastEmitTime.current = Date.now();
    };

    // If enough time has passed, emit immediately
    if (timeSinceLastEmit >= 100) {
      emitMove();
    } else {
      // Otherwise, queue it to ensure the final resting position is broadcasted
      clearTimeout(emitTimeout.current);
      emitTimeout.current = setTimeout(emitMove, 100 - timeSinceLastEmit);
    }

    return () => clearTimeout(emitTimeout.current);
  }, [position]);

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
