"use client";

import { FlexuralStrength } from "@/lib/types";

interface LTBCurveProps {
  flexure: FlexuralStrength;
  width?: number;
  height?: number;
}

export function LTBCurve({ flexure, width = 500, height = 300 }: LTBCurveProps) {
  const { Mp, Lp, Lr, Lb, Mn, ltbZone } = flexure;
  const My07 = 0.7 * Mp; // Approximate 0.7*MyC

  // Scale
  const padL = 60;
  const padR = 30;
  const padT = 30;
  const padB = 40;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const maxL = Math.max(Lr * 1.3, Lb * 1.2);
  const maxM = Mp * 1.1;

  const scaleX = (l: number) => padL + (l / maxL) * plotW;
  const scaleY = (m: number) => padT + plotH - (m / maxM) * plotH;

  // Build the curve points
  // Zone 1: 0 to Lp -> Mp
  // Zone 2: Lp to Lr -> linear from Mp to My07
  // Zone 3: Lr to maxL -> hyperbolic decay
  const MnAtLr = My07;
  const MnElastic = (l: number) => {
    const ratio = Lr / l;
    return Math.min(MnAtLr * ratio * ratio, Mp);
  };

  const nPts = 100;
  const curvePts: string[] = [];
  for (let i = 0; i <= nPts; i++) {
    const l = (i / nPts) * maxL;
    let m: number;
    if (l <= Lp) {
      m = Mp;
    } else if (l <= Lr) {
      m = Mp - ((Mp - My07) * (l - Lp)) / (Lr - Lp);
    } else {
      m = MnElastic(l);
    }
    curvePts.push(`${scaleX(l).toFixed(1)},${scaleY(m).toFixed(1)}`);
  }

  // Project point
  const ptX = scaleX(Lb);
  const ptY = scaleY(Mn);
  const ptColor = ltbZone === 1 ? "#22c55e" : ltbZone === 2 ? "#f59e0b" : "#ef4444";

  return (
    <svg width={width} height={height} className="bg-white rounded border">
      {/* Axes */}
      <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="#cbd5e1" strokeWidth={1} />
      <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="#cbd5e1" strokeWidth={1} />

      {/* Y axis label */}
      <text x={12} y={padT + plotH / 2} fontSize={10} fill="#64748b" transform={`rotate(-90, 12, ${padT + plotH / 2})`} textAnchor="middle">
        Mn (kNm)
      </text>

      {/* X axis label */}
      <text x={padL + plotW / 2} y={height - 5} fontSize={10} fill="#64748b" textAnchor="middle">
        Lb (m)
      </text>

      {/* Mp line */}
      <line x1={padL} y1={scaleY(Mp)} x2={padL + plotW} y2={scaleY(Mp)} stroke="#94a3b8" strokeWidth={0.5} strokeDasharray="4,4" />
      <text x={padL - 4} y={scaleY(Mp) + 3} fontSize={9} fill="#64748b" textAnchor="end">
        Mp
      </text>

      {/* 0.7My line */}
      <line x1={padL} y1={scaleY(My07)} x2={padL + plotW} y2={scaleY(My07)} stroke="#94a3b8" strokeWidth={0.5} strokeDasharray="4,4" />
      <text x={padL - 4} y={scaleY(My07) + 3} fontSize={9} fill="#64748b" textAnchor="end">
        0.7My
      </text>

      {/* Lp vertical */}
      <line x1={scaleX(Lp)} y1={padT} x2={scaleX(Lp)} y2={padT + plotH} stroke="#3b82f6" strokeWidth={0.5} strokeDasharray="3,3" />
      <text x={scaleX(Lp)} y={padT + plotH + 12} fontSize={9} fill="#3b82f6" textAnchor="middle">
        Lp={Lp.toFixed(2)}m
      </text>

      {/* Lr vertical */}
      <line x1={scaleX(Lr)} y1={padT} x2={scaleX(Lr)} y2={padT + plotH} stroke="#f59e0b" strokeWidth={0.5} strokeDasharray="3,3" />
      <text x={scaleX(Lr)} y={padT + plotH + 12} fontSize={9} fill="#f59e0b" textAnchor="middle">
        Lr={Lr.toFixed(2)}m
      </text>

      {/* Zone labels */}
      <text x={scaleX(Lp / 2)} y={padT + 14} fontSize={8} fill="#94a3b8" textAnchor="middle">
        Zona 1
      </text>
      <text x={scaleX((Lp + Lr) / 2)} y={padT + 14} fontSize={8} fill="#94a3b8" textAnchor="middle">
        Zona 2
      </text>
      <text x={scaleX(Lr * 1.15)} y={padT + 14} fontSize={8} fill="#94a3b8" textAnchor="middle">
        Zona 3
      </text>

      {/* Curve */}
      <polyline points={curvePts.join(" ")} fill="none" stroke="#2563eb" strokeWidth={2} />

      {/* Project point */}
      <circle cx={ptX} cy={ptY} r={6} fill={ptColor} stroke="white" strokeWidth={2} />
      <text x={ptX + 10} y={ptY - 8} fontSize={10} fill={ptColor} fontWeight="bold">
        Lb={Lb.toFixed(2)}m
      </text>
      <text x={ptX + 10} y={ptY + 4} fontSize={9} fill={ptColor}>
        Mn={Mn.toFixed(0)} kNm (Zona {ltbZone})
      </text>
    </svg>
  );
}
