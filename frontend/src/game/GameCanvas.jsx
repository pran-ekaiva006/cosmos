import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

const GameCanvas = () => {
  const pixiContainer = useRef(null);
  const appRef = useRef(null);

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

      // Draw the player circle using modern PIXI v8 API
      const player = new PIXI.Graphics();
      player.circle(0, 0, 20);
      player.fill(0x00d2ff); 

      // Center exactly
      player.x = app.screen.width / 2;
      player.y = app.screen.height / 2;

      app.stage.addChild(player);
    };

    if (!appRef.current) {
      initPixi();
    }

    // Cleanup phase: remove canvas and permanently destroy references to avoid bleeding context memory
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
