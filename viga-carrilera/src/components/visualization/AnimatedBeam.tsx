"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Span, Support, EnvelopeResult } from "@/lib/types";

interface AnimatedBeamProps {
  spans: Span[];
  supports: Support[];
  envelopes: EnvelopeResult[];
  axlePattern: { dx: number; Pv: number; Ph: number }[];
  trainPosition: number;
  onPositionChange: (pos: number) => void;
  width?: number;
  height?: number;
}

export function AnimatedBeam({
  spans,
  supports,
  envelopes,
  axlePattern,
  trainPosition,
  onPositionChange,
  width = 900,
  height = 500,
}: AnimatedBeamProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const animRef = useRef<number>(0);
  const totalLength = spans.reduce((s, sp) => s + sp.length, 0);
  const totalLengthMm = totalLength * 1000;
  const maxTrainDx = axlePattern.length > 0 ? Math.max(...axlePattern.map((a) => a.dx)) : 0;

  // Animation
  const animate = useCallback(() => {
    onPositionChange(trainPosition + totalLengthMm / 200);
    if (trainPosition + maxTrainDx < totalLengthMm) {
      animRef.current = requestAnimationFrame(animate);
    } else {
      setIsPlaying(false);
    }
  }, [trainPosition, onPositionChange, totalLengthMm, maxTrainDx]);

  useEffect(() => {
    if (isPlaying) {
      animRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, animate]);

  // Layout
  const padL = 50;
  const padR = 30;
  const beamY = 60;
  const momentAreaY = 140;
  const shearAreaY = 300;
  const plotW = width - padL - padR;
  const scale = plotW / totalLength; // px per m

  // Node positions
  const nodeX: number[] = [padL];
  let cumX = padL;
  for (const span of spans) {
    cumX += span.length * scale;
    nodeX.push(cumX);
  }

  // Envelope scaling
  const maxM = Math.max(...envelopes.map((e) => Math.max(Math.abs(e.Mmax), Math.abs(e.Mmin))), 1);
  const maxV = Math.max(...envelopes.map((e) => Math.max(Math.abs(e.Vmax), Math.abs(e.Vmin))), 1);
  const mPlotH = 100;
  const vPlotH = 80;

  const scaleM = (m: number) => momentAreaY + mPlotH / 2 - (m / maxM) * (mPlotH / 2);
  const scaleV = (v: number) => shearAreaY + vPlotH / 2 - (v / maxV) * (vPlotH / 2);

  // Envelope polylines
  const envMmax = envelopes.map((e) => `${padL + e.x * scale},${scaleM(e.Mmax)}`).join(" ");
  const envMmin = envelopes.map((e) => `${padL + e.x * scale},${scaleM(e.Mmin)}`).join(" ");
  const envVmax = envelopes.map((e) => `${padL + e.x * scale},${scaleV(e.Vmax)}`).join(" ");
  const envVmin = envelopes.map((e) => `${padL + e.x * scale},${scaleV(e.Vmin)}`).join(" ");

  // Train position in px
  const trainPx = padL + (trainPosition / 1000) * scale;

  return (
    <div className="space-y-2">
      <svg width={width} height={height} className="bg-white border rounded">
        {/* Beam */}
        {spans.map((span, i) => {
          const x1 = nodeX[i];
          const x2 = nodeX[i + 1];
          return (
            <g key={`span-${i}`}>
              <rect x={x1} y={beamY - 3} width={x2 - x1} height={6} fill="#475569" />
              <text x={(x1 + x2) / 2} y={beamY - 12} textAnchor="middle" fontSize={10} fill="#64748b">
                V{i + 1}
              </text>
            </g>
          );
        })}

        {/* Supports */}
        {supports.map((sup) => {
          const x = nodeX[sup.nodeIndex];
          if (!x) return null;
          return (
            <g key={`sup-${sup.nodeIndex}`}>
              <polygon points={`${x},${beamY + 3} ${x - 8},${beamY + 15} ${x + 8},${beamY + 15}`} fill="#3b82f6" stroke="#1e3a5f" />
            </g>
          );
        })}

        {/* Train of loads */}
        {axlePattern.map((axle, i) => {
          const axlePx = trainPx + axle.dx / 1000 * scale;
          if (axlePx < padL || axlePx > padL + plotW) return null;
          const arrowLen = 25;
          return (
            <g key={`axle-${i}`}>
              <line x1={axlePx} y1={beamY - 8} x2={axlePx} y2={beamY - 8 - arrowLen} stroke="#ef4444" strokeWidth={2} />
              <polygon points={`${axlePx},${beamY - 6} ${axlePx - 4},${beamY - 14} ${axlePx + 4},${beamY - 14}`} fill="#ef4444" />
              {i === 0 && (
                <text x={axlePx + 6} y={beamY - 30} fontSize={8} fill="#ef4444">
                  {axle.Pv.toFixed(0)} kN
                </text>
              )}
            </g>
          );
        })}

        {/* Connection bar between first and last axle */}
        {axlePattern.length > 1 && (
          <line
            x1={Math.max(padL, trainPx)}
            y1={beamY - 34}
            x2={Math.min(padL + plotW, trainPx + maxTrainDx / 1000 * scale)}
            y2={beamY - 34}
            stroke="#f97316"
            strokeWidth={3}
            strokeLinecap="round"
          />
        )}

        {/* Section labels */}
        <text x={padL} y={momentAreaY - 8} fontSize={11} fill="#2563eb" fontWeight="bold">M(x) (kNm)</text>
        <text x={padL} y={shearAreaY - 8} fontSize={11} fill="#dc2626" fontWeight="bold">V(x) (kN)</text>

        {/* Moment axis */}
        <line x1={padL} y1={momentAreaY + mPlotH / 2} x2={padL + plotW} y2={momentAreaY + mPlotH / 2} stroke="#e2e8f0" strokeWidth={0.5} />
        {/* Shear axis */}
        <line x1={padL} y1={shearAreaY + vPlotH / 2} x2={padL + plotW} y2={shearAreaY + vPlotH / 2} stroke="#e2e8f0" strokeWidth={0.5} />

        {/* Envelope M */}
        {envelopes.length > 0 && (
          <>
            <polyline points={envMmax} fill="none" stroke="#2563eb" strokeWidth={1.5} strokeDasharray="6,3" />
            <polyline points={envMmin} fill="none" stroke="#93c5fd" strokeWidth={1} strokeDasharray="3,3" />
          </>
        )}

        {/* Envelope V */}
        {envelopes.length > 0 && (
          <>
            <polyline points={envVmax} fill="none" stroke="#dc2626" strokeWidth={1.5} strokeDasharray="6,3" />
            <polyline points={envVmin} fill="none" stroke="#fca5a5" strokeWidth={1} strokeDasharray="3,3" />
          </>
        )}

        {/* Envelope max label */}
        {envelopes.length > 0 && (
          <>
            <text x={padL + plotW - 5} y={momentAreaY + 14} fontSize={9} fill="#2563eb" textAnchor="end">
              env: {Math.max(...envelopes.map(e => e.Mmax)).toFixed(1)} kNm
            </text>
            <text x={padL + plotW - 5} y={shearAreaY + 14} fontSize={9} fill="#dc2626" textAnchor="end">
              env: {Math.max(...envelopes.map(e => e.Vmax)).toFixed(1)} kN
            </text>
          </>
        )}

        {/* Cursor line */}
        <line x1={trainPx} y1={0} x2={trainPx} y2={height} stroke="#8b5cf6" strokeWidth={1} strokeDasharray="4,4" opacity={0.5} />

        {/* Support dividers in moment/shear plots */}
        {nodeX.map((x, i) => (
          <g key={`div-${i}`}>
            <line x1={x} y1={momentAreaY} x2={x} y2={momentAreaY + mPlotH} stroke="#e2e8f0" strokeWidth={0.5} />
            <line x1={x} y1={shearAreaY} x2={x} y2={shearAreaY + vPlotH} stroke="#e2e8f0" strokeWidth={0.5} />
          </g>
        ))}
      </svg>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-4 py-1.5 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
        >
          {isPlaying ? "⏸ Pausar" : "▶ Animar"}
        </button>
        <button
          onClick={() => { onPositionChange(0); setIsPlaying(false); }}
          className="px-4 py-1.5 rounded bg-slate-200 text-slate-700 text-sm hover:bg-slate-300"
        >
          ↺ Reset
        </button>
        <input
          type="range"
          min={0}
          max={totalLengthMm}
          step={totalLengthMm / 200}
          value={trainPosition}
          onChange={(e) => onPositionChange(Number(e.target.value))}
          className="flex-1"
        />
        <span className="text-sm text-slate-500 font-mono w-24">
          x = {(trainPosition / 1000).toFixed(2)} m
        </span>
      </div>

      <p className="text-xs text-slate-400">
        Apoyos articulados N0..N{supports.length - 1} — vigas SS por vano. Envolvente en ≥140 posiciones.
      </p>
    </div>
  );
}
