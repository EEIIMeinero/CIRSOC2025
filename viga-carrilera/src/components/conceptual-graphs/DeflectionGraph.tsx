"use client";

import { DeflectionCheck } from "@/lib/types";

interface DeflectionGraphProps {
  check: DeflectionCheck;
  spanLength: number; // m
  width?: number;
  height?: number;
}

export function DeflectionGraph({ check, spanLength, width = 500, height = 180 }: DeflectionGraphProps) {
  const { deltaV, limitV, ratioV, passV } = check;

  const padL = 40;
  const padR = 20;
  const barY = 60;
  const barH = 30;
  const barW = width - padL - padR;

  const maxVal = Math.max(limitV, deltaV) * 1.2;
  const scaleX = (v: number) => padL + (v / maxVal) * barW;

  return (
    <svg width={width} height={height} className="bg-white rounded border">
      {/* Title */}
      <text x={padL} y={20} fontSize={11} fill="#334155" fontWeight="bold">
        Deflexión vertical — Vano L={spanLength.toFixed(1)} m
      </text>

      {/* Reference line */}
      <line x1={padL} y1={barY - 15} x2={padL + barW} y2={barY - 15} stroke="#94a3b8" strokeWidth={0.5} strokeDasharray="8,4" />
      <text x={padL} y={barY - 20} fontSize={9} fill="#94a3b8">Posición sin carga</text>

      {/* Bar background (limit) */}
      <rect x={padL} y={barY} width={scaleX(limitV) - padL} height={barH} fill="#e2e8f0" rx={4} />

      {/* Bar actual */}
      <rect
        x={padL}
        y={barY}
        width={scaleX(deltaV) - padL}
        height={barH}
        fill={passV ? "#86efac" : "#fca5a5"}
        rx={4}
      />

      {/* Limit marker */}
      <line x1={scaleX(limitV)} y1={barY - 4} x2={scaleX(limitV)} y2={barY + barH + 4} stroke="#64748b" strokeWidth={2} strokeDasharray="4,2" />
      <text x={scaleX(limitV)} y={barY + barH + 16} fontSize={9} fill="#64748b" textAnchor="middle">
        L/{check.limitV > 0 ? (spanLength * 1000 / check.limitV).toFixed(0) : "∞"} = {limitV.toFixed(1)} mm
      </text>

      {/* Value text */}
      <text x={scaleX(deltaV) + 8} y={barY + barH / 2 + 4} fontSize={10} fill="#334155" fontWeight="bold">
        δv = {deltaV.toFixed(1)} mm
      </text>

      {/* Result */}
      <text x={padL} y={barY + barH + 40} fontSize={11} fill={passV ? "#166534" : "#dc2626"} fontWeight="bold">
        Ratio: {ratioV.toFixed(3)} {passV ? "✓ OK" : "✗ NG"}
      </text>

      {/* Deformed shape sketch */}
      <path
        d={`M ${padL} ${barY - 10} Q ${padL + barW / 2} ${barY - 10 + Math.min(deltaV * 2, 20)} ${padL + barW} ${barY - 10}`}
        fill="none"
        stroke={passV ? "#22c55e" : "#ef4444"}
        strokeWidth={2}
      />
    </svg>
  );
}
