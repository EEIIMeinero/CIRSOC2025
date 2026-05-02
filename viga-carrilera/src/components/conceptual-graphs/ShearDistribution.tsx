"use client";

import { SectionDimensions, ShearStrength } from "@/lib/types";

interface ShearDistributionProps {
  dims: SectionDimensions;
  shear: ShearStrength;
  Vu: number;
  Fy: number;
  width?: number;
  height?: number;
}

export function ShearDistribution({
  dims,
  shear,
  Vu,
  Fy,
  width = 350,
  height = 300,
}: ShearDistributionProps) {
  const { bfs, tfs, tfi, tw, h, d } = dims;
  const { phiVn } = shear;
  const etaV = Vu / phiVn;
  const tauMax = (Vu * 1000) / (d * tw); // Simplified τ_max in MPa (approximate)
  const tauAdm = 0.6 * Fy;

  // Section drawing
  const secW = 80;
  const secScale = (height - 60) / d;
  const secX = 40;
  const secTopY = 30;

  // Shear distribution drawing
  const distX = secX + secW + 40;
  const distW = width - distX - 30;

  return (
    <svg width={width} height={height} className="bg-white rounded border">
      {/* Section outline */}
      <rect x={secX} y={secTopY} width={secW} height={tfs * secScale} fill="#3b82f6" stroke="#1e3a5f" strokeWidth={0.5} />
      <rect x={secX + secW / 2 - (tw / bfs) * secW / 2} y={secTopY + tfs * secScale} width={(tw / bfs) * secW} height={h * secScale} fill="#60a5fa" stroke="#1e3a5f" strokeWidth={0.5} />
      <rect x={secX} y={secTopY + (tfs + h) * secScale} width={secW} height={tfi * secScale} fill="#3b82f6" stroke="#1e3a5f" strokeWidth={0.5} />

      {/* Labels */}
      <text x={secX + secW / 2} y={secTopY - 8} textAnchor="middle" fontSize={9} fill="#64748b">Ala sup.</text>
      <text x={secX + secW / 2} y={secTopY + (tfs + h / 2) * secScale + 4} textAnchor="middle" fontSize={9} fill="#1e3a5f">Alma</text>
      <text x={secX + secW / 2} y={secTopY + d * secScale + 14} textAnchor="middle" fontSize={9} fill="#64748b">Ala inf.</text>

      {/* Shear distribution (parabolic in web) */}
      <text x={distX + distW / 2} y={20} textAnchor="middle" fontSize={10} fill="#334155" fontWeight="bold">τ(y)</text>

      {/* Parabolic curve */}
      <path
        d={`M ${distX} ${secTopY + tfs * secScale}
            Q ${distX + distW * 0.3} ${secTopY + tfs * secScale} ${distX + distW * 0.7} ${secTopY + (tfs + h / 2) * secScale}
            Q ${distX + distW * 0.3} ${secTopY + (tfs + h) * secScale} ${distX} ${secTopY + (tfs + h) * secScale}`}
        fill="#fecaca"
        stroke="#ef4444"
        strokeWidth={2}
        opacity={0.7}
      />

      {/* τ_max arrow */}
      <line
        x1={distX}
        y1={secTopY + (tfs + h / 2) * secScale}
        x2={distX + distW * 0.7}
        y2={secTopY + (tfs + h / 2) * secScale}
        stroke="#ef4444"
        strokeWidth={1}
        strokeDasharray="3,2"
      />
      <text
        x={distX + distW * 0.75}
        y={secTopY + (tfs + h / 2) * secScale + 4}
        fontSize={9}
        fill="#dc2626"
        fontWeight="bold"
      >
        τ_max
      </text>

      {/* Values */}
      <text x={distX} y={height - 40} fontSize={10} fill="#334155">
        τ_max ≈ {tauMax.toFixed(1)} MPa
      </text>
      <text x={distX} y={height - 26} fontSize={10} fill="#334155">
        τ_adm = 0.6·Fy = {tauAdm.toFixed(0)} MPa
      </text>
      <text x={distX} y={height - 10} fontSize={11} fill={etaV <= 1 ? "#166534" : "#dc2626"} fontWeight="bold">
        η_v = Vu/φVn = {etaV.toFixed(3)} {etaV <= 1 ? "✓" : "✗"}
      </text>
    </svg>
  );
}
