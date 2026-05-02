"use client";

import { CompactnessResult } from "@/lib/types";

interface CompactnessGraphProps {
  compactness: CompactnessResult;
  width?: number;
  height?: number;
}

function ScaleBar({
  label,
  lambda,
  lambdaP,
  lambdaR,
  classification,
  y,
  width,
}: {
  label: string;
  lambda: number;
  lambdaP: number;
  lambdaR: number;
  classification: string;
  y: number;
  width: number;
}) {
  const padL = 80;
  const padR = 30;
  const barW = width - padL - padR;
  const maxLambda = Math.max(lambdaR * 1.3, lambda * 1.2);

  const scaleX = (v: number) => padL + (v / maxLambda) * barW;

  const compactW = scaleX(lambdaP) - padL;
  const noncompactW = scaleX(lambdaR) - scaleX(lambdaP);
  const slenderW = padL + barW - scaleX(lambdaR);

  const markerX = scaleX(lambda);

  return (
    <g>
      <text x={10} y={y + 14} fontSize={11} fill="#334155" fontWeight="bold">{label}</text>

      {/* Compact zone */}
      <rect x={padL} y={y} width={compactW} height={24} fill="#86efac" rx={2} />
      <text x={padL + compactW / 2} y={y + 15} fontSize={8} fill="#166534" textAnchor="middle">COMPACTA</text>

      {/* Non-compact zone */}
      <rect x={scaleX(lambdaP)} y={y} width={noncompactW} height={24} fill="#fde68a" rx={0} />
      <text x={scaleX(lambdaP) + noncompactW / 2} y={y + 15} fontSize={8} fill="#92400e" textAnchor="middle">NO-COMPACTA</text>

      {/* Slender zone */}
      <rect x={scaleX(lambdaR)} y={y} width={slenderW} height={24} fill="#fca5a5" rx={2} />
      <text x={scaleX(lambdaR) + slenderW / 2} y={y + 15} fontSize={8} fill="#991b1b" textAnchor="middle">ESBELTA</text>

      {/* Lambda_p marker */}
      <line x1={scaleX(lambdaP)} y1={y - 2} x2={scaleX(lambdaP)} y2={y + 26} stroke="#166534" strokeWidth={1.5} />
      <text x={scaleX(lambdaP)} y={y + 38} fontSize={8} fill="#166534" textAnchor="middle">λp={lambdaP.toFixed(1)}</text>

      {/* Lambda_r marker */}
      <line x1={scaleX(lambdaR)} y1={y - 2} x2={scaleX(lambdaR)} y2={y + 26} stroke="#92400e" strokeWidth={1.5} />
      <text x={scaleX(lambdaR)} y={y + 38} fontSize={8} fill="#92400e" textAnchor="middle">λr={lambdaR.toFixed(1)}</text>

      {/* Actual lambda marker */}
      <line x1={markerX} y1={y - 8} x2={markerX} y2={y + 28} stroke="#ef4444" strokeWidth={2.5} />
      <circle cx={markerX} cy={y - 8} r={4} fill="#ef4444" />
      <text x={markerX} y={y - 14} fontSize={9} fill="#ef4444" textAnchor="middle" fontWeight="bold">
        λ={lambda.toFixed(1)}
      </text>

      {/* Classification text */}
      <text x={padL + barW + 5} y={y + 15} fontSize={9} fill={
        classification === "compact" ? "#166534" :
        classification === "noncompact" ? "#92400e" : "#991b1b"
      } fontWeight="bold">
        {classification === "compact" ? "C" : classification === "noncompact" ? "NC" : "E"}
      </text>
    </g>
  );
}

export function CompactnessGraph({ compactness, width = 500, height = 140 }: CompactnessGraphProps) {
  return (
    <svg width={width} height={height} className="bg-white rounded border">
      <ScaleBar
        label="Ala:"
        lambda={compactness.lambda_f}
        lambdaP={compactness.lambda_pf}
        lambdaR={compactness.lambda_rf}
        classification={compactness.flangeClass}
        y={10}
        width={width}
      />
      <ScaleBar
        label="Alma:"
        lambda={compactness.lambda_w}
        lambdaP={compactness.lambda_pw}
        lambdaR={compactness.lambda_rw}
        classification={compactness.webClass}
        y={70}
        width={width}
      />
    </svg>
  );
}
