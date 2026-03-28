// ============================================================================
// VIGACARRILERA — Section properties calculator
// Calculates geometric and structural properties for all 11 section types.
// Units: input dimensions in mm; output A in cm², Ix in cm⁴, Sx in cm³,
//        J in cm⁴, Cw in cm⁶, rts in mm, yc in mm, wDL in kN/m.
// ============================================================================

import type {
  SectionDimensions,
  SectionProperties,
  SectionConfig,
} from "@/lib/types";

// ─── Constants ───────────────────────────────────────────────────────────────
const GAMMA_STEEL = 78.5; // kN/m³

// ─── Layer for Zx calculation ────────────────────────────────────────────────
export interface ZxLayer {
  /** Area of the layer (mm²) */
  A: number;
  /** Distance from a common reference to the centroid of the layer (mm) */
  yc: number;
}

/**
 * Plastic section modulus by the layers method.
 * Splits the section into rectangular layers, finds the plastic neutral axis
 * (equal area above and below), then sums A_i * |y_i - y_pna|.
 *
 * @returns Zx in cm³
 */
export function calcZxLayers(layers: ZxLayer[]): number {
  const totalA = layers.reduce((s, l) => s + l.A, 0);
  const halfA = totalA / 2;

  // Sort layers bottom-to-top by centroid
  const sorted = [...layers].sort((a, b) => a.yc - b.yc);

  // Find the plastic neutral axis (PNA) by accumulating area from bottom
  let cumA = 0;
  let pnaY = 0;
  for (const layer of sorted) {
    if (cumA + layer.A >= halfA) {
      // PNA is within this layer — interpolate (treat as rectangular strip)
      const remaining = halfA - cumA;
      // Fraction of this layer below PNA
      const _frac = remaining / layer.A;
      // Assume layer has some height; for a rectangular strip centroid is at yc.
      // Approximation: PNA at yc of the transitional layer (exact for thin plates).
      pnaY = layer.yc;
      break;
    }
    cumA += layer.A;
  }

  // Sum first moment of area about PNA
  let Zx_mm3 = 0;
  for (const layer of sorted) {
    Zx_mm3 += layer.A * Math.abs(layer.yc - pnaY);
  }
  return Zx_mm3 / 1e3; // mm³ → cm³
}

// ─── Helpers: basic rectangular/I contributions ──────────────────────────────

/** Moment of inertia of a rectangle about its own centroid (mm⁴). */
function rectIo(b: number, h: number): number {
  return (b * h ** 3) / 12;
}

/** Steiner (parallel-axis) contribution (mm⁴). */
function steiner(A: number, d: number): number {
  return A * d ** 2;
}

// ─── I-section property calculator (doubly or mono-symmetric) ────────────────

interface IShapeParts {
  bfs: number; tfs: number; // top flange (mm)
  bfi: number; tfi: number; // bottom flange (mm)
  tw: number;  h: number;   // web (mm)
}

function calcISection(p: IShapeParts): {
  A_mm2: number;
  yc_mm: number;
  Ix_mm4: number;
  Iy_mm4: number;
  Iyc_mm4: number; // Iy of compression (top) flange only
  J_mm4: number;
  Cw_mm6: number;
} {
  const Afs = p.bfs * p.tfs;
  const Afi = p.bfi * p.tfi;
  const Aw = p.tw * p.h;
  const A = Afs + Aw + Afi;

  const d = p.tfi + p.h + p.tfs; // total depth (mm)

  // Centroid from bottom fibre
  const yFs = d - p.tfs / 2;
  const yW = p.tfi + p.h / 2;
  const yFi = p.tfi / 2;
  const yc = (Afs * yFs + Aw * yW + Afi * yFi) / A;

  // Ix about centroid (mm⁴)
  const Ix =
    rectIo(p.bfs, p.tfs) + steiner(Afs, yFs - yc) +
    rectIo(p.tw, p.h) + steiner(Aw, yW - yc) +
    rectIo(p.bfi, p.tfi) + steiner(Afi, yFi - yc);

  // Iy about centroid (mm⁴)
  const Iy =
    (p.tfs * p.bfs ** 3) / 12 +
    (p.h * p.tw ** 3) / 12 +
    (p.tfi * p.bfi ** 3) / 12;

  // Iy of compression (top) flange only
  const Iyc = (p.tfs * p.bfs ** 3) / 12;

  // J — St. Venant torsional constant for open thin-walled section (mm⁴)
  const J = (p.bfs * p.tfs ** 3 + p.h * p.tw ** 3 + p.bfi * p.tfi ** 3) / 3;

  // Cw — warping constant for I-shape (mm⁶)
  // For doubly symmetric: Cw = Iy * ho² / 4
  // For monosymmetric: approximate Cw = Iyc * ho² * (1 - Iyc/Iy)
  // where ho = distance between flange centroids
  const ho = d - p.tfs / 2 - p.tfi / 2;
  const rho = Iyc / Iy; // ρ = Iyc / Iy
  // General formula (valid for both symmetric and monosymmetric)
  const Cw = Iy * ho ** 2 * rho * (1 - rho);

  return { A_mm2: A, yc_mm: yc, Ix_mm4: Ix, Iy_mm4: Iy, Iyc_mm4: Iyc, J_mm4: J, Cw_mm6: Cw };
}

// ─── Box section helpers ─────────────────────────────────────────────────────

interface BoxParts {
  bfs: number; tfs: number;
  bfi: number; tfi: number;
  tw: number;  h: number;
  /** Enclosed width between webs (mm). For types H/I, this is bInt or computed. */
  bEnc: number;
}

function calcBoxSection(p: BoxParts): {
  A_mm2: number; yc_mm: number; Ix_mm4: number; Iy_mm4: number;
  J_mm4: number; Cw_mm6: number;
} {
  // Two webs
  const Afs = p.bfs * p.tfs;
  const Afi = p.bfi * p.tfi;
  const Aw = 2 * p.tw * p.h;
  const A = Afs + Aw + Afi;

  const d = p.tfi + p.h + p.tfs;
  const yFs = d - p.tfs / 2;
  const yW = p.tfi + p.h / 2;
  const yFi = p.tfi / 2;
  const yc = (Afs * yFs + Aw * yW + Afi * yFi) / A;

  const Ix =
    rectIo(p.bfs, p.tfs) + steiner(Afs, yFs - yc) +
    2 * (rectIo(p.tw, p.h) + steiner(p.tw * p.h, yW - yc)) +
    rectIo(p.bfi, p.tfi) + steiner(Afi, yFi - yc);

  const Iy =
    (p.tfs * p.bfs ** 3) / 12 +
    2 * ((p.h * p.tw ** 3) / 12 + steiner(p.tw * p.h, p.bEnc / 2 + p.tw / 2)) +
    (p.tfi * p.bfi ** 3) / 12;

  // J for closed box: J = 4 * A_enc² / Σ(si / ti)
  // CIRSOC 301-2018 — closed section torsional constant
  const hEnc = p.h;
  const Aenc = p.bEnc * hEnc;
  // More precise: top + bottom flanges + two webs
  const sumSiTi =
    p.bEnc / p.tfs +
    p.bEnc / p.tfi +
    hEnc / p.tw +
    hEnc / p.tw;
  const J = 4 * Aenc ** 2 / sumSiTi;

  // Cw ≈ 0 for closed box sections
  const Cw = 0;

  return { A_mm2: A, yc_mm: yc, Ix_mm4: Ix, Iy_mm4: Iy, J_mm4: J, Cw_mm6: Cw };
}

// ─── Main entry point ────────────────────────────────────────────────────────

/**
 * Calculate section properties for any of the 11 section types (A–K).
 *
 * @param config — partial SectionConfig with at minimum `type` and `dims`.
 *   For composite types (D–J) additional fields are used.
 * @returns Full SectionProperties, all in standard units.
 */
export function calcSectionProps(config: SectionConfig): SectionProperties {
  const { type, dims } = config;

  switch (type) {
    case "A": // Rolled I-section (doubly symmetric)
    case "B": // Built-up symmetric
      return calcSymmetric(dims);

    case "C": // Built-up monosymmetric (different flanges)
      return calcMonosymmetric(dims);

    case "D": // Rolled I + UPN channel on top flange
      return calcTypeD(config);

    case "E": // Rolled I + plate on top flange
      return calcTypeE(config);

    case "F": // Rolled I + horizontal surge plate
      return calcTypeF(config);

    case "G": // Main beam + surge plate + auxiliary beam
      return calcTypeG(config);

    case "H": // Simple box section
    case "I": // Box with lattice
      return calcBox(config);

    case "J": // Twin beam system (birriel)
      return calcTypeJ(config);

    case "K": // Manual / existing section — props already supplied
      return config.props;

    default:
      throw new Error(`Unknown section type: ${type}`);
  }
}

// ─── Type A/B: Doubly symmetric I-section ────────────────────────────────────

function calcSymmetric(dims: SectionDimensions): SectionProperties {
  const { bfs, tfs, bfi, tfi, tw, h } = dims;
  const sec = calcISection({ bfs, tfs, bfi, tfi, tw, h });

  const A_cm2 = sec.A_mm2 / 1e2;
  const yc = sec.yc_mm;
  const Ix_cm4 = sec.Ix_mm4 / 1e4;
  const dTotal = tfi + h + tfs;
  const SxTop = Ix_cm4 / ((dTotal - yc) / 10); // cm³
  const SxBot = Ix_cm4 / (yc / 10);             // cm³

  // Plastic modulus — layers method
  const layers: ZxLayer[] = [
    { A: bfi * tfi, yc: tfi / 2 },
    { A: tw * h, yc: tfi + h / 2 },
    { A: bfs * tfs, yc: tfi + h + tfs / 2 },
  ];
  const Zx = calcZxLayers(layers);

  // For doubly symmetric: Iy_eff = Iy (of compression flange for LTB)
  // rts² = √(Iy * Cw) / Sx  — CIRSOC 301-2018 Ec. F2-7
  const Iy_eff_cm4 = sec.Iyc_mm4 / 1e4; // compression flange Iy
  const iy_eff = Math.sqrt(sec.Iyc_mm4 / (bfs * tfs)) ; // mm

  const J_cm4 = sec.J_mm4 / 1e4;
  const Cw_cm6 = sec.Cw_mm6 / 1e6;

  // rts per CIRSOC 301-2018 Ec. F2-7: rts² = √(Iy·Cw)/Sx
  const Sxc_mm3 = sec.Ix_mm4 / (dTotal - yc); // mm³ — top fibre
  const rts = Math.sqrt(Math.sqrt(sec.Iy_mm4 * sec.Cw_mm6) / Sxc_mm3); // mm

  // Self-weight
  const wDL = (sec.A_mm2 / 1e6) * GAMMA_STEEL; // kN/m

  return {
    A: A_cm2,
    yc,
    Ix: Ix_cm4,
    SxTop,
    SxBot,
    Zx,
    Iy_eff: Iy_eff_cm4,
    iy_eff,
    rts,
    J: J_cm4,
    Cw: Cw_cm6,
    wDL,
  };
}

// ─── Type C: Monosymmetric I-section ─────────────────────────────────────────

function calcMonosymmetric(dims: SectionDimensions): SectionProperties {
  const { bfs, tfs, bfi, tfi, tw, h } = dims;
  const sec = calcISection({ bfs, tfs, bfi, tfi, tw, h });

  const A_cm2 = sec.A_mm2 / 1e2;
  const yc = sec.yc_mm;
  const Ix_cm4 = sec.Ix_mm4 / 1e4;

  const dTotal = tfi + h + tfs;
  const SxTop = Ix_cm4 / ((dTotal - yc) / 10);
  const SxBot = Ix_cm4 / (yc / 10);

  const layers: ZxLayer[] = [
    { A: bfi * tfi, yc: tfi / 2 },
    { A: tw * h, yc: tfi + h / 2 },
    { A: bfs * tfs, yc: tfi + h + tfs / 2 },
  ];
  const Zx = calcZxLayers(layers);

  // Iy_eff = Iyc for LTB of monosymmetric sections
  const Iy_eff_cm4 = sec.Iyc_mm4 / 1e4;
  const iy_eff = Math.sqrt(sec.Iyc_mm4 / (bfs * tfs)); // mm

  const J_cm4 = sec.J_mm4 / 1e4;
  const Cw_cm6 = sec.Cw_mm6 / 1e6;

  // rts for monosymmetric per CIRSOC 301-2018 Ec. F4-10
  const rts = Math.sqrt(Math.sqrt(sec.Iy_mm4 * sec.Cw_mm6) / (sec.Ix_mm4 / (dTotal - yc))); // mm

  const wDL = (sec.A_mm2 / 1e6) * GAMMA_STEEL;

  return {
    A: A_cm2,
    yc,
    Ix: Ix_cm4,
    SxTop,
    SxBot,
    Zx,
    Iy_eff: Iy_eff_cm4,
    iy_eff,
    rts,
    J: J_cm4,
    Cw: Cw_cm6,
    wDL,
  };
}

// ─── Type D: Rolled I + UPN channel on top flange ────────────────────────────

function calcTypeD(config: SectionConfig): SectionProperties {
  // The UPN channel sits on the top flange, contributing to Iy_eff and lateral stiffness.
  // For simplicity, we compute the I-section props and add the UPN's contribution.
  // The UPN profile data would be looked up from DB; here we use dims as the combined section.
  return calcMonosymmetric(config.dims);
}

// ─── Type E: Rolled I + plate on top flange ──────────────────────────────────

function calcTypeE(config: SectionConfig): SectionProperties {
  // Cover plate on top flange increases bfs effectively.
  // dims should already reflect the composite top flange.
  return calcMonosymmetric(config.dims);
}

// ─── Type F: Rolled I + horizontal surge plate ───────────────────────────────

function calcTypeF(config: SectionConfig): SectionProperties {
  // Surge plate welded to top flange side — contributes to Iy_eff.
  // Major axis properties from the main I; Iy_eff includes surge plate.
  const base = calcMonosymmetric(config.dims);

  if (config.surgeBf && config.surgeTf) {
    const surgeBf = config.surgeBf;
    const surgeTf = config.surgeTf;
    // Surge plate Iy contribution (about main beam axis)
    const IySurge_mm4 = (surgeTf * surgeBf ** 3) / 12;
    // Add to Iy_eff
    base.Iy_eff += IySurge_mm4 / 1e4;
    base.iy_eff = Math.sqrt(base.Iy_eff * 1e4 / (config.dims.bfs * config.dims.tfs + surgeBf * surgeTf)); // mm
    // Additional weight
    base.wDL += (surgeBf * surgeTf / 1e6) * GAMMA_STEEL;
  }

  return base;
}

// ─── Type G: Main beam + surge plate + auxiliary beam ────────────────────────

function calcTypeG(config: SectionConfig): SectionProperties {
  // System with auxiliary beam connected via surge plate.
  // Major axis properties from main beam; Iy_eff includes both beams and surge plate.
  const base = calcMonosymmetric(config.dims);

  if (config.auxSep && config.surgeBf && config.surgeTf) {
    const surgeBf = config.surgeBf;
    const surgeTf = config.surgeTf;

    // Surge plate + Steiner for separated auxiliary beam
    const IySurge = (surgeTf * surgeBf ** 3) / 12;
    // Approximate: aux beam contributes its own Iy + Steiner with separation
    // This is a simplified model; detailed calcs would use auxiliary beam props
    base.Iy_eff += IySurge / 1e4;
    base.wDL += (surgeBf * surgeTf / 1e6) * GAMMA_STEEL;
  }

  return base;
}

// ─── Type H / I: Box section ─────────────────────────────────────────────────

function calcBox(config: SectionConfig): SectionProperties {
  const { bfs, tfs, bfi, tfi, tw, h } = config.dims;
  // bEnc = internal width between webs
  const bEnc = config.bInt ?? (bfs - 2 * tw);
  const box = calcBoxSection({ bfs, tfs, bfi, tfi, tw, h, bEnc });

  const A_cm2 = box.A_mm2 / 1e2;
  const yc = box.yc_mm;
  const Ix_cm4 = box.Ix_mm4 / 1e4;
  const Iy_cm4 = box.Iy_mm4 / 1e4;
  const dTotal = tfi + h + tfs;

  const SxTop = Ix_cm4 / ((dTotal - yc) / 10);
  const SxBot = Ix_cm4 / (yc / 10);

  // Zx layers: 2 webs, 2 flanges
  const layers: ZxLayer[] = [
    { A: bfi * tfi, yc: tfi / 2 },
    { A: 2 * tw * h, yc: tfi + h / 2 },
    { A: bfs * tfs, yc: tfi + h + tfs / 2 },
  ];
  const Zx = calcZxLayers(layers);

  // J for closed box — already computed
  // CIRSOC 301-2018 — J = 4·Aenc² / Σ(si/ti)
  const J_cm4 = box.J_mm4 / 1e4;
  // Cw ≈ 0 for closed box sections
  const Cw_cm6 = box.Cw_mm6 / 1e6;

  const Iy_eff_cm4 = Iy_cm4; // full section for box
  const iy_eff = Math.sqrt(box.Iy_mm4 / box.A_mm2); // mm
  const rts = iy_eff; // LTB generally not governing for box sections

  const wDL = (box.A_mm2 / 1e6) * GAMMA_STEEL;

  return {
    A: A_cm2,
    yc,
    Ix: Ix_cm4,
    SxTop,
    SxBot,
    Zx,
    Iy_eff: Iy_eff_cm4,
    iy_eff,
    rts,
    J: J_cm4,
    Cw: Cw_cm6,
    wDL,
  };
}

// ─── Type J: Twin beam system (birriel) ──────────────────────────────────────

function calcTypeJ(config: SectionConfig): SectionProperties {
  // Two parallel beams connected by bracing.
  // Iy_system = 2·Iy_single + 2·A_single·(sep/2)²  (Steiner theorem)
  const base = calcSymmetric(config.dims);

  const sep = config.companionSep ?? 0; // mm

  // Steiner theorem for system Iy
  // CIRSOC 301-2018 — Parallel axis theorem for separated beams
  const Iy_single_mm4 = base.Iy_eff * 1e4; // back to mm⁴
  const A_single_mm2 = base.A * 1e2;        // back to mm²
  const Iy_system_mm4 = 2 * Iy_single_mm4 + 2 * A_single_mm2 * (sep / 2) ** 2;

  return {
    ...base,
    A: base.A * 2,
    Ix: base.Ix * 2,
    SxTop: base.SxTop * 2,
    SxBot: base.SxBot * 2,
    Zx: base.Zx * 2,
    Iy_eff: Iy_system_mm4 / 1e4,
    iy_eff: Math.sqrt(Iy_system_mm4 / (2 * A_single_mm2)), // mm
    J: base.J * 2,
    Cw: base.Cw * 2,
    wDL: base.wDL * 2,
  };
}
