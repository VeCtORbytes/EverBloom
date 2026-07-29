import React, { useEffect, useRef, useState } from 'react';

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export const StatsHUD: React.FC = () => {
  const [fps, setFps] = useState<number>(60);
  const [memory, setMemory] = useState<string | null>(null);
  const frameCountRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    let animationFrameId: number;

    const tick = () => {
      frameCountRef.current++;
      const now = performance.now();
      const delta = now - lastTimeRef.current;

      if (delta >= 500) {
        const calculatedFps = Math.round((frameCountRef.current * 1000) / delta);
        setFps(calculatedFps);
        frameCountRef.current = 0;
        lastTimeRef.current = now;

        // Check performance.memory if available (Chromium)
        const perf = performance as Performance & { memory?: PerformanceMemory };
        if (perf.memory) {
          const usedMB = Math.round(perf.memory.usedJSHeapSize / (1024 * 1024));
          setMemory(`${usedMB} MB`);
        }
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: '12px',
        left: '12px',
        zIndex: 9999,
        padding: '6px 12px',
        backgroundColor: 'rgba(11, 9, 10, 0.85)',
        border: '1px solid rgba(244, 235, 217, 0.2)',
        borderRadius: '6px',
        color: '#f4ebd9',
        fontFamily: 'monospace',
        fontSize: '12px',
        pointerEvents: 'none',
        userSelect: 'none',
        display: 'flex',
        gap: '12px',
      }}
    >
      <div>
        <span style={{ opacity: 0.6 }}>FPS: </span>
        <span style={{ color: fps >= 55 ? '#6ee7b7' : fps >= 30 ? '#fde047' : '#f87171' }}>
          {fps}
        </span>
      </div>
      {memory && (
        <div>
          <span style={{ opacity: 0.6 }}>Heap: </span>
          <span>{memory}</span>
        </div>
      )}
    </div>
  );
};
