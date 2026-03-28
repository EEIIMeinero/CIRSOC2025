"use client";

import { CraneAxle } from "@/lib/types";

interface SvgTesteraProps {
  axles: CraneAxle[];
  phi: number;
  color?: string;
  width?: number;
  height?: number;
}

export function SvgTestera({
  axles,
  phi,
  color = "#f97316",
  width = 600,
  height = 300,
}: SvgTesteraProps) {
  if (axles.length === 0) return null;

  const maxDx = Math.max(...axles.map((a) => a.dx));
  const padding = 80;
  const railY = 60;
  const wheelY = railY + 40;
  const beamTopY = railY + 10;
  const testeraY = railY - 30;
  const maxPv = Math.max(...axles.map((a) => a.Pv || a.Pw * (1 + phi)), 1);
  const maxPh = Math.max(...axles.map((a) => a.Ph), 0.1);
  const usableWidth = width - 2 * padding;
  const scale = maxDx > 0 ? usableWidth / maxDx : 1;

  return (
    <svg width={width} height={height} className="border rounded bg-white">
      {/* Rail profile */}
      <rect x={padding - 20} y={railY} width={usableWidth + 40} height={8} fill="#78716c" rx={1} />
      <rect x={padding - 10} y={railY - 6} width={usableWidth + 20} height={6} fill="#a8a29e" rx={1} />

      {/* Beam top */}
      <rect x={padding - 30} y={beamTopY + 8} width={usableWidth + 60} height={12} fill="#cbd5e1" stroke="#64748b" strokeWidth={1} />

      {/* Testera body */}
      <rect
        x={padding - 10}
        y={testeraY}
        width={usableWidth + 20}
        height={24}
        fill={color}
        opacity={0.2}
        stroke={color}
        strokeWidth={1.5}
        rx={4}
      />
      <text
        x={padding + usableWidth / 2}
        y={testeraY + 16}
        textAnchor="middle"
        fontSize={11}
        fill={color}
        fontWeight="bold"
      >
        Testera
      </text>

      {/* Axles */}
      {axles.map((axle, i) => {
        const x = padding + axle.dx * scale;
        const Pv = axle.Pv || axle.Pw * (1 + phi);
        const arrowLen = Math.max(20, (Pv / maxPv) * 80);
        const phArrowLen = axle.Ph > 0 ? Math.max(15, (axle.Ph / maxPh) * 50) : 0;

        return (
          <g key={i}>
            {/* Axle line */}
            <line x1={x} y1={testeraY + 24} x2={x} y2={wheelY} stroke="#374151" strokeWidth={2} />

            {/* Wheel */}
            <circle cx={x} cy={wheelY} r={8} fill="#374151" stroke="#111827" strokeWidth={1.5} />
            <circle cx={x} cy={wheelY} r={3} fill="#6b7280" />

            {/* Pv arrow (vertical, red) */}
            <line
              x1={x}
              y1={wheelY + 20}
              x2={x}
              y2={wheelY + 20 + arrowLen}
              stroke="#ef4444"
              strokeWidth={2}
              markerEnd="url(#arrowRed)"
            />
            {i === 0 && (
              <text x={x + 8} y={wheelY + 30 + arrowLen} fontSize={9} fill="#ef4444" fontWeight="bold">
                Pv={Pv.toFixed(0)} kN
              </text>
            )}

            {/* Ph arrow (horizontal, blue) */}
            {phArrowLen > 0 && (
              <>
                <line
                  x1={x - phArrowLen}
                  y1={wheelY}
                  x2={x - 5}
                  y2={wheelY}
                  stroke="#3b82f6"
                  strokeWidth={2}
                  markerEnd="url(#arrowBlue)"
                />
                {i === 0 && (
                  <text x={x - phArrowLen - 5} y={wheelY - 8} fontSize={9} fill="#3b82f6" fontWeight="bold">
                    Ph={axle.Ph.toFixed(0)} kN
                  </text>
                )}
              </>
            )}

            {/* Axle label */}
            <text x={x} y={wheelY + 12 + arrowLen + 16} textAnchor="middle" fontSize={9} fill="#6b7280">
              E{i + 1}
            </text>
          </g>
        );
      })}

      {/* Dimension lines between axles */}
      {axles.slice(1).map((axle, i) => {
        const x1 = padding + axles[i].dx * scale;
        const x2 = padding + axle.dx * scale;
        const dimY = height - 20;
        return (
          <g key={`dim-${i}`}>
            <line x1={x1} y1={dimY - 4} x2={x2} y2={dimY - 4} stroke="#94a3b8" strokeWidth={0.5} />
            <line x1={x1} y1={dimY - 8} x2={x1} y2={dimY} stroke="#94a3b8" strokeWidth={0.5} />
            <line x1={x2} y1={dimY - 8} x2={x2} y2={dimY} stroke="#94a3b8" strokeWidth={0.5} />
            <text x={(x1 + x2) / 2} y={dimY + 10} textAnchor="middle" fontSize={9} fill="#64748b">
              {axle.dx - axles[i].dx} mm
            </text>
          </g>
        );
      })}

      {/* Impact badge */}
      <rect x={width - 120} y={height - 30} width={110} height={20} fill="#fef3c7" stroke="#f59e0b" strokeWidth={1} rx={4} />
      <text x={width - 65} y={height - 16} textAnchor="middle" fontSize={9} fill="#92400e" fontWeight="bold">
        φ = {(phi * 100).toFixed(0)}% (impacto)
      </text>

      {/* Arrow markers */}
      <defs>
        <marker id="arrowRed" viewBox="0 0 10 10" refX="10" refY="5" markerWidth={6} markerHeight={6} orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
        </marker>
        <marker id="arrowBlue" viewBox="0 0 10 10" refX="10" refY="5" markerWidth={6} markerHeight={6} orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
        </marker>
      </defs>
    </svg>
  );
}
