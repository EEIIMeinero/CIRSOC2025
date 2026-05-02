// ============================================================================
// VIGACARRILERA — Train of loads and envelope calculation
// Simply supported beam model for crane runway beams.
// Units: lengths in m (span) and mm (axle positions), forces in kN, moments in kNm.
// ============================================================================

import type { CraneConfig, EnvelopeResult } from "@/lib/types";

// ─── Types ───────────────────────────────────────────────────────────────────

/** A single concentrated load in the train pattern. */
export interface TrainLoad {
  /** Position relative to start of train (m) */
  dx: number;
  /** Vertical force (kN) */
  Pv: number;
  /** Horizontal force (kN) */
  Ph: number;
}

/** Reaction at a support. */
export interface Reactions {
  /** Reaction at left support A (kN) */
  Ra: number;
  /** Reaction at right support B (kN) */
  Rb: number;
}

/** Moment and shear at a point. */
export interface DiagramPoint {
  x: number;  // m
  M: number;  // kNm
  V: number;  // kN
}

// ─── Pattern construction ────────────────────────────────────────────────────

/**
 * Combine multiple crane axle patterns into one train of loads.
 *
 * @param cranes    Array of crane configurations.
 * @param nCranes   Number of cranes to consider (1 or 2).
 * @param gapMm     Minimum gap between cranes (mm).
 * @returns Array of TrainLoad with positions in m.
 */
export function makePattern(
  cranes: CraneConfig[],
  nCranes: number,
  gapMm: number
): TrainLoad[] {
  const loads: TrainLoad[] = [];

  for (let ci = 0; ci < Math.min(nCranes, cranes.length); ci++) {
    const crane = cranes[ci];
    // Offset for this crane: first crane at 0, second at max-dx of first + gap
    let offset = 0;
    if (ci > 0 && loads.length > 0) {
      const prevMax = Math.max(...loads.map((l) => l.dx));
      offset = prevMax + gapMm / 1000; // convert mm to m
    }

    for (const axle of crane.axles) {
      loads.push({
        dx: offset + axle.dx / 1000, // mm → m
        Pv: axle.Pv,
        Ph: axle.Ph,
      });
    }
  }

  return loads.sort((a, b) => a.dx - b.dx);
}

// ─── Reactions for SS beam ───────────────────────────────────────────────────

/**
 * Calculate reactions at both supports for a simply supported beam
 * with a train of loads at a given position.
 *
 * @param Lm    Span length (m).
 * @param loads Train of loads.
 * @param pos   Position of the first load from the left support (m).
 *              Loads at x < 0 or x > L are off the span (no contribution).
 * @returns Reactions at supports A (left) and B (right).
 */
export function calcReactions(
  Lm: number,
  loads: TrainLoad[],
  pos: number
): Reactions {
  let Ra = 0;
  let Rb = 0;

  for (const load of loads) {
    const x = pos + load.dx; // position on the beam (m)
    if (x < 0 || x > Lm) continue; // load is off the span

    // ΣMB = 0 → Ra = P·(L-x)/L
    Ra += (load.Pv * (Lm - x)) / Lm;
    // ΣMA = 0 → Rb = P·x/L
    Rb += (load.Pv * x) / Lm;
  }

  return { Ra, Rb };
}

// ─── Internal forces at point x ──────────────────────────────────────────────

function momentAt(Lm: number, loads: TrainLoad[], pos: number, x: number): number {
  // M(x) = Ra·x - Σ P·(x - xi) for all loads left of x
  const { Ra } = calcReactions(Lm, loads, pos);
  let M = Ra * x;

  for (const load of loads) {
    const xi = pos + load.dx;
    if (xi < 0 || xi > Lm) continue;
    if (xi < x) {
      M -= load.Pv * (x - xi);
    }
  }
  return M;
}

function shearAt(Lm: number, loads: TrainLoad[], pos: number, x: number): number {
  const { Ra } = calcReactions(Lm, loads, pos);
  let V = Ra;

  for (const load of loads) {
    const xi = pos + load.dx;
    if (xi < 0 || xi > Lm) continue;
    if (xi <= x) {
      V -= load.Pv;
    }
  }
  return V;
}

// ─── Diagrams ────────────────────────────────────────────────────────────────

/**
 * Generate M(x) and V(x) diagrams for a simply supported beam
 * under a given train position, including distributed dead load.
 *
 * @param Lm    Span (m).
 * @param loads Train of concentrated loads.
 * @param wDL   Uniformly distributed dead load (kN/m).
 * @param pos   Position of first load from left support (m).
 * @param nPts  Number of output points (default 60).
 */
export function makeDiags(
  Lm: number,
  loads: TrainLoad[],
  wDL: number,
  pos: number,
  nPts: number = 60
): DiagramPoint[] {
  const pts: DiagramPoint[] = [];
  const dx = Lm / nPts;

  for (let i = 0; i <= nPts; i++) {
    const x = i * dx;
    // Concentrated loads
    const Mc = momentAt(Lm, loads, pos, x);
    const Vc = shearAt(Lm, loads, pos, x);
    // Uniform DL: M_DL(x) = wDL*x*(L-x)/2, V_DL(x) = wDL*(L/2 - x)
    const Mdl = (wDL * x * (Lm - x)) / 2;
    const Vdl = wDL * (Lm / 2 - x);

    pts.push({
      x,
      M: Mc + Mdl,
      V: Vc + Vdl,
    });
  }
  return pts;
}

// ─── Critical position ──────────────────────────────────────────────────────

/**
 * Find the critical train position that produces the maximum bending moment
 * on a simply supported span.
 *
 * Uses the criterion: maximum moment occurs under a load when the midpoint
 * between that load and the resultant of all loads on the span coincides
 * with the beam midspan.
 *
 * @param Lm    Span (m).
 * @param loads Train loads.
 * @returns Position (m) of the first load from left support at maximum moment.
 */
export function critPos(Lm: number, loads: TrainLoad[]): number {
  const trainLen = Math.max(...loads.map((l) => l.dx)) - Math.min(...loads.map((l) => l.dx));
  const startPos = -trainLen;
  const endPos = Lm;
  const nSteps = 200;
  const step = (endPos - startPos) / nSteps;

  let bestPos = 0;
  let bestM = 0;

  for (let i = 0; i <= nSteps; i++) {
    const pos = startPos + i * step;
    // Check moment under each load on the span
    for (const load of loads) {
      const xLoad = pos + load.dx;
      if (xLoad < 0 || xLoad > Lm) continue;
      const M = momentAt(Lm, loads, pos, xLoad);
      if (M > bestM) {
        bestM = M;
        bestPos = pos;
      }
    }
  }

  return bestPos;
}

// ─── Envelope ────────────────────────────────────────────────────────────────

/**
 * Compute the envelope of M and V for a simply supported span across
 * multiple train positions (≥ 140).
 *
 * @param Lm    Span (m).
 * @param loads Train loads.
 * @param nPositions Number of train positions to evaluate (default 140).
 * @param nPoints    Number of evaluation points along span (default 60).
 * @returns Array of EnvelopeResult for each span point.
 */
export function envSpan(
  Lm: number,
  loads: TrainLoad[],
  nPositions: number = 140,
  nPoints: number = 60
): EnvelopeResult[] {
  const trainLen = Math.max(...loads.map((l) => l.dx), 0);
  const startPos = -trainLen;
  const endPos = Lm;
  const posStep = (endPos - startPos) / Math.max(nPositions - 1, 1);
  const xStep = Lm / nPoints;

  // Initialize envelope arrays
  const envelope: EnvelopeResult[] = [];
  for (let j = 0; j <= nPoints; j++) {
    envelope.push({
      x: j * xStep,
      Mmax: -Infinity,
      Mmin: Infinity,
      Vmax: -Infinity,
      Vmin: Infinity,
    });
  }

  // Sweep train positions
  for (let i = 0; i < nPositions; i++) {
    const pos = startPos + i * posStep;

    for (let j = 0; j <= nPoints; j++) {
      const x = j * xStep;
      const M = momentAt(Lm, loads, pos, x);
      const V = shearAt(Lm, loads, pos, x);

      if (M > envelope[j].Mmax) envelope[j].Mmax = M;
      if (M < envelope[j].Mmin) envelope[j].Mmin = M;
      if (V > envelope[j].Vmax) envelope[j].Vmax = V;
      if (V < envelope[j].Vmin) envelope[j].Vmin = V;
    }
  }

  // Replace infinities with 0
  for (const e of envelope) {
    if (e.Mmax === -Infinity) e.Mmax = 0;
    if (e.Mmin === Infinity) e.Mmin = 0;
    if (e.Vmax === -Infinity) e.Vmax = 0;
    if (e.Vmin === Infinity) e.Vmin = 0;
  }

  return envelope;
}
