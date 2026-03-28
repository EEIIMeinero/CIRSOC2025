"use client";

import { ReactionResult } from "@/lib/types";

interface ReactionsBarChartProps {
  reactions: ReactionResult[];
  width?: number;
  height?: number;
}

export function ReactionsBarChart({ reactions, width = 500, height = 250 }: ReactionsBarChartProps) {
  if (reactions.length === 0) return null;

  const padL = 50;
  const padR = 20;
  const padT = 30;
  const padB = 40;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const maxR = Math.max(...reactions.map((r) => Math.max(r.Rmax, r.Rinst)), 1);
  const barGroupW = plotW / reactions.length;
  const barW = Math.min(barGroupW * 0.35, 30);
  const gap = 4;

  const scaleY = (v: number) => padT + plotH - (v / (maxR * 1.15)) * plotH;

  return (
    <svg width={width} height={height} className="bg-white rounded border">
      <text x={width / 2} y={18} textAnchor="middle" fontSize={11} fill="#334155" fontWeight="bold">
        Reacciones en Apoyos (kN)
      </text>

      {/* Y axis */}
      <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="#cbd5e1" strokeWidth={1} />
      <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="#cbd5e1" strokeWidth={1} />

      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1.0].map((frac) => {
        const val = maxR * 1.15 * frac;
        return (
          <g key={frac}>
            <line x1={padL} y1={scaleY(val)} x2={padL + plotW} y2={scaleY(val)} stroke="#e2e8f0" strokeWidth={0.5} />
            <text x={padL - 4} y={scaleY(val) + 3} fontSize={8} fill="#94a3b8" textAnchor="end">
              {val.toFixed(0)}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {reactions.map((r, i) => {
        const cx = padL + barGroupW * i + barGroupW / 2;

        return (
          <g key={i}>
            {/* Envelope bar (light) */}
            <rect
              x={cx - barW - gap / 2}
              y={scaleY(r.Rmax)}
              width={barW}
              height={padT + plotH - scaleY(r.Rmax)}
              fill="#bbf7d0"
              stroke="#22c55e"
              strokeWidth={1}
              rx={2}
            />
            {/* Instantaneous bar (dark) */}
            <rect
              x={cx + gap / 2}
              y={scaleY(r.Rinst)}
              width={barW}
              height={padT + plotH - scaleY(r.Rinst)}
              fill="#16a34a"
              stroke="#166534"
              strokeWidth={1}
              rx={2}
            />

            {/* Value labels */}
            <text x={cx - barW / 2 - gap / 2} y={scaleY(r.Rmax) - 4} fontSize={8} fill="#166534" textAnchor="middle">
              {r.Rmax.toFixed(0)}
            </text>
            <text x={cx + barW / 2 + gap / 2} y={scaleY(r.Rinst) - 4} fontSize={8} fill="#166534" textAnchor="middle">
              {r.Rinst.toFixed(0)}
            </text>

            {/* Node label */}
            <text x={cx} y={padT + plotH + 14} fontSize={10} fill="#475569" textAnchor="middle">
              N{r.nodeIndex}
            </text>
          </g>
        );
      })}

      {/* Legend */}
      <rect x={padL + 10} y={padT + 4} width={10} height={10} fill="#bbf7d0" stroke="#22c55e" strokeWidth={0.5} />
      <text x={padL + 24} y={padT + 13} fontSize={9} fill="#475569">R_env</text>
      <rect x={padL + 70} y={padT + 4} width={10} height={10} fill="#16a34a" stroke="#166534" strokeWidth={0.5} />
      <text x={padL + 84} y={padT + 13} fontSize={9} fill="#475569">R_inst</text>
    </svg>
  );
}
