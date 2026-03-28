// ============================================================================
// VIGACARRILERA — Main calculation engine / orchestrator
// Receives full project data, runs all structural checks, returns results.
// ============================================================================

import type {
  ProjectData,
  SpanResult,
  ReactionResult,
  EnvelopeResult,
  FlexuralStrength,
} from "@/lib/types";

import { makePattern, envSpan, calcReactions, critPos, type TrainLoad } from "./loads";
import { calcDesignForces } from "./combinations";
import { checkFlexureMajor } from "./checks/flexionMayor";
import { checkFlexureMinor } from "./checks/flexionMenor";
import { checkShear } from "./checks/corte";
import { checkInteraction } from "./checks/interaccion";
import { checkDeflection } from "./checks/deflexion";

// ─── Public API ─────────────────────────────────────────────────────────────

export interface AnalysisResults {
  spanResults: SpanResult[];
  reactions: ReactionResult[];
  envelopes: EnvelopeResult[][];
}

/**
 * Run the full structural analysis for a crane runway beam project.
 *
 * Each span is treated as simply supported (SS). The engine:
 *  1. Builds the train-of-loads pattern from active cranes.
 *  2. Computes M/V envelopes per span.
 *  3. Calculates design forces using the governing LRFD combination.
 *  4. Runs all CIRSOC 301 checks (flexure, shear, interaction, deflection).
 *  5. Returns per-span results, reactions, and envelope data.
 */
export function runAnalysis(project: ProjectData): AnalysisResults {
  const { spans, supports, section, cranes, settings, general } = project;

  // Guard: no section defined
  if (!section || !section.props || !section.dims) {
    return { spanResults: [], reactions: [], envelopes: [] };
  }

  const { props, dims } = section;

  // Guard: degenerate section
  if (props.Ix === 0 || props.Zx === 0) {
    return { spanResults: [], reactions: [], envelopes: [] };
  }

  const Fy = general.material.Fy; // MPa
  const E = general.material.E;   // MPa

  // ─── 1. Build train-of-loads pattern ──────────────────────────────────────

  let pattern: TrainLoad[] = [];
  const hasCranes = cranes.length > 0 && cranes.some((c) => c.axles.length > 0);

  if (hasCranes) {
    // Use up to 2 cranes; gap = first crane's minSeparation or 1000 mm
    const nCranes = Math.min(cranes.length, 2);
    const gapMm = cranes[0]?.minSeparation ?? 1000;
    pattern = makePattern(cranes, nCranes, gapMm);
  }

  // Build a horizontal-force-only pattern for minor-axis envelope
  const hPattern: TrainLoad[] = pattern.map((p) => ({
    dx: p.dx,
    Pv: Math.abs(p.Ph), // use horizontal forces as "vertical" for envelope calc
    Ph: 0,
  }));
  const hasHorizLoads = hPattern.some((p) => p.Pv > 0);

  // ─── 2. Settings ──────────────────────────────────────────────────────────

  const nPositions = Math.max(settings.envelopePositions, 140);
  const nPoints = Math.max(settings.diagramPoints, 60);
  const combos = settings.combinations;

  // ─── 3. Per-span analysis ─────────────────────────────────────────────────

  const spanResults: SpanResult[] = [];
  const envelopes: EnvelopeResult[][] = [];
  const reactionsByNode: Map<number, { Rmax: number; Rmin: number; Rinst: number }> = new Map();

  // Initialise reaction accumulators for each support node
  for (const sup of supports) {
    reactionsByNode.set(sup.nodeIndex, { Rmax: 0, Rmin: 0, Rinst: 0 });
  }

  for (const span of spans) {
    const Lm = span.length; // m
    const idx = span.index;

    // Skip degenerate spans
    if (Lm <= 0) continue;

    // ── 3a. Vertical envelope ────────────────────────────────────────────

    let spanEnvelope: EnvelopeResult[];

    if (pattern.length > 0) {
      spanEnvelope = envSpan(Lm, pattern, nPositions, nPoints);
    } else {
      // No cranes: envelope is all zeros (only dead load)
      spanEnvelope = [];
      const dx = Lm / nPoints;
      for (let j = 0; j <= nPoints; j++) {
        spanEnvelope.push({ x: j * dx, Mmax: 0, Mmin: 0, Vmax: 0, Vmin: 0 });
      }
    }

    envelopes.push(spanEnvelope);

    // ── 3b. Extract envelope maxima ──────────────────────────────────────

    const Mv_env = Math.max(...spanEnvelope.map((e) => e.Mmax), 0);
    const Vv_env = Math.max(
      ...spanEnvelope.map((e) => Math.abs(e.Vmax)),
      ...spanEnvelope.map((e) => Math.abs(e.Vmin)),
      0
    );

    // ── 3c. Horizontal moment envelope ───────────────────────────────────

    let Mh_env = 0;
    let Ph_max = 0;

    if (hasHorizLoads) {
      const hEnv = envSpan(Lm, hPattern, nPositions, nPoints);
      Mh_env = Math.max(...hEnv.map((e) => e.Mmax), 0);
      Ph_max = Math.max(...pattern.map((p) => Math.abs(p.Ph)), 0);
    }

    // ── 3d. Dead load forces ─────────────────────────────────────────────

    const wDL = props.wDL; // kN/m
    const Mpp = (wDL * Lm ** 2) / 8;  // kNm
    const Vpp = (wDL * Lm) / 2;       // kN

    // ── 3e. Design forces — sweep all combinations, keep governing ───────

    let MuxGov = 0;
    let MuyGov = 0;
    let VuGov = 0;

    for (const combo of combos) {
      const f = calcDesignForces(Mpp, Mv_env, Mh_env, Vpp, Vv_env, combo);
      // Governing = largest total demand (Mux + Muy) or largest individual
      if (Math.abs(f.Mux) + Math.abs(f.Muy) > Math.abs(MuxGov) + Math.abs(MuyGov)) {
        MuxGov = f.Mux;
        MuyGov = f.Muy;
        VuGov = f.Vu;
      }
      // Also check if any combo produces higher shear
      if (Math.abs(f.Vu) > Math.abs(VuGov)) {
        VuGov = f.Vu;
      }
    }

    // Take absolute values for checks
    MuxGov = Math.abs(MuxGov);
    MuyGov = Math.abs(MuyGov);
    VuGov = Math.abs(VuGov);

    // ── 3f. Section checks ───────────────────────────────────────────────

    // Lb — unbraced length
    const Lb = settings.Lb === "auto" ? Lm : (settings.Lb as number);

    // Cb — LTB modification factor (auto defaults to 1.0, conservative)
    const Cb = settings.Cb === "auto" ? 1.0 : (settings.Cb as number);

    // Is section monosymmetric?
    const isMono = section.type === "C";

    // Major-axis flexure (CIRSOC 301-2018 F2 / F4)
    const flexure: FlexuralStrength = checkFlexureMajor(
      props,
      dims,
      Fy,
      E,
      Lb,
      Cb,
      isMono,
      isMono ? 0.5 : undefined
    );

    // Minor-axis flexure (CIRSOC 301-2018 F6)
    // Approximate Sy and Zy for the top flange:
    //   Sy = tfs * bfs^2 / 6   (elastic modulus of a rectangle)
    //   Zy = tfs * bfs^2 / 4   (plastic modulus of a rectangle)
    const Sy = (dims.tfs * dims.bfs ** 2) / 6 / 1e3; // mm^3 -> cm^3
    const Zy = (dims.tfs * dims.bfs ** 2) / 4 / 1e3; // mm^3 -> cm^3

    const flexureMinor = Sy > 0 && Zy > 0
      ? checkFlexureMinor(Fy, Sy, Zy)
      : { Mn: 0, phiMn: 0 };

    // Shear (CIRSOC 301-2018 G2)
    const isRolled = section.type === "A";
    const shear = checkShear(dims.d, dims.tw, Fy, E, dims.h, isRolled);

    // Interaction (CIRSOC 301-2018 H1)
    const phiMnx = flexure.phiMn > 0 ? flexure.phiMn : 1e-6;
    const phiMny = flexureMinor.phiMn > 0 ? flexureMinor.phiMn : 1e-6;

    const interaction = checkInteraction(MuxGov, MuyGov, phiMnx, phiMny);

    // Deflection (CIRSOC 301-2018 L3)
    let aPos = Lm / 2;
    if (pattern.length > 0) {
      const cp = critPos(Lm, pattern);
      const heaviest = pattern.reduce((a, b) => (b.Pv > a.Pv ? b : a), pattern[0]);
      const xHeavy = cp + heaviest.dx;
      aPos = Math.max(0.01, Math.min(xHeavy, Lm - 0.01));
    }

    const Pv_max = pattern.length > 0 ? Math.max(...pattern.map((p) => p.Pv)) : 0;

    const deflection = checkDeflection(
      Lm,
      props.Ix,
      props.Iy_eff,
      E,
      Pv_max,
      Ph_max,
      aPos,
      settings.deflLimitV,
      settings.deflLimitH
    );

    // ── 3g. Determine status ─────────────────────────────────────────────

    const eta = interaction.eta;
    const etaShear = shear.phiVn > 0 ? VuGov / shear.phiVn : 0;
    const etaMax = Math.max(eta, etaShear, deflection.ratioV, deflection.ratioH);

    let status: "ok" | "warning" | "fail";
    if (etaMax >= 1.0) {
      status = "fail";
    } else if (etaMax >= 0.85) {
      status = "warning";
    } else {
      status = "ok";
    }

    spanResults.push({
      spanIndex: idx,
      length: Lm,
      flexure,
      flexureMinor: { Mn: flexureMinor.Mn, phiMn: flexureMinor.phiMn },
      shear,
      interaction,
      deflection,
      Mux: MuxGov,
      Muy: MuyGov,
      Vu: VuGov,
      etaMax,
      status,
    });

    // ── 3h. Reactions at supports ────────────────────────────────────────

    const leftNode = idx;
    const rightNode = idx + 1;
    const RdlHalf = (wDL * Lm) / 2;

    if (pattern.length > 0) {
      const trainLen = Math.max(...pattern.map((l) => l.dx), 0);
      const startPos = -trainLen;
      const endPos = Lm;
      const nSweep = Math.max(nPositions, 140);
      const sweepStep = (endPos - startPos) / Math.max(nSweep - 1, 1);

      let RaMax = 0, RbMax = 0;
      let RaMin = Infinity, RbMin = Infinity;

      for (let i = 0; i < nSweep; i++) {
        const pos = startPos + i * sweepStep;
        const { Ra, Rb } = calcReactions(Lm, pattern, pos);
        const RaT = Ra + RdlHalf;
        const RbT = Rb + RdlHalf;
        if (RaT > RaMax) RaMax = RaT;
        if (RaT < RaMin) RaMin = RaT;
        if (RbT > RbMax) RbMax = RbT;
        if (RbT < RbMin) RbMin = RbT;
      }

      if (RaMin === Infinity) RaMin = 0;
      if (RbMin === Infinity) RbMin = 0;

      // Instantaneous at critical position
      const cp = critPos(Lm, pattern);
      const { Ra: RaCrit, Rb: RbCrit } = calcReactions(Lm, pattern, cp);

      accumReaction(reactionsByNode, leftNode, RaMax, RaMin, RaCrit + RdlHalf);
      accumReaction(reactionsByNode, rightNode, RbMax, RbMin, RbCrit + RdlHalf);
    } else {
      accumReaction(reactionsByNode, leftNode, RdlHalf, RdlHalf, RdlHalf);
      accumReaction(reactionsByNode, rightNode, RdlHalf, RdlHalf, RdlHalf);
    }
  }

  // ─── 4. Build reactions array ───────────────────────────────────────────────

  const reactions: ReactionResult[] = [];
  for (const sup of supports) {
    const r = reactionsByNode.get(sup.nodeIndex);
    reactions.push({
      nodeIndex: sup.nodeIndex,
      Rmax: r?.Rmax ?? 0,
      Rmin: r?.Rmin ?? 0,
      Rinst: r?.Rinst ?? 0,
    });
  }

  return { spanResults, reactions, envelopes };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function accumReaction(
  map: Map<number, { Rmax: number; Rmin: number; Rinst: number }>,
  nodeIndex: number,
  rMax: number,
  rMin: number,
  rInst: number
): void {
  const existing = map.get(nodeIndex);
  if (existing) {
    existing.Rmax = Math.max(existing.Rmax, rMax);
    existing.Rmin = existing.Rmin === 0 ? rMin : Math.min(existing.Rmin, rMin);
    existing.Rinst = Math.max(existing.Rinst, rInst);
  }
}
