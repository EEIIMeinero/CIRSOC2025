"use client";

import { CraneAxle } from "@/lib/types";

interface SvgTesteraIsometricProps {
  axles: CraneAxle[];
  phi: number;
  color?: string;
  width?: number;
  height?: number;
}

// Isometric projection helpers
const COS30 = Math.cos(Math.PI / 6); // ~0.866
const SIN30 = Math.sin(Math.PI / 6); // ~0.5

function isoX(x: number, y: number): number {
  return x * COS30 - y * COS30;
}

function isoY(x: number, y: number, z: number): number {
  return -x * SIN30 - y * SIN30 - z;
}

// Project a 3D point to 2D isometric
function iso(x: number, y: number, z: number, cx: number, cy: number): [number, number] {
  return [cx + isoX(x, y), cy - isoY(x, y, z)];
}

export function SvgTesteraIsometric({
  axles,
  phi,
  color = "#3b82f6",
  width = 650,
  height = 380,
}: SvgTesteraIsometricProps) {
  if (axles.length === 0) return null;

  const maxDx = Math.max(...axles.map((a) => a.dx));
  const maxPv = Math.max(...axles.map((a) => a.Pv || a.Pw * (1 + phi)), 1);
  const maxPh = Math.max(...axles.map((a) => a.Ph), 0.1);
  const maxHT = Math.max(...axles.map((a) => a.HT), 0.1);

  // Center of the scene
  const cx = width / 2;
  const cy = height * 0.52;

  // Scale factor: map mm to scene units
  const sceneLen = Math.min(width * 0.55, 320);
  const scaleX = maxDx > 0 ? sceneLen / maxDx : 1;

  // Beam dimensions in scene units
  const beamLen = maxDx > 0 ? maxDx * scaleX + 60 : 200;
  const beamW = 40; // flange width (lateral)
  const beamH = 14; // flange thickness
  const railH = 10;
  const railW = 16;
  const wheelR = 10;
  const craneBodyH = 30;

  // Offsets: center the beam longitudinally
  const xOff = -(beamLen / 2);
  const _firstAxleScene = axles[0].dx * scaleX;
  const _lastAxleScene = axles[axles.length - 1].dx * scaleX;

  // Helper to create isometric polygon path
  function isoRect3D(
    x1: number, y1: number, z1: number,
    dx: number, dy: number, dz: number,
    face: "top" | "front" | "side"
  ): string {
    let pts: [number, number][];
    if (face === "top") {
      pts = [
        iso(x1, y1, z1 + dz, cx, cy),
        iso(x1 + dx, y1, z1 + dz, cx, cy),
        iso(x1 + dx, y1 + dy, z1 + dz, cx, cy),
        iso(x1, y1 + dy, z1 + dz, cx, cy),
      ];
    } else if (face === "front") {
      pts = [
        iso(x1, y1 + dy, z1, cx, cy),
        iso(x1 + dx, y1 + dy, z1, cx, cy),
        iso(x1 + dx, y1 + dy, z1 + dz, cx, cy),
        iso(x1, y1 + dy, z1 + dz, cx, cy),
      ];
    } else {
      // side (right face)
      pts = [
        iso(x1 + dx, y1, z1, cx, cy),
        iso(x1 + dx, y1 + dy, z1, cx, cy),
        iso(x1 + dx, y1 + dy, z1 + dz, cx, cy),
        iso(x1 + dx, y1, z1 + dz, cx, cy),
      ];
    }
    return pts.map((p) => `${p[0]},${p[1]}`).join(" ");
  }

  // Beam top flange box
  const bx = xOff - 30;
  const bz = 0; // base z
  const byc = -beamW / 2;

  // Rail on top of beam
  const rx = xOff - 20;
  const rz = beamH;
  const ryc = -railW / 2;

  // Axle positions
  const axleScenePositions = axles.map((a) => xOff + 30 + a.dx * scaleX);

  // Crane body box
  const cbx1 = axleScenePositions[0] - 10;
  const cbx2 = axleScenePositions[axleScenePositions.length - 1] + 10;
  const cbW = cbx2 - cbx1;
  const cbz = rz + railH + wheelR * 2 + 2;

  return (
    <svg width={width} height={height} className="border rounded bg-gradient-to-b from-slate-50 to-white">
      <defs>
        <marker id="arrowRedIso" viewBox="0 0 10 10" refX="10" refY="5" markerWidth={5} markerHeight={5} orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
        </marker>
        <marker id="arrowBlueIso" viewBox="0 0 10 10" refX="10" refY="5" markerWidth={5} markerHeight={5} orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
        </marker>
        <marker id="arrowGreenIso" viewBox="0 0 10 10" refX="10" refY="5" markerWidth={5} markerHeight={5} orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#16a34a" />
        </marker>
        <linearGradient id="beamGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <linearGradient id="railGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#78716c" />
          <stop offset="100%" stopColor="#57534e" />
        </linearGradient>
      </defs>

      {/* Title */}
      <text x={width / 2} y={16} textAnchor="middle" fontSize={11} fill="#475569" fontWeight="600">
        Vista Isometrica - Testera de Grua
      </text>

      {/* Beam top flange - 3 visible faces */}
      <polygon
        points={isoRect3D(bx, byc, bz, beamLen, beamW, 0, "top")}
        fill="#94a3b8" stroke="#64748b" strokeWidth={0.8}
      />
      <polygon
        points={isoRect3D(bx, byc, bz, beamLen, beamW, beamH, "top")}
        fill="#cbd5e1" stroke="#64748b" strokeWidth={0.8}
      />
      <polygon
        points={isoRect3D(bx, byc, bz, beamLen, beamW, beamH, "front")}
        fill="#94a3b8" stroke="#64748b" strokeWidth={0.8}
      />
      <polygon
        points={isoRect3D(bx, byc, bz, beamLen, beamW, beamH, "side")}
        fill="#78716c" stroke="#64748b" strokeWidth={0.8}
      />

      {/* Rail - on top of beam */}
      <polygon
        points={isoRect3D(rx, ryc, rz, beamLen - 20, railW, railH, "top")}
        fill="#a8a29e" stroke="#78716c" strokeWidth={0.8}
      />
      <polygon
        points={isoRect3D(rx, ryc, rz, beamLen - 20, railW, railH, "front")}
        fill="#78716c" stroke="#57534e" strokeWidth={0.8}
      />
      <polygon
        points={isoRect3D(rx, ryc, rz, beamLen - 20, railW, railH, "side")}
        fill="#6b7280" stroke="#57534e" strokeWidth={0.8}
      />

      {/* Crane body - translucent box */}
      <polygon
        points={isoRect3D(cbx1, -beamW * 0.6, cbz, cbW, beamW * 1.2, craneBodyH, "top")}
        fill={color} fillOpacity={0.15} stroke={color} strokeWidth={1.2}
      />
      <polygon
        points={isoRect3D(cbx1, -beamW * 0.6, cbz, cbW, beamW * 1.2, craneBodyH, "front")}
        fill={color} fillOpacity={0.1} stroke={color} strokeWidth={1}
      />
      <polygon
        points={isoRect3D(cbx1, -beamW * 0.6, cbz, cbW, beamW * 1.2, craneBodyH, "side")}
        fill={color} fillOpacity={0.08} stroke={color} strokeWidth={1}
      />
      {/* Crane label */}
      {(() => {
        const lp = iso(cbx1 + cbW / 2, beamW * 0.6, cbz + craneBodyH / 2, cx, cy);
        return (
          <text x={lp[0]} y={lp[1]} textAnchor="middle" fontSize={10} fill={color} fontWeight="bold" opacity={0.8}>
            Testera
          </text>
        );
      })()}

      {/* Axles - wheels and force arrows */}
      {axles.map((axle, i) => {
        const ax = axleScenePositions[i];
        const Pv = axle.Pv || axle.Pw * (1 + phi);
        const wheelZ = rz + railH;

        // Wheel as isometric ellipse (cylinder approximation)
        const wheelCenter = iso(ax, 0, wheelZ + wheelR, cx, cy);
        const _wheelBot = iso(ax, 0, wheelZ, cx, cy);

        // Vertical axle line from crane body to wheel
        const axleTop = iso(ax, 0, cbz, cx, cy);
        const axleBot = iso(ax, 0, wheelZ + wheelR * 2, cx, cy);

        // Pv arrow (vertical, red) - pointing down from wheel
        const pvStart = iso(ax, 0, -5, cx, cy);
        const pvLen = Math.max(25, (Pv / maxPv) * 55);
        const pvEnd = iso(ax, 0, -5 - pvLen, cx, cy);

        // Ph arrow (lateral, blue) - pointing sideways
        const phLen = axle.Ph > 0 ? Math.max(20, (axle.Ph / maxPh) * 45) : 0;
        const phStart = iso(ax, beamW / 2 + 3, wheelZ + wheelR, cx, cy);
        const phEnd = iso(ax, beamW / 2 + 3 + phLen, wheelZ + wheelR, cx, cy);

        // HT arrow (longitudinal, green) - pointing along beam
        const htLen = axle.HT > 0 ? Math.max(20, (axle.HT / maxHT) * 45) : 0;
        const htStart = iso(ax + 3, 0, wheelZ + wheelR, cx, cy);
        const htEnd = iso(ax + 3 + htLen, 0, wheelZ + wheelR, cx, cy);

        return (
          <g key={i}>
            {/* Axle line */}
            <line x1={axleTop[0]} y1={axleTop[1]} x2={axleBot[0]} y2={axleBot[1]}
              stroke="#374151" strokeWidth={2} />

            {/* Wheel - ellipse for isometric cylinder look */}
            <ellipse cx={wheelCenter[0]} cy={wheelCenter[1]}
              rx={wheelR * COS30} ry={wheelR * 0.5}
              fill="#374151" stroke="#111827" strokeWidth={1.5} />
            {/* Wheel inner circle */}
            <ellipse cx={wheelCenter[0]} cy={wheelCenter[1]}
              rx={wheelR * COS30 * 0.4} ry={wheelR * 0.2}
              fill="#6b7280" />
            {/* Wheel side face */}
            <ellipse cx={wheelCenter[0]} cy={wheelCenter[1] + 3}
              rx={wheelR * COS30} ry={wheelR * 0.5}
              fill="none" stroke="#111827" strokeWidth={0.5} opacity={0.3} />

            {/* Pv arrow (vertical, red) */}
            <line x1={pvStart[0]} y1={pvStart[1]} x2={pvEnd[0]} y2={pvEnd[1]}
              stroke="#ef4444" strokeWidth={2.5} markerEnd="url(#arrowRedIso)" />
            <text x={pvEnd[0] + 6} y={pvEnd[1] + 4} fontSize={9} fill="#ef4444" fontWeight="bold">
              {i === 0 ? `Pv=${Pv.toFixed(0)} kN` : `${Pv.toFixed(0)}`}
            </text>

            {/* Pw label at first axle */}
            {i === 0 && (
              <text x={pvEnd[0] + 6} y={pvEnd[1] + 15} fontSize={8} fill="#9ca3af">
                Pw={axle.Pw.toFixed(0)} kN
              </text>
            )}

            {/* Ph arrow (lateral, blue) */}
            {phLen > 0 && (
              <>
                <line x1={phStart[0]} y1={phStart[1]} x2={phEnd[0]} y2={phEnd[1]}
                  stroke="#3b82f6" strokeWidth={2} markerEnd="url(#arrowBlueIso)" />
                {i === 0 && (
                  <text x={phEnd[0] + 4} y={phEnd[1] - 3} fontSize={9} fill="#3b82f6" fontWeight="bold">
                    Ph={axle.Ph.toFixed(0)} kN
                  </text>
                )}
              </>
            )}

            {/* HT arrow (longitudinal, green) */}
            {htLen > 0 && (
              <>
                <line x1={htStart[0]} y1={htStart[1]} x2={htEnd[0]} y2={htEnd[1]}
                  stroke="#16a34a" strokeWidth={2} markerEnd="url(#arrowGreenIso)" />
                {i === 0 && (
                  <text x={htEnd[0] + 4} y={htEnd[1] + 4} fontSize={9} fill="#16a34a" fontWeight="bold">
                    HT={axle.HT.toFixed(0)} kN
                  </text>
                )}
              </>
            )}

            {/* Axle label */}
            <text x={wheelCenter[0]} y={wheelCenter[1] - wheelR - 2} textAnchor="middle"
              fontSize={8} fill="#6b7280" fontWeight="500">
              E{i + 1}
            </text>
          </g>
        );
      })}

      {/* Dimension lines between axles */}
      {axles.slice(1).map((axle, i) => {
        const x1 = axleScenePositions[i];
        const x2 = axleScenePositions[i + 1];
        const dimZ = -20;
        const p1 = iso(x1, beamW * 0.8, dimZ, cx, cy);
        const p2 = iso(x2, beamW * 0.8, dimZ, cx, cy);
        const pm = iso((x1 + x2) / 2, beamW * 0.8, dimZ, cx, cy);
        // Tick marks
        const t1a = iso(x1, beamW * 0.8, dimZ - 4, cx, cy);
        const t1b = iso(x1, beamW * 0.8, dimZ + 4, cx, cy);
        const t2a = iso(x2, beamW * 0.8, dimZ - 4, cx, cy);
        const t2b = iso(x2, beamW * 0.8, dimZ + 4, cx, cy);
        return (
          <g key={`dim-${i}`}>
            <line x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]}
              stroke="#94a3b8" strokeWidth={0.8} />
            <line x1={t1a[0]} y1={t1a[1]} x2={t1b[0]} y2={t1b[1]}
              stroke="#94a3b8" strokeWidth={0.8} />
            <line x1={t2a[0]} y1={t2a[1]} x2={t2b[0]} y2={t2b[1]}
              stroke="#94a3b8" strokeWidth={0.8} />
            <text x={pm[0]} y={pm[1] + 12} textAnchor="middle" fontSize={9} fill="#64748b">
              {axle.dx - axles[i].dx} mm
            </text>
          </g>
        );
      })}

      {/* Impact factor badge */}
      <rect x={width - 135} y={height - 32} width={125} height={22} rx={4}
        fill="#fef3c7" stroke="#f59e0b" strokeWidth={1} />
      <text x={width - 73} y={height - 17} textAnchor="middle" fontSize={9} fill="#92400e" fontWeight="bold">
        {"\u03C6"} = {(phi * 100).toFixed(0)}% (impacto)
      </text>

      {/* Force legend */}
      <g transform={`translate(10, ${height - 60})`}>
        <rect x={0} y={0} width={120} height={50} rx={4} fill="white" fillOpacity={0.9} stroke="#e2e8f0" />
        <line x1={8} y1={12} x2={22} y2={12} stroke="#ef4444" strokeWidth={2} />
        <text x={26} y={15} fontSize={8} fill="#374151">Pv (vertical)</text>
        <line x1={8} y1={26} x2={22} y2={26} stroke="#3b82f6" strokeWidth={2} />
        <text x={26} y={29} fontSize={8} fill="#374151">Ph (lateral)</text>
        <line x1={8} y1={40} x2={22} y2={40} stroke="#16a34a" strokeWidth={2} />
        <text x={26} y={43} fontSize={8} fill="#374151">HT (longitudinal)</text>
      </g>

      {/* Axis indicator */}
      {(() => {
        const ox = 18;
        const oy = 50;
        const al = 30;
        const xp = iso(al, 0, 0, ox, oy);
        const yp = iso(0, al, 0, ox, oy);
        const zp = iso(0, 0, al, ox, oy);
        return (
          <g>
            <line x1={ox} y1={oy} x2={xp[0]} y2={xp[1]} stroke="#94a3b8" strokeWidth={1} />
            <text x={xp[0] + 2} y={xp[1]} fontSize={8} fill="#94a3b8">x</text>
            <line x1={ox} y1={oy} x2={yp[0]} y2={yp[1]} stroke="#94a3b8" strokeWidth={1} />
            <text x={yp[0] - 8} y={yp[1]} fontSize={8} fill="#94a3b8">y</text>
            <line x1={ox} y1={oy} x2={zp[0]} y2={zp[1]} stroke="#94a3b8" strokeWidth={1} />
            <text x={zp[0] + 2} y={zp[1] - 2} fontSize={8} fill="#94a3b8">z</text>
          </g>
        );
      })()}
    </svg>
  );
}
