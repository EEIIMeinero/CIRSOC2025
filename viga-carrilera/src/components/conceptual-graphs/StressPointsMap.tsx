"use client";

import { StressPoint, SectionDimensions } from "@/lib/types";

interface StressPointsMapProps {
  dims: SectionDimensions;
  points: StressPoint[];
  width?: number;
  height?: number;
}

function pointColor(ratio: number): string {
  if (ratio >= 1.0) return "#ef4444";
  if (ratio >= 0.85) return "#f59e0b";
  return "#22c55e";
}

export function StressPointsMap({ dims, points, width = 350, height = 400 }: StressPointsMapProps) {
  const { bfs, tfs, bfi, tfi, tw, h, d } = dims;
  if (!d) return null;

  const scale = Math.min((width - 160) / Math.max(bfs, bfi), (height - 80) / d);
  const cx = 120;
  const topY = 40;

  const sBfs = bfs * scale;
  const sTfs = tfs * scale;
  const sBfi = bfi * scale;
  const sTfi = tfi * scale;
  const sTw = tw * scale;
  const sH = h * scale;
  const sD = d * scale;

  // Approximate positions for stress points on section
  const pointPositions: Record<string, { x: number; y: number }> = {
    P1: { x: cx - sBfs / 2, y: topY },
    P2: { x: cx - sTw / 2, y: topY + sTfs },
    P3: { x: cx + sTw / 2, y: topY + sTfs + 5 },
    P4: { x: cx + sTw / 2, y: topY + sTfs + sH - 5 },
    P5: { x: cx + sBfi / 2, y: topY + sD },
    P6: { x: cx, y: topY - 8 },
    P7: { x: cx - sTw / 2 - 8, y: topY + sTfs + 4 },
    P8: { x: cx - sTw / 2 - 8, y: topY + sTfs + sH - 4 },
  };

  return (
    <svg width={width} height={height} className="bg-white rounded border">
      <text x={cx} y={18} textAnchor="middle" fontSize={11} fill="#334155" fontWeight="bold">
        Tensiones en la sección
      </text>

      {/* Section outline */}
      <rect x={cx - sBfs / 2} y={topY} width={sBfs} height={sTfs} fill="#dbeafe" stroke="#1e3a5f" strokeWidth={1} />
      <rect x={cx - sTw / 2} y={topY + sTfs} width={sTw} height={sH} fill="#eff6ff" stroke="#1e3a5f" strokeWidth={1} />
      <rect x={cx - sBfi / 2} y={topY + sD - sTfi} width={sBfi} height={sTfi} fill="#dbeafe" stroke="#1e3a5f" strokeWidth={1} />

      {/* Stress points */}
      {points.map((pt) => {
        const pos = pointPositions[pt.id];
        if (!pos) return null;
        const color = pointColor(pt.ratio);
        return (
          <g key={pt.id}>
            <circle cx={pos.x} cy={pos.y} r={8} fill={color} stroke="white" strokeWidth={2} />
            <text x={pos.x} y={pos.y + 3.5} textAnchor="middle" fontSize={7} fill="white" fontWeight="bold">
              {pt.id.replace("P", "")}
            </text>
            {/* Info panel to the right */}
            <text x={cx + Math.max(sBfs, sBfi) / 2 + 20} y={pos.y + 4} fontSize={8} fill="#475569">
              {pt.id}: σeq={pt.sigmaEq.toFixed(0)} MPa ({(pt.ratio * 100).toFixed(0)}%)
            </text>
          </g>
        );
      })}

      {/* Legend */}
      <g transform={`translate(10, ${height - 50})`}>
        <circle cx={8} cy={0} r={5} fill="#22c55e" />
        <text x={18} y={4} fontSize={8} fill="#475569">{"< 85%"}</text>
        <circle cx={68} cy={0} r={5} fill="#f59e0b" />
        <text x={78} y={4} fontSize={8} fill="#475569">85-100%</text>
        <circle cx={138} cy={0} r={5} fill="#ef4444" />
        <text x={148} y={4} fontSize={8} fill="#475569">{"> 100%"}</text>
      </g>
    </svg>
  );
}
