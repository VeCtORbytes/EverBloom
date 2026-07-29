import React, { useState, useRef } from 'react';
import { SigilId } from '@/types/ids';
import { Point2D } from '@/types/sigils';
import { SIGIL_TEMPLATES } from '@/content/sigils';
import { globalSigilController } from '@/engine/sigils/SigilController';
import { RecognitionResult } from '@/engine/sigils/recognizer';

export const SigilTrainer: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [drawing, setDrawing] = useState<boolean>(false);
  const [drawnPoints, setDrawnPoints] = useState<Point2D[]>([]);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  if (process.env.NODE_ENV === 'production') return null;

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    setDrawing(true);
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setDrawnPoints([pt]);
    setResult(null);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drawing) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setDrawnPoints((prev) => [...prev, pt]);
  };

  const handlePointerUp = () => {
    if (!drawing) return;
    setDrawing(false);

    if (drawnPoints.length > 5) {
      // Ensure all 4 sigils are unlocked for dev trainer
      globalSigilController.setAcquiredSigils(['kindle', 'unbind', 'beckon', 'echo']);
      const res = globalSigilController.evaluateGesture(drawnPoints, Object.values(SIGIL_TEMPLATES));
      setResult(res);
    }
  };

  const handleClear = () => {
    setDrawnPoints([]);
    setResult(null);
  };

  return (
    <div style={{ position: 'fixed', bottom: '12px', right: '12px', zIndex: 9999 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '6px 12px',
          backgroundColor: 'rgba(11, 9, 10, 0.85)',
          border: '1px solid rgba(244, 235, 217, 0.3)',
          borderRadius: '6px',
          color: '#f4ebd9',
          cursor: 'pointer',
          fontFamily: 'monospace',
          fontSize: '12px',
        }}
      >
        ✨ Sigil Trainer {isOpen ? '▲' : '▼'}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '0',
            width: '280px',
            backgroundColor: 'rgba(11, 9, 10, 0.95)',
            border: '1px solid rgba(244, 235, 217, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            color: '#f4ebd9',
            fontFamily: 'sans-serif',
            fontSize: '12px',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Draw Sigil Canvas</div>
          <svg
            ref={svgRef}
            width="256"
            height="256"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{
              backgroundColor: '#1a1618',
              border: '1px solid rgba(244, 235, 217, 0.2)',
              borderRadius: '6px',
              touchAction: 'none',
              cursor: 'crosshair',
            }}
          >
            {drawnPoints.length > 1 && (
              <polyline
                points={drawnPoints.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            <button
              onClick={handleClear}
              style={{
                padding: '4px 8px',
                backgroundColor: 'rgba(244, 235, 217, 0.1)',
                border: 'none',
                color: '#f4ebd9',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Clear
            </button>
            <span style={{ fontSize: '11px', opacity: 0.7 }}>
              {drawnPoints.length} pts
            </span>
          </div>

          {result && (
            <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(244, 235, 217, 0.1)' }}>
              <div>
                Match:{' '}
                <strong style={{ color: result.matchedId ? '#10b981' : '#f87171' }}>
                  {result.matchedId ? SIGIL_TEMPLATES[result.matchedId as SigilId].name : 'No Match'}
                </strong>
              </div>
              <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>
                Best Score: {(result.score * 100).toFixed(1)}%
              </div>

              <div style={{ fontSize: '10px', marginTop: '6px', opacity: 0.6 }}>
                Scores:{' '}
                {Object.entries(result.allScores)
                  .map(([id, s]) => `${id}: ${(s * 100).toFixed(0)}%`)
                  .join(' | ')}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
