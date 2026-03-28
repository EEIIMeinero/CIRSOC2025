"use client";

import { Span, Support } from "@/lib/types";

interface SvgBeamGeometryProps {
  spans: Span[];
  supports: Support[];
  width?: number;
  height?: number;
  criticalSpan?: number;
}

const SUPPORT_ICONS: Record<string, (x: number, y: number) => React.ReactNode> = {
  pinned: (x, y) => (
    <g key={`pin-${x}`}>
      <polygon points={`${x},${y} ${x - 12},${y + 18} ${x + 12},${y + 18}`} fill="#3b82f6" stroke="#1e3a5f" strokeWidth={1} />
      <line x1={x - 16} y1={y + 20} x2={x + 16} y2={y + 20} stroke="#1e3a5f" strokeWidth={2} />
    </g>
  ),
  roller: (x, y) => (
    <g key={`roller-${x}`}>
      <polygon points={`${x},${y} ${x - 12},${y + 14} ${x + 12},${y + 14}`} fill="#22c55e" stroke="#166534" strokeWidth={1} />
      <circle cx={x} cy={y + 18} r={4} fill="#22c55e" stroke="#166534" strokeWidth={1} />
      <line x1={x - 16} y1={y + 24} x2={x + 16} y2={y + 24} stroke="#166534" strokeWidth={2} />
    </g>
  ),
  fixed: (x, y) => (
    <g key={`fixed-${x}`}>
      <rect x={x - 10} y={y} width={20} height={20} fill="#ef4444" stroke="#991b1b" strokeWidth={1} />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={x - 10 + i * 7} y1={y + 20} x2={x - 14 + i * 7} y2={y + 26} stroke="#991b1b" strokeWidth={1} />
      ))}
    </g>
  ),
};

export function SvgBeamGeometry({
  spans,
  supports,
  width = 800,
  height = 200,
  criticalSpan,
}: SvgBeamGeometryProps) {
  if (spans.length === 0) return null;

  const totalLength = spans.reduce((sum, s) => sum + s.length, 0);
  const padding = 60;
  const beamY = 80;
  const usableWidth = width - 2 * padding;
  const scale = usableWidth / totalLength;

  // Node positions
  const nodeX: number[] = [padding];
  let cumX = padding;
  for (const span of spans) {
    cumX += span.length * scale;
    nodeX.push(cumX);
  }

  return (
    <svg width={width} height={height} className="border rounded bg-white">
      {/* Spans */}
      {spans.map((span, i) => {
        const x1 = nodeX[i];
        const x2 = nodeX[i + 1];
        const isCritical = criticalSpan === i;
        const isLast = i === spans.length - 1;
        return (
          <g key={`span-${i}`}>
            {/* Highlight critical span */}
            {isCritical && (
              <rect
                x={x1}
                y={beamY - 20}
                width={x2 - x1}
                height={16}
                fill="#fef08a"
                rx={2}
              />
            )}
            {/* Beam */}
            <rect
              x={x1}
              y={beamY - 4}
              width={x2 - x1}
              height={8}
              fill="#475569"
              stroke="#1e293b"
              strokeWidth={1}
            />
            {/* Span label */}
            <text
              x={(x1 + x2) / 2}
              y={beamY - 24}
              textAnchor="middle"
              fontSize={11}
              fill={isCritical ? "#b45309" : "#475569"}
              fontWeight={isCritical ? "bold" : "normal"}
            >
              V{i + 1}{isLast ? " PG" : ""}{isCritical ? "*" : ""}
            </text>
            {/* Length dimension */}
            <line x1={x1} y1={beamY + 30} x2={x2} y2={beamY + 30} stroke="#94a3b8" strokeWidth={0.5} />
            <line x1={x1} y1={beamY + 26} x2={x1} y2={beamY + 34} stroke="#94a3b8" strokeWidth={0.5} />
            <line x1={x2} y1={beamY + 26} x2={x2} y2={beamY + 34} stroke="#94a3b8" strokeWidth={0.5} />
            <text
              x={(x1 + x2) / 2}
              y={beamY + 44}
              textAnchor="middle"
              fontSize={10}
              fill="#64748b"
            >
              {span.length.toFixed(1)} m
            </text>
          </g>
        );
      })}

      {/* Supports */}
      {supports.map((sup) => {
        const x = nodeX[sup.nodeIndex];
        if (x === undefined) return null;
        const renderFn =
          SUPPORT_ICONS[sup.type] || SUPPORT_ICONS.pinned;
        return (
          <g key={`sup-${sup.nodeIndex}`}>
            {renderFn(x, beamY + 4)}
            <text
              x={x}
              y={beamY + 52}
              textAnchor="middle"
              fontSize={9}
              fill="#94a3b8"
            >
              N{sup.nodeIndex}
            </text>
          </g>
        );
      })}

      {/* Total length */}
      <text
        x={width / 2}
        y={height - 10}
        textAnchor="middle"
        fontSize={11}
        fill="#334155"
        fontWeight="bold"
      >
        L total = {totalLength.toFixed(1)} m
      </text>
    </svg>
  );
}
