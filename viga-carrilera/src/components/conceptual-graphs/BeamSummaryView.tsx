"use client";

import { SpanResult } from "@/lib/types";

interface BeamSummaryViewProps {
  results: SpanResult[];
  width?: number;
  height?: number;
}

function spanColor(eta: number): string {
  if (eta >= 1.0) return "#fecaca";
  if (eta >= 0.85) return "#fef08a";
  return "#bbf7d0";
}

function spanStroke(eta: number): string {
  if (eta >= 1.0) return "#dc2626";
  if (eta >= 0.85) return "#ca8a04";
  return "#16a34a";
}

export function BeamSummaryView({ results, width = 700, height = 150 }: BeamSummaryViewProps) {
  if (results.length === 0) return null;

  const padL = 30;
  const padR = 30;
  const plotW = width - padL - padR;
  const totalL = results.reduce((s, r) => s + r.length, 0);
  const scale = plotW / totalL;
  const boxY = 30;
  const boxH = 60;
  const maxEta = Math.max(...results.map((r) => r.etaMax));
  const critIdx = results.findIndex((r) => r.etaMax === maxEta);

  let cumX = padL;

  return (
    <svg width={width} height={height} className="bg-white rounded border">
      <text x={width / 2} y={18} textAnchor="middle" fontSize={11} fill="#334155" fontWeight="bold">
        Resumen visual — Todos los vanos
      </text>

      {results.map((r, i) => {
        const spanW = r.length * scale;
        const x = cumX;
        cumX += spanW;
        const isCrit = i === critIdx;
        const isLast = i === results.length - 1;

        return (
          <g key={i}>
            <rect
              x={x}
              y={boxY}
              width={spanW}
              height={boxH}
              fill={spanColor(r.etaMax)}
              stroke={spanStroke(r.etaMax)}
              strokeWidth={isCrit ? 2.5 : 1}
              rx={3}
            />
            <text x={x + spanW / 2} y={boxY + 18} textAnchor="middle" fontSize={11} fill="#334155" fontWeight="bold">
              V{i + 1}{isLast ? " PG" : ""}{isCrit ? "*" : ""}
            </text>
            <text x={x + spanW / 2} y={boxY + 34} textAnchor="middle" fontSize={10} fill="#475569">
              η={r.etaMax.toFixed(2)}
            </text>
            <text x={x + spanW / 2} y={boxY + 50} textAnchor="middle" fontSize={14} fill={r.status === "fail" ? "#dc2626" : r.status === "warning" ? "#ca8a04" : "#16a34a"}>
              {r.status === "fail" ? "✗" : r.status === "warning" ? "⚠" : "✓"}
            </text>

            {/* Mini M diagram sketch */}
            <path
              d={`M ${x + 2} ${boxY + boxH + 8} Q ${x + spanW / 2} ${boxY + boxH + 8 + r.etaMax * 15} ${x + spanW - 2} ${boxY + boxH + 8}`}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={1}
              opacity={0.5}
            />
          </g>
        );
      })}

      <text x={width / 2} y={height - 5} textAnchor="middle" fontSize={9} fill="#94a3b8">
        * vano crítico &nbsp; PG = paragolpe
      </text>
    </svg>
  );
}
