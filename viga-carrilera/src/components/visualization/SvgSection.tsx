"use client";

import { SectionDimensions, SectionProperties, SectionType } from "@/lib/types";

interface RailVizConfig {
  hr: number; // mm
  br: number; // mm
}

interface SvgSectionProps {
  dims: SectionDimensions;
  props?: SectionProperties;
  railConfig?: RailVizConfig;
  sectionType?: SectionType;
  width?: number;
  height?: number;
}

export function SvgSection({ dims, props, railConfig, sectionType = "B", width = 300, height = 400 }: SvgSectionProps) {
  const { bfs, tfs, bfi, tfi, tw, h, d } = dims;
  if (!d || !bfs || !bfi) return null;

  const railH = railConfig && railConfig.hr > 0 ? railConfig.hr : 0;
  const railW = railConfig && railConfig.br > 0 ? railConfig.br : 0;
  const totalH = d + railH;

  const maxW = Math.max(bfs, bfi, railW);
  const scale = Math.min((width - 80) / maxW, (height - 80) / totalH);
  const cx = width / 2;
  const topY = 40 + railH * scale;

  const sBfs = bfs * scale;
  const sTfs = tfs * scale;
  const sBfi = bfi * scale;
  const sTfi = tfi * scale;
  const sTw = tw * scale;
  const sH = h * scale;
  const sD = d * scale;

  const topFlangeY = topY;
  const webTopY = topY + sTfs;
  const botFlangeY = topY + sD - sTfi;

  const ycScaled = props ? (d - props.yc) * scale + topY : topY + sD / 2;

  const sRailH = railH * scale;
  const sRailW = railW * scale;
  const railBaseW = sRailW * 0.6;
  const railHeadW = sRailW;
  const railWebW = sRailW * 0.35;

  const isBox = sectionType === "H" || sectionType === "I";
  const isTwin = sectionType === "J";

  return (
    <svg width={width} height={height} className="border rounded bg-white">
      {/* Rail */}
      {railConfig && railH > 0 && sRailH > 2 && (
        <>
          <rect x={cx - railBaseW / 2} y={topY - sRailH * 0.15} width={railBaseW} height={sRailH * 0.15}
            fill="#78716c" stroke="#44403c" strokeWidth={0.8} />
          <rect x={cx - railWebW / 2} y={topY - sRailH * 0.75} width={railWebW} height={sRailH * 0.60}
            fill="#a8a29e" stroke="#44403c" strokeWidth={0.8} />
          <rect x={cx - railHeadW / 2} y={topY - sRailH} width={railHeadW} height={sRailH * 0.25}
            rx={sRailH * 0.06} fill="#78716c" stroke="#44403c" strokeWidth={0.8} />
          <text x={cx + railHeadW / 2 + 6} y={topY - sRailH / 2 + 3} fontSize={8} fill="#78716c" fontWeight="bold">
            Carril
          </text>
        </>
      )}

      {/* Box section (H/I) — two webs */}
      {isBox && (
        <>
          <rect x={cx - sBfs / 2} y={topFlangeY} width={sBfs} height={sTfs}
            fill="#3b82f6" stroke="#1e3a5f" strokeWidth={1} />
          {/* Left web */}
          <rect x={cx - sBfs / 2 + (sBfs - sBfi) / 4} y={webTopY} width={sTw} height={sH}
            fill="#60a5fa" stroke="#1e3a5f" strokeWidth={1} />
          {/* Right web */}
          <rect x={cx + sBfs / 2 - (sBfs - sBfi) / 4 - sTw} y={webTopY} width={sTw} height={sH}
            fill="#60a5fa" stroke="#1e3a5f" strokeWidth={1} />
          {/* Lattice diagonals for type I */}
          {sectionType === "I" && (
            <>
              {Array.from({ length: 5 }).map((_, i) => {
                const y1 = webTopY + (i / 5) * sH;
                const y2 = webTopY + ((i + 1) / 5) * sH;
                const xL = cx - sBfs / 2 + (sBfs - sBfi) / 4 + sTw;
                const xR = cx + sBfs / 2 - (sBfs - sBfi) / 4 - sTw;
                return (
                  <line key={i} x1={i % 2 === 0 ? xL : xR} y1={y1} x2={i % 2 === 0 ? xR : xL} y2={y2}
                    stroke="#1e3a5f" strokeWidth={0.8} strokeDasharray="3,2" />
                );
              })}
            </>
          )}
          <rect x={cx - sBfi / 2} y={botFlangeY} width={sBfi} height={sTfi}
            fill="#3b82f6" stroke="#1e3a5f" strokeWidth={1} />
        </>
      )}

      {/* Twin beam (J) */}
      {isTwin && (
        <>
          {[-1, 1].map((side) => {
            const offset = sBfs * 0.6 * side;
            return (
              <g key={side}>
                <rect x={cx + offset - sBfs * 0.4 / 2} y={topFlangeY} width={sBfs * 0.4} height={sTfs}
                  fill="#3b82f6" stroke="#1e3a5f" strokeWidth={1} />
                <rect x={cx + offset - sTw / 2} y={webTopY} width={sTw} height={sH}
                  fill="#60a5fa" stroke="#1e3a5f" strokeWidth={1} />
                <rect x={cx + offset - sBfi * 0.4 / 2} y={botFlangeY} width={sBfi * 0.4} height={sTfi}
                  fill="#3b82f6" stroke="#1e3a5f" strokeWidth={1} />
              </g>
            );
          })}
          {/* Bracing lines between twin beams */}
          {[0.25, 0.5, 0.75].map((frac) => {
            const yBrace = webTopY + frac * sH;
            return (
              <line key={frac} x1={cx - sBfs * 0.6 + sTw / 2} y1={yBrace} x2={cx + sBfs * 0.6 - sTw / 2} y2={yBrace}
                stroke="#1e3a5f" strokeWidth={0.8} strokeDasharray="4,2" />
            );
          })}
          <text x={cx} y={topFlangeY - 4} fontSize={8} fill="#666" textAnchor="middle">Birriel</text>
        </>
      )}

      {/* Standard I-section (A, B, C, D, E, F, G) */}
      {!isBox && !isTwin && (
        <>
          <rect x={cx - sBfs / 2} y={topFlangeY} width={sBfs} height={sTfs}
            fill="#3b82f6" stroke="#1e3a5f" strokeWidth={1} />
          <rect x={cx - sTw / 2} y={webTopY} width={sTw} height={sH}
            fill="#60a5fa" stroke="#1e3a5f" strokeWidth={1} />
          <rect x={cx - sBfi / 2} y={botFlangeY} width={sBfi} height={sTfi}
            fill="#3b82f6" stroke="#1e3a5f" strokeWidth={1} />

          {/* Type D: UPN channel on top flange */}
          {sectionType === "D" && (
            <g>
              <rect x={cx - sBfs * 0.35 / 2} y={topFlangeY - sTfs * 1.2} width={sBfs * 0.35} height={sTfs * 1.2}
                fill="#f59e0b" stroke="#92400e" strokeWidth={0.8} opacity={0.8} />
              <text x={cx + sBfs * 0.35 / 2 + 4} y={topFlangeY - sTfs * 0.4} fontSize={7} fill="#92400e">UPN</text>
            </g>
          )}

          {/* Type E: Cover plate on top flange */}
          {sectionType === "E" && (
            <g>
              <rect x={cx - sBfs * 0.55} y={topFlangeY - sTfs * 0.6} width={sBfs * 1.1} height={sTfs * 0.6}
                fill="#10b981" stroke="#065f46" strokeWidth={0.8} opacity={0.7} />
              <text x={cx + sBfs * 0.55 + 4} y={topFlangeY - sTfs * 0.1} fontSize={7} fill="#065f46">PL</text>
            </g>
          )}

          {/* Type F: Surge plate horizontal */}
          {sectionType === "F" && (
            <g>
              <rect x={cx + sBfs / 2} y={topFlangeY + sTfs / 2 - 2} width={sBfs * 0.5} height={4}
                fill="#f59e0b" stroke="#92400e" strokeWidth={0.8} />
              <text x={cx + sBfs / 2 + sBfs * 0.5 + 4} y={topFlangeY + sTfs / 2 + 2} fontSize={7} fill="#92400e">SP</text>
            </g>
          )}

          {/* Type G: Surge plate + auxiliary beam */}
          {sectionType === "G" && (
            <g>
              {/* Surge plate */}
              <rect x={cx + sBfs / 2} y={topFlangeY + sTfs / 2 - 2} width={sBfs * 0.6} height={4}
                fill="#f59e0b" stroke="#92400e" strokeWidth={0.8} />
              {/* Auxiliary beam (smaller I) */}
              <rect x={cx + sBfs / 2 + sBfs * 0.6 - sBfs * 0.12} y={topFlangeY} width={sBfs * 0.24} height={sTfs * 0.7}
                fill="#8b5cf6" stroke="#4c1d95" strokeWidth={0.8} />
              <rect x={cx + sBfs / 2 + sBfs * 0.6 - sTw * 0.4} y={topFlangeY + sTfs * 0.7} width={sTw * 0.8} height={sH * 0.4}
                fill="#a78bfa" stroke="#4c1d95" strokeWidth={0.8} />
              <rect x={cx + sBfs / 2 + sBfs * 0.6 - sBfs * 0.12} y={topFlangeY + sTfs * 0.7 + sH * 0.4} width={sBfs * 0.24} height={sTfs * 0.7}
                fill="#8b5cf6" stroke="#4c1d95" strokeWidth={0.8} />
              <text x={cx + sBfs / 2 + sBfs * 0.6 + sBfs * 0.15} y={topFlangeY + sH * 0.3} fontSize={7} fill="#4c1d95">Aux</text>
            </g>
          )}
        </>
      )}

      {/* Centroid line */}
      {props && !isTwin && (
        <>
          <line
            x1={cx - Math.max(sBfs, sBfi) / 2 - 15} y1={ycScaled}
            x2={cx + Math.max(sBfs, sBfi) / 2 + 15} y2={ycScaled}
            stroke="#ef4444" strokeWidth={1.5} strokeDasharray="6,3" />
          <text x={cx + Math.max(sBfs, sBfi) / 2 + 18} y={ycScaled + 4}
            fontSize={10} fill="#ef4444" fontWeight="bold">CG</text>
        </>
      )}

      {/* Dimension labels */}
      {!isTwin && (
        <>
          <line x1={cx + sBfs / 2 + 20} y1={topY} x2={cx + sBfs / 2 + 20} y2={topY + sD} stroke="#666" strokeWidth={0.5} />
          <text x={cx + sBfs / 2 + 24} y={topY + sD / 2 + 4} fontSize={9} fill="#666">d={d}</text>
          <line x1={cx - sBfs / 2} y1={topY - 8} x2={cx + sBfs / 2} y2={topY - 8} stroke="#666" strokeWidth={0.5} />
          <text x={cx - 15} y={topY - 12} fontSize={9} fill="#666" textAnchor="middle">bfs={bfs}</text>
          <line x1={cx - sBfi / 2} y1={topY + sD + 12} x2={cx + sBfi / 2} y2={topY + sD + 12} stroke="#666" strokeWidth={0.5} />
          <text x={cx - 15} y={topY + sD + 24} fontSize={9} fill="#666" textAnchor="middle">bfi={bfi}</text>
        </>
      )}

      {/* Sx+ / Sx- labels for asymmetric sections */}
      {props && Math.abs(props.SxTop - props.SxBot) > 0.1 && !isTwin && (
        <>
          <text x={10} y={topY + 14} fontSize={8} fill="#3b82f6">Sx+={props.SxTop.toFixed(1)}</text>
          <text x={10} y={topY + sD - 4} fontSize={8} fill="#3b82f6">Sx-={props.SxBot.toFixed(1)}</text>
        </>
      )}
    </svg>
  );
}
