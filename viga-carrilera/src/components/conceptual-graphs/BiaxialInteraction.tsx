"use client";

import { InteractionCheck } from "@/lib/types";

interface BiaxialInteractionProps {
  check: InteractionCheck;
  width?: number;
  height?: number;
}

export function BiaxialInteraction({ check, width = 300, height = 300 }: BiaxialInteractionProps) {
  const { rx, ry, eta, pass } = check;

  const pad = 50;
  const plotSize = Math.min(width, height) - 2 * pad;

  const scaleX = (v: number) => pad + v * plotSize;
  const scaleY = (v: number) => pad + plotSize - v * plotSize;

  return (
    <svg width={width} height={height} className="bg-white rounded border">
      {/* Axes */}
      <line x1={pad} y1={pad + plotSize} x2={pad + plotSize} y2={pad + plotSize} stroke="#cbd5e1" strokeWidth={1} />
      <line x1={pad} y1={pad} x2={pad} y2={pad + plotSize} stroke="#cbd5e1" strokeWidth={1} />

      {/* Axis labels */}
      <text x={pad + plotSize / 2} y={height - 8} fontSize={10} fill="#64748b" textAnchor="middle">
        Mux/φMnx (rx)
      </text>
      <text x={12} y={pad + plotSize / 2} fontSize={10} fill="#64748b" transform={`rotate(-90, 12, ${pad + plotSize / 2})`} textAnchor="middle">
        Muy/φMny (ry)
      </text>

      {/* Interaction boundary (H1-1b simplified: rx + ry = 1.0) */}
      <polygon
        points={`${scaleX(0)},${scaleY(0)} ${scaleX(1)},${scaleY(0)} ${scaleX(0)},${scaleY(1)}`}
        fill="#dcfce7"
        stroke="#22c55e"
        strokeWidth={1.5}
        opacity={0.5}
      />

      {/* NG zone label */}
      <text x={scaleX(0.7)} y={scaleY(0.7)} fontSize={10} fill="#dc2626" opacity={0.5}>
        NG
      </text>
      <text x={scaleX(0.2)} y={scaleY(0.2)} fontSize={10} fill="#16a34a" opacity={0.7}>
        OK
      </text>

      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map((v) => (
        <g key={v}>
          <line x1={scaleX(v)} y1={pad} x2={scaleX(v)} y2={pad + plotSize} stroke="#e2e8f0" strokeWidth={0.5} />
          <line x1={pad} y1={scaleY(v)} x2={pad + plotSize} y2={scaleY(v)} stroke="#e2e8f0" strokeWidth={0.5} />
          <text x={scaleX(v)} y={pad + plotSize + 14} fontSize={8} fill="#94a3b8" textAnchor="middle">{v}</text>
          <text x={pad - 4} y={scaleY(v) + 3} fontSize={8} fill="#94a3b8" textAnchor="end">{v}</text>
        </g>
      ))}

      {/* Project point */}
      <circle
        cx={scaleX(Math.min(rx, 1.2))}
        cy={scaleY(Math.min(ry, 1.2))}
        r={7}
        fill={pass ? "#22c55e" : "#ef4444"}
        stroke="white"
        strokeWidth={2}
      />
      <text
        x={scaleX(Math.min(rx, 1.2)) + 12}
        y={scaleY(Math.min(ry, 1.2)) - 4}
        fontSize={10}
        fill={pass ? "#166534" : "#dc2626"}
        fontWeight="bold"
      >
        η={eta.toFixed(3)} {pass ? "✓" : "✗"}
      </text>

      {/* Values */}
      <text x={pad + plotSize - 60} y={pad + 16} fontSize={9} fill="#475569">
        rx = {rx.toFixed(3)}
      </text>
      <text x={pad + plotSize - 60} y={pad + 28} fontSize={9} fill="#475569">
        ry = {ry.toFixed(3)}
      </text>
    </svg>
  );
}
