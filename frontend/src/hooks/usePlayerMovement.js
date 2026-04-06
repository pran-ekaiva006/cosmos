import { useState, useEffect, useRef } from 'react';

const usePlayerMovement = (initialX = window.innerWidth / 2, initialY = window.innerHeight / 2) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const positionRef = useRef({ x: initialX, y: initialY });
  const keys = useRef({});
  const requestRef = useRef(null);

  const speed = 5;

  useEffect(() => {
    const handleKeyDown = (e) => {
      console.log('KEY DOWN:', e.key);
      keys.current[e.key] = true;
    };

    const handleKeyUp = (e) => {
      console.log('KEY UP:', e.key);
      keys.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const updatePosition = () => {
      let dx = 0;
      let dy = 0;

      if (keys.current['ArrowUp'] || keys.current['w'] || keys.current['W']) dy -= speed;
      if (keys.current['ArrowDown'] || keys.current['s'] || keys.current['S']) dy += speed;
      if (keys.current['ArrowLeft'] || keys.current['a'] || keys.current['A']) dx -= speed;
      if (keys.current['ArrowRight'] || keys.current['d'] || keys.current['D']) dx += speed;

      if (dx !== 0 || dy !== 0) {
        // Keep within bounds
        const newX = Math.max(20, Math.min(window.innerWidth - 20, positionRef.current.x + dx));
        const newY = Math.max(20, Math.min(window.innerHeight - 20, positionRef.current.y + dy));

        positionRef.current = { x: newX, y: newY };
        setPosition({ ...positionRef.current });
      }

      requestRef.current = requestAnimationFrame(updatePosition);
    };

    // Start loop
    requestRef.current = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return { position };
};

export default usePlayerMovement;
