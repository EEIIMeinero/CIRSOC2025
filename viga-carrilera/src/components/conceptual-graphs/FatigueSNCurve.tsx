"use client";

import { FatigueCheck } from "@/lib/types";

interface FatigueSNCurveProps {
  checks: FatigueCheck[];
  width?: number;
  height?: number;
}

const FATIGUE_CATEGORIES = [
  { name: "A", FSR: 165, color: "#22c55e" },
  { name: "B", FSR: 110, color: "#3b82f6" },
  { name: "B'", FSR: 83, color: "#6366f1" },
  { name: "C", FSR: 69, color: "#f59e0b" },
  { name: "D", FSR: 48, color: "#f97316" },
  { name: "E", FSR: 31, color: "#ef4444" },
  { name: "E'", FSR: 18, color: "#991b1b" },
];

export function FatigueSNCurve({ checks, width = 500, height = 300 }: FatigueSNCurveProps) {
  const padL = 60;
  const padR = 30;
  const padT = 30;
  const padB = 40;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  // Log scale: N from 10^4 to 10^7, Δσ from 10 to 200
  const logNmin = 4;
  const logNmax = 7;
  const logSmin = 1; // log10(10)
  const logSmax = 2.3; // log10(200)

  const scaleX = (logN: number) => padL + ((logN - logNmin) / (logNmax - logNmin)) * plotW;
  const scaleY = (logS: number) => padT + plotH - ((logS - logSmin) / (logSmax - logSmin)) * plotH;

  return (
    <svg width={width} height={height} className="bg-white rounded border">
      {/* Title */}
      <text x={width / 2} y={18} textAnchor="middle" fontSize={11} fill="#334155" fontWeight="bold">
        Curva S-N (AISC DG7-2019)
      </text>

      {/* Axes */}
      <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="#cbd5e1" strokeWidth={1} />
      <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="#cbd5e1" strokeWidth={1} />

      {/* X axis labels */}
      {[4, 5, 6, 7].map((logN) => (
        <g key={logN}>
          <line x1={scaleX(logN)} y1={padT + plotH} x2={scaleX(logN)} y2={padT + plotH + 4} stroke="#94a3b8" strokeWidth={1} />
          <text x={scaleX(logN)} y={padT + plotH + 16} fontSize={9} fill="#64748b" textAnchor="middle">
            10^{logN}
          </text>
        </g>
      ))}
      <text x={padL + plotW / 2} y={height - 4} fontSize={10} fill="#64748b" textAnchor="middle">N (ciclos)</text>

      {/* Y axis labels */}
      {[20, 50, 100, 200].map((s) => {
        const logS = Math.log10(s);
        return (
          <g key={s}>
            <line x1={padL - 4} y1={scaleY(logS)} x2={padL} y2={scaleY(logS)} stroke="#94a3b8" strokeWidth={1} />
            <text x={padL - 8} y={scaleY(logS) + 3} fontSize={9} fill="#64748b" textAnchor="end">
              {s}
            </text>
          </g>
        );
      })}
      <text x={14} y={padT + plotH / 2} fontSize={10} fill="#64748b" transform={`rotate(-90, 14, ${padT + plotH / 2})`} textAnchor="middle">
        Δσ (MPa)
      </text>

      {/* Category lines (simplified as horizontal at their FSR for infinite life) */}
      {FATIGUE_CATEGORIES.map((cat) => {
        const logFSR = Math.log10(cat.FSR);
        if (logFSR < logSmin || logFSR > logSmax) return null;
        return (
          <g key={cat.name}>
            <line
              x1={padL}
              y1={scaleY(logFSR)}
              x2={padL + plotW}
              y2={scaleY(logFSR)}
              stroke={cat.color}
              strokeWidth={1}
              strokeDasharray="6,3"
              opacity={0.6}
            />
            <text
              x={padL + plotW + 4}
              y={scaleY(logFSR) + 3}
              fontSize={8}
              fill={cat.color}
            >
              {cat.name}
            </text>
          </g>
        );
      })}

      {/* Check points */}
      {checks.map((chk, i) => {
        const logN = Math.log10(Math.max(chk.nCycles, 1e4));
        const logDS = Math.log10(Math.max(chk.deltaSigma, 1));
        if (logDS < logSmin || logDS > logSmax) return null;
        return (
          <g key={i}>
            <circle
              cx={scaleX(logN)}
              cy={scaleY(logDS)}
              r={5}
              fill={chk.pass ? "#22c55e" : "#ef4444"}
              stroke="white"
              strokeWidth={1.5}
            />
            <text
              x={scaleX(logN) + 8}
              y={scaleY(logDS) + 4}
              fontSize={8}
              fill={chk.pass ? "#166534" : "#dc2626"}
            >
              {chk.pointId} ({chk.deltaSigma.toFixed(0)} MPa)
            </text>
          </g>
        );
      })}
    </svg>
  );
}
