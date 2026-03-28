"use client";

import { SectionDimensions, SectionProperties } from "@/lib/types";

interface SvgSectionProps {
  dims: SectionDimensions;
  props?: SectionProperties;
  width?: number;
  height?: number;
}

export function SvgSection({ dims, props, width = 300, height = 400 }: SvgSectionProps) {
  const { bfs, tfs, bfi, tfi, tw, h, d } = dims;
  if (!d || !bfs || !bfi) return null;

  // Scale to fit
  const scale = Math.min((width - 80) / Math.max(bfs, bfi), (height - 80) / d);
  const cx = width / 2;
  const topY = 40;

  // Scaled dimensions
  const sBfs = bfs * scale;
  const sTfs = tfs * scale;
  const sBfi = bfi * scale;
  const sTfi = tfi * scale;
  const sTw = tw * scale;
  const sH = h * scale;
  const sD = d * scale;

  // Positions
  const topFlangeY = topY;
  const webTopY = topY + sTfs;
  const botFlangeY = topY + sD - sTfi;

  // Centroid line
  const ycScaled = props ? (d - props.yc) * scale + topY : topY + sD / 2;

  return (
    <svg width={width} height={height} className="border rounded bg-white">
      {/* Top flange */}
      <rect
        x={cx - sBfs / 2}
        y={topFlangeY}
        width={sBfs}
        height={sTfs}
        fill="#3b82f6"
        stroke="#1e3a5f"
        strokeWidth={1}
      />
      {/* Web */}
      <rect
        x={cx - sTw / 2}
        y={webTopY}
        width={sTw}
        height={sH}
        fill="#60a5fa"
        stroke="#1e3a5f"
        strokeWidth={1}
      />
      {/* Bottom flange */}
      <rect
        x={cx - sBfi / 2}
        y={botFlangeY}
        width={sBfi}
        height={sTfi}
        fill="#3b82f6"
        stroke="#1e3a5f"
        strokeWidth={1}
      />

      {/* Centroid line */}
      {props && (
        <>
          <line
            x1={cx - Math.max(sBfs, sBfi) / 2 - 15}
            y1={ycScaled}
            x2={cx + Math.max(sBfs, sBfi) / 2 + 15}
            y2={ycScaled}
            stroke="#ef4444"
            strokeWidth={1.5}
            strokeDasharray="6,3"
          />
          <text
            x={cx + Math.max(sBfs, sBfi) / 2 + 18}
            y={ycScaled + 4}
            fontSize={10}
            fill="#ef4444"
            fontWeight="bold"
          >
            CG
          </text>
        </>
      )}

      {/* Dimension labels */}
      {/* d - height total */}
      <line x1={cx + sBfs / 2 + 20} y1={topY} x2={cx + sBfs / 2 + 20} y2={topY + sD} stroke="#666" strokeWidth={0.5} />
      <text x={cx + sBfs / 2 + 24} y={topY + sD / 2 + 4} fontSize={9} fill="#666">
        d={d}
      </text>

      {/* bfs - top flange width */}
      <line x1={cx - sBfs / 2} y1={topY - 8} x2={cx + sBfs / 2} y2={topY - 8} stroke="#666" strokeWidth={0.5} />
      <text x={cx - 15} y={topY - 12} fontSize={9} fill="#666" textAnchor="middle">
        bfs={bfs}
      </text>

      {/* bfi - bottom flange width */}
      <line x1={cx - sBfi / 2} y1={topY + sD + 12} x2={cx + sBfi / 2} y2={topY + sD + 12} stroke="#666" strokeWidth={0.5} />
      <text x={cx - 15} y={topY + sD + 24} fontSize={9} fill="#666" textAnchor="middle">
        bfi={bfi}
      </text>

      {/* Sx+ / Sx- labels for asymmetric sections */}
      {props && Math.abs(props.SxTop - props.SxBot) > 0.1 && (
        <>
          <text x={10} y={topY + 14} fontSize={8} fill="#3b82f6">
            Sx+={props.SxTop.toFixed(1)}
          </text>
          <text x={10} y={topY + sD - 4} fontSize={8} fill="#3b82f6">
            Sx-={props.SxBot.toFixed(1)}
          </text>
        </>
      )}
    </svg>
  );
}
