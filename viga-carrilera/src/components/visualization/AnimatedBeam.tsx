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
  width = 960,
  height = 560,
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

  // Layout - more space for diagrams
  const padL = 55;
  const padR = 20;
  const beamY = 55;
  const momentAreaY = 120;
  const shearAreaY = 340;
  const plotW = width - padL - padR;
  const scale = plotW / totalLength;

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
  const mPlotH = 160;
  const vPlotH = 120;

  const scaleM = (m: number) => momentAreaY + mPlotH / 2 - (m / maxM) * (mPlotH / 2);
  const scaleV = (v: number) => shearAreaY + vPlotH / 2 - (v / maxV) * (vPlotH / 2);

  // Envelope polylines
  const envMmax = envelopes.map((e) => `${padL + e.x * scale},${scaleM(e.Mmax)}`).join(" ");
  const envMmin = envelopes.map((e) => `${padL + e.x * scale},${scaleM(e.Mmin)}`).join(" ");
  const envVmax = envelopes.map((e) => `${padL + e.x * scale},${scaleV(e.Vmax)}`).join(" ");
  const envVmin = envelopes.map((e) => `${padL + e.x * scale},${scaleV(e.Vmin)}`).join(" ");

  // Filled area paths (close back to zero axis)
  const mZeroY = momentAreaY + mPlotH / 2;
  const vZeroY = shearAreaY + vPlotH / 2;

  const envMmaxFill = envelopes.length > 0
    ? `M ${padL + envelopes[0].x * scale},${mZeroY} ` +
      envelopes.map((e) => `L ${padL + e.x * scale},${scaleM(e.Mmax)}`).join(" ") +
      ` L ${padL + envelopes[envelopes.length - 1].x * scale},${mZeroY} Z`
    : "";
  const envMminFill = envelopes.length > 0
    ? `M ${padL + envelopes[0].x * scale},${mZeroY} ` +
      envelopes.map((e) => `L ${padL + e.x * scale},${scaleM(e.Mmin)}`).join(" ") +
      ` L ${padL + envelopes[envelopes.length - 1].x * scale},${mZeroY} Z`
    : "";
  const envVmaxFill = envelopes.length > 0
    ? `M ${padL + envelopes[0].x * scale},${vZeroY} ` +
      envelopes.map((e) => `L ${padL + e.x * scale},${scaleV(e.Vmax)}`).join(" ") +
      ` L ${padL + envelopes[envelopes.length - 1].x * scale},${vZeroY} Z`
    : "";
  const envVminFill = envelopes.length > 0
    ? `M ${padL + envelopes[0].x * scale},${vZeroY} ` +
      envelopes.map((e) => `L ${padL + e.x * scale},${scaleV(e.Vmin)}`).join(" ") +
      ` L ${padL + envelopes[envelopes.length - 1].x * scale},${vZeroY} Z`
    : "";

  // Key points: max moment and max shear with positions
  const maxMomentPt = envelopes.length > 0
    ? envelopes.reduce((best, e) => e.Mmax > best.Mmax ? e : best, envelopes[0])
    : null;
  const maxVmaxPt = envelopes.length > 0
    ? envelopes.reduce((best, e) => Math.abs(e.Vmax) > Math.abs(best.Vmax) ? e : best, envelopes[0])
    : null;
  const maxVminPt = envelopes.length > 0
    ? envelopes.reduce((best, e) => Math.abs(e.Vmin) > Math.abs(best.Vmin) ? e : best, envelopes[0])
    : null;

  // Train position in px
  const trainPx = padL + (trainPosition / 1000) * scale;

  // Gridlines for moment and shear
  const mGridValues = [-maxM, -maxM / 2, 0, maxM / 2, maxM];
  const vGridValues = [-maxV, -maxV / 2, 0, maxV / 2, maxV];

  return (
    <div className="space-y-1">
      <svg width={width} height={height} className="bg-white border rounded">
        {/* Beam */}
        {spans.map((span, i) => {
          const x1 = nodeX[i];
          const x2 = nodeX[i + 1];
          return (
            <g key={`span-${i}`}>
              <rect x={x1} y={beamY - 3} width={x2 - x1} height={6} fill="#475569" />
              <text x={(x1 + x2) / 2} y={beamY - 10} textAnchor="middle" fontSize={9} fill="#64748b">
                V{i + 1} ({span.length.toFixed(1)}m)
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
              <polygon points={`${x},${beamY + 3} ${x - 7},${beamY + 13} ${x + 7},${beamY + 13}`} fill="#3b82f6" stroke="#1e3a5f" />
              <text x={x} y={beamY + 22} textAnchor="middle" fontSize={7} fill="#64748b">N{sup.nodeIndex}</text>
            </g>
          );
        })}

        {/* Train of loads */}
        {axlePattern.map((axle, i) => {
          const axlePx = trainPx + axle.dx / 1000 * scale;
          if (axlePx < padL || axlePx > padL + plotW) return null;
          const arrowLen = 22;
          return (
            <g key={`axle-${i}`}>
              <line x1={axlePx} y1={beamY - 6} x2={axlePx} y2={beamY - 6 - arrowLen} stroke="#ef4444" strokeWidth={2} />
              <polygon points={`${axlePx},${beamY - 4} ${axlePx - 3},${beamY - 11} ${axlePx + 3},${beamY - 11}`} fill="#ef4444" />
              {i === 0 && (
                <text x={axlePx + 5} y={beamY - 26} fontSize={7} fill="#ef4444">
                  {axle.Pv.toFixed(0)} kN
                </text>
              )}
            </g>
          );
        })}

        {/* Connection bar */}
        {axlePattern.length > 1 && (
          <line
            x1={Math.max(padL, trainPx)}
            y1={beamY - 30}
            x2={Math.min(padL + plotW, trainPx + maxTrainDx / 1000 * scale)}
            y2={beamY - 30}
            stroke="#f97316" strokeWidth={2.5} strokeLinecap="round"
          />
        )}

        {/* ── Moment diagram ─────────────────────────────── */}

        {/* Moment gridlines */}
        {mGridValues.map((v, i) => {
          const y = scaleM(v);
          return (
            <g key={`mg-${i}`}>
              <line x1={padL} y1={y} x2={padL + plotW} y2={y} stroke="#f1f5f9" strokeWidth={0.5} />
              {v !== 0 && (
                <text x={padL - 3} y={y + 3} textAnchor="end" fontSize={7} fill="#94a3b8">
                  {v.toFixed(0)}
                </text>
              )}
            </g>
          );
        })}

        <text x={padL} y={momentAreaY - 5} fontSize={10} fill="#2563eb" fontWeight="bold">M(x) kNm</text>

        {/* Moment zero axis */}
        <line x1={padL} y1={mZeroY} x2={padL + plotW} y2={mZeroY} stroke="#cbd5e1" strokeWidth={0.8} />

        {/* Moment filled areas */}
        {envelopes.length > 0 && (
          <>
            <path d={envMmaxFill} fill="#3b82f6" fillOpacity={0.12} />
            <path d={envMminFill} fill="#93c5fd" fillOpacity={0.08} />
            <polyline points={envMmax} fill="none" stroke="#2563eb" strokeWidth={1.5} />
            <polyline points={envMmin} fill="none" stroke="#93c5fd" strokeWidth={1} strokeDasharray="4,2" />
          </>
        )}

        {/* Key point: max moment */}
        {maxMomentPt && maxMomentPt.Mmax > 0 && (
          <g>
            <circle cx={padL + maxMomentPt.x * scale} cy={scaleM(maxMomentPt.Mmax)} r={3} fill="#2563eb" />
            <text x={padL + maxMomentPt.x * scale} y={scaleM(maxMomentPt.Mmax) - 6}
              textAnchor="middle" fontSize={8} fill="#1d4ed8" fontWeight="bold">
              {maxMomentPt.Mmax.toFixed(1)}
            </text>
          </g>
        )}

        {/* ── Shear diagram ──────────────────────────────── */}

        {/* Shear gridlines */}
        {vGridValues.map((v, i) => {
          const y = scaleV(v);
          return (
            <g key={`vg-${i}`}>
              <line x1={padL} y1={y} x2={padL + plotW} y2={y} stroke="#f1f5f9" strokeWidth={0.5} />
              {v !== 0 && (
                <text x={padL - 3} y={y + 3} textAnchor="end" fontSize={7} fill="#94a3b8">
                  {v.toFixed(0)}
                </text>
              )}
            </g>
          );
        })}

        <text x={padL} y={shearAreaY - 5} fontSize={10} fill="#dc2626" fontWeight="bold">V(x) kN</text>

        {/* Shear zero axis */}
        <line x1={padL} y1={vZeroY} x2={padL + plotW} y2={vZeroY} stroke="#cbd5e1" strokeWidth={0.8} />

        {/* Shear filled areas */}
        {envelopes.length > 0 && (
          <>
            <path d={envVmaxFill} fill="#ef4444" fillOpacity={0.10} />
            <path d={envVminFill} fill="#fca5a5" fillOpacity={0.06} />
            <polyline points={envVmax} fill="none" stroke="#dc2626" strokeWidth={1.5} />
            <polyline points={envVmin} fill="none" stroke="#fca5a5" strokeWidth={1} strokeDasharray="4,2" />
          </>
        )}

        {/* Key points: max shear */}
        {maxVmaxPt && Math.abs(maxVmaxPt.Vmax) > 0 && (
          <g>
            <circle cx={padL + maxVmaxPt.x * scale} cy={scaleV(maxVmaxPt.Vmax)} r={3} fill="#dc2626" />
            <text x={padL + maxVmaxPt.x * scale + 5} y={scaleV(maxVmaxPt.Vmax) - 4}
              fontSize={8} fill="#b91c1c" fontWeight="bold">
              {maxVmaxPt.Vmax.toFixed(1)}
            </text>
          </g>
        )}
        {maxVminPt && Math.abs(maxVminPt.Vmin) > 0 && (
          <g>
            <circle cx={padL + maxVminPt.x * scale} cy={scaleV(maxVminPt.Vmin)} r={3} fill="#f87171" />
            <text x={padL + maxVminPt.x * scale + 5} y={scaleV(maxVminPt.Vmin) + 10}
              fontSize={8} fill="#b91c1c" fontWeight="bold">
              {maxVminPt.Vmin.toFixed(1)}
            </text>
          </g>
        )}

        {/* Support dividers in moment/shear plots */}
        {nodeX.map((x, i) => (
          <g key={`div-${i}`}>
            <line x1={x} y1={momentAreaY} x2={x} y2={momentAreaY + mPlotH} stroke="#e2e8f0" strokeWidth={0.5} strokeDasharray="2,2" />
            <line x1={x} y1={shearAreaY} x2={x} y2={shearAreaY + vPlotH} stroke="#e2e8f0" strokeWidth={0.5} strokeDasharray="2,2" />
          </g>
        ))}

        {/* Cursor line */}
        <line x1={trainPx} y1={0} x2={trainPx} y2={height} stroke="#8b5cf6" strokeWidth={1} strokeDasharray="4,4" opacity={0.4} />

        {/* Legend */}
        <g transform={`translate(${width - 160}, ${momentAreaY - 2})`}>
          <rect x={0} y={0} width={145} height={48} rx={3} fill="white" fillOpacity={0.95} stroke="#e2e8f0" />
          <line x1={6} y1={12} x2={20} y2={12} stroke="#2563eb" strokeWidth={1.5} />
          <text x={24} y={14} fontSize={7} fill="#475569">Mmax (envolvente sup.)</text>
          <line x1={6} y1={22} x2={20} y2={22} stroke="#93c5fd" strokeWidth={1} strokeDasharray="4,2" />
          <text x={24} y={24} fontSize={7} fill="#475569">Mmin (envolvente inf.)</text>
          <line x1={6} y1={32} x2={20} y2={32} stroke="#dc2626" strokeWidth={1.5} />
          <text x={24} y={34} fontSize={7} fill="#475569">Vmax (envolvente sup.)</text>
          <line x1={6} y1={42} x2={20} y2={42} stroke="#fca5a5" strokeWidth={1} strokeDasharray="4,2" />
          <text x={24} y={44} fontSize={7} fill="#475569">Vmin (envolvente inf.)</text>
        </g>

        {/* Envelope peak values */}
        {envelopes.length > 0 && (
          <>
            <text x={padL + plotW - 3} y={momentAreaY + 10} fontSize={8} fill="#2563eb" textAnchor="end" fontWeight="600">
              M_max: {Math.max(...envelopes.map(e => e.Mmax)).toFixed(1)} kNm
            </text>
            <text x={padL + plotW - 3} y={shearAreaY + 10} fontSize={8} fill="#dc2626" textAnchor="end" fontWeight="600">
              V_max: {Math.max(...envelopes.map(e => Math.abs(e.Vmax))).toFixed(1)} kN
            </text>
          </>
        )}
      </svg>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-3 py-1 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
        >
          {isPlaying ? "Pausar" : "Animar"}
        </button>
        <button
          onClick={() => { onPositionChange(0); setIsPlaying(false); }}
          className="px-3 py-1 rounded bg-slate-200 text-slate-700 text-xs hover:bg-slate-300"
        >
          Reset
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
        <span className="text-xs text-slate-500 font-mono w-20">
          x={( trainPosition / 1000).toFixed(2)}m
        </span>
      </div>
    </div>
  );
}
