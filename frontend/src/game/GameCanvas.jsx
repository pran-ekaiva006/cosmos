import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

const GameCanvas = ({ position, users, socketId }) => {
  const pixiContainer = useRef(null);
  const appRef = useRef(null);
  const playerRef = useRef(null);
  const othersRef = useRef({});

  // Sync React position to PixiJS
  useEffect(() => {
    if (playerRef.current && position) {
      playerRef.current.x = position.x;
      playerRef.current.y = position.y;
    }
  }, [position]);

  // Sync remote users recursively
  useEffect(() => {
    if (!appRef.current || !users) return;

    // Purge disconnected users from Pixi canvas
    Object.keys(othersRef.current).forEach((id) => {
      if (!users[id] || id === socketId) {
        appRef.current.stage.removeChild(othersRef.current[id]);
        othersRef.current[id].destroy();
        delete othersRef.current[id];
      }
    });

    // Render or move active users natively
    Object.keys(users).forEach((id) => {
      if (id === socketId) return; // Native player is scaled and processed above
      
      const pos = users[id];
      if (pos && pos.x !== null && pos.y !== null) {
        // If they don't exist in abstract memory yet, draw them now
        if (!othersRef.current[id]) {
          const remotePlayer = new PIXI.Graphics();
          remotePlayer.circle(0, 0, 20);
          remotePlayer.fill(0xff3366); // Make enemies distinct pinkish-red
          appRef.current.stage.addChild(remotePlayer);
          othersRef.current[id] = remotePlayer;
        }
        // Always mutate physics without tracking state array
        othersRef.current[id].x = pos.x;
        othersRef.current[id].y = pos.y;
      }
    });
  }, [users, socketId]);

  useEffect(() => {
    let isMounted = true;
    let app;

    const initPixi = async () => {
      // Create new Pixi application
      app = new PIXI.Application();

      // Initialize asynchronously (required in PIXI v8)
      await app.init({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundAlpha: 0, // Keep transparent so CSS background shows through
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      // Prevent race conditions on unmount during async init
      if (!isMounted) {
        app.destroy(true, { children: true, texture: true, baseTexture: true });
        return;
      }

      appRef.current = app;

      // Attach the canvas
      if (pixiContainer.current) {
        pixiContainer.current.appendChild(app.canvas);
      }

      // player circle using modern PIXI v8 API
      const player = new PIXI.Graphics();
      player.circle(0, 0, 20);
      player.fill(0x00d2ff);

      // Center exactly (only on init)
      player.x = position ? position.x : app.screen.width / 2;
      player.y = position ? position.y : app.screen.height / 2;

      app.stage.addChild(player);
      playerRef.current = player;
    };

    if (!appRef.current) {
      initPixi();
    }


    return () => {
      isMounted = false;
      if (appRef.current) {
        if (pixiContainer.current?.contains(appRef.current.canvas)) {
          pixiContainer.current.removeChild(appRef.current.canvas);
        }
        appRef.current.destroy(true, { children: true, texture: true, baseTexture: true });
        appRef.current = null;
      }
    };
  }, []);

  return <div ref={pixiContainer} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />;
};

export default GameCanvas;
