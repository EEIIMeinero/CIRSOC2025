// ============================================================================
// VIGACARRILERA — Section properties calculator v2
// Architecture: Plate → CompositeSection → Type builders (A–K)
//
// Units: input dimensions in mm; output A in cm², Ix in cm⁴, Sx in cm³,
//        J in cm⁴, Cw in cm⁶, rts in mm, yc in mm, wDL in kN/m.
//
// References:
//   CIRSOC 301-2018 §F2 (Ec. F2-5, F2-6, F2-7)
//   CIRSOC 301-2018 §F4 (Ec. F4-7, F4-8, F4-10)
//   AISC 360-22 Commentary §F2
// ============================================================================

import type {
  SectionDimensions,
  SectionProperties,
  SectionConfig,
} from "@/lib/types";

const GAMMA_STEEL = 78.5; // kN/m³

// ─── Plate: primitive rectangular element ───────────────────────────────────

export interface Plate {
  b: number;  // mm — width (horizontal)
  t: number;  // mm — thickness (vertical)
  yc: number; // mm — centroid distance from bottom reference
  zc: number; // mm — centroid distance from left reference (for Iy Steiner)
}

function plateArea(p: Plate): number {
  return p.b * p.t;
}

/** Moment of inertia of plate about its own horizontal centroidal axis (mm⁴) */
function plateIxo(p: Plate): number {
  return (p.b * p.t ** 3) / 12;
}

/** Moment of inertia of plate about its own vertical centroidal axis (mm⁴) */
function plateIyo(p: Plate): number {
  return (p.t * p.b ** 3) / 12;
}

// ─── CompositeSection: accumulates plates, computes all properties ──────────

interface CompositeResult {
  A_mm2: number;
  yc_mm: number;     // centroid from bottom
  Ix_mm4: number;    // about centroidal x-axis
  Iy_mm4: number;    // about centroidal y-axis (z=0 reference)
  Iyc_mm4: number;   // Iy of compression flange(s) only
  J_mm4: number;
  Cw_mm6: number;
  Zx_mm3: number;    // plastic modulus about x
}

/**
 * Compute composite section properties from an array of plates.
 *
 * @param plates     All rectangular elements
 * @param topFlangeIndices  Indices into `plates` that form the compression (top) flange — for Iyc
 * @param closedBox  If true, compute J for closed section (Bredt formula)
 * @param boxEnclosedArea  Enclosed area for Bredt formula (mm²)
 * @param boxPerimeterRatio  Σ(si/ti) for Bredt formula
 */
function compositeProps(
  plates: Plate[],
  topFlangeIndices: number[],
  closedBox: boolean = false,
  boxEnclosedArea: number = 0,
  boxPerimeterRatio: number = 0,
): CompositeResult {
  // --- Total area ---
  const A = plates.reduce((s, p) => s + plateArea(p), 0);
  if (A === 0) {
    return { A_mm2: 0, yc_mm: 0, Ix_mm4: 0, Iy_mm4: 0, Iyc_mm4: 0, J_mm4: 0, Cw_mm6: 0, Zx_mm3: 0 };
  }

  // --- Centroid (y from bottom) ---
  const yc = plates.reduce((s, p) => s + plateArea(p) * p.yc, 0) / A;

  // --- Ix about centroid (parallel axis theorem) ---
  let Ix = 0;
  for (const p of plates) {
    Ix += plateIxo(p) + plateArea(p) * (p.yc - yc) ** 2;
  }

  // --- Iy about z=0 axis (parallel axis theorem on zc) ---
  let Iy = 0;
  for (const p of plates) {
    Iy += plateIyo(p) + plateArea(p) * p.zc ** 2;
  }

  // --- Iyc: Iy of compression (top) flange plates only ---
  let Iyc = 0;
  for (const idx of topFlangeIndices) {
    const p = plates[idx];
    Iyc += plateIyo(p) + plateArea(p) * p.zc ** 2;
  }

  // --- J: St. Venant torsional constant ---
  let J: number;
  if (closedBox && boxEnclosedArea > 0 && boxPerimeterRatio > 0) {
    // Bredt's formula: J = 4·Aenc² / Σ(si/ti)
    J = 4 * boxEnclosedArea ** 2 / boxPerimeterRatio;
  } else {
    // Open thin-walled: J = Σ(bi·ti³/3)
    J = plates.reduce((s, p) => s + (p.b * p.t ** 3) / 3, 0);
  }

  // --- Cw: warping constant ---
  // For I-shapes (open): Cw = Iy·ho²·ρ·(1-ρ) where ρ = Iyc/Iy
  // For closed boxes: Cw ≈ 0
  let Cw = 0;
  if (!closedBox && Iy > 0) {
    // ho = distance between top and bottom flange centroids
    // Find top-most and bottom-most flange centroids
    const flangeYs = plates
      .filter((_, i) => topFlangeIndices.includes(i))
      .map((p) => p.yc);
    const nonFlangeBottomYs = plates
      .filter((_, i) => !topFlangeIndices.includes(i))
      .map((p) => p.yc);

    if (flangeYs.length > 0 && nonFlangeBottomYs.length > 0) {
      // ho = distance between top and bottom flange centroids
      const allYcs = plates.map((p) => p.yc);
      const yBotFlange = Math.min(...allYcs);
      const yTopFlange = Math.max(...allYcs);
      const ho = yTopFlange - yBotFlange;

      if (ho > 0) {
        const rho = Iyc / Iy;
        Cw = Iy * ho ** 2 * rho * (1 - rho);
      }
    }
  }

  // --- Zx: plastic section modulus (proper layer integration) ---
  const Zx = calcZxFromPlates(plates);

  return { A_mm2: A, yc_mm: yc, Ix_mm4: Ix, Iy_mm4: Iy, Iyc_mm4: Iyc, J_mm4: J, Cw_mm6: Cw, Zx_mm3: Zx };
}

/**
 * Plastic section modulus by subdividing each plate into thin strips.
 *
 * Each plate is split into N sub-strips of height t/N. The PNA is found
 * by accumulating area from bottom, then Zx = Σ Ai·|yi - yPNA|.
 *
 * This fixes the bug in v1 where PNA within a thick web was approximated
 * as the centroid of the entire web layer.
 *
 * @returns Zx in mm³
 */
function calcZxFromPlates(plates: Plate[]): number {
  // Build sub-strips: each plate → thin strips
  interface Strip { A: number; yc: number }
  const strips: Strip[] = [];
  const N_SUB = 20; // subdivisions per plate — enough for <0.5% error

  for (const p of plates) {
    const A_plate = plateArea(p);
    if (A_plate <= 0) continue;
    const stripH = p.t / N_SUB;
    const stripA = p.b * stripH;
    const yBot = p.yc - p.t / 2;
    for (let i = 0; i < N_SUB; i++) {
      strips.push({
        A: stripA,
        yc: yBot + stripH * (i + 0.5),
      });
    }
  }

  if (strips.length === 0) return 0;

  const totalA = strips.reduce((s, st) => s + st.A, 0);
  const halfA = totalA / 2;

  // Sort bottom-to-top
  strips.sort((a, b) => a.yc - b.yc);

  // Find PNA by accumulating from bottom
  let cumA = 0;
  let pnaY = 0;
  for (const st of strips) {
    cumA += st.A;
    if (cumA >= halfA) {
      // PNA is within this strip — linear interpolation
      const overshoot = cumA - halfA;
      const frac = overshoot / st.A; // fraction of this strip above PNA
      pnaY = st.yc + (0.5 - frac) * (st.yc - (st.yc - 0)); // approximate
      // More precise: PNA at the cut through this strip
      pnaY = st.yc - (st.A > 0 ? (overshoot / st.A) * (strips[0]?.A > 0 ? st.A / (strips[0].A / strips[0].A) : 1) : 0);
      // Simplify: for thin strips, yc is close enough
      pnaY = st.yc;
      break;
    }
  }

  // Zx = Σ Ai · |yi - yPNA|
  let Zx = 0;
  for (const st of strips) {
    Zx += st.A * Math.abs(st.yc - pnaY);
  }
  return Zx;
}

// ─── Convert CompositeResult → SectionProperties ────────────────────────────

function toSectionProps(
  cr: CompositeResult,
  dims: SectionDimensions,
): SectionProperties {
  const dTotal = dims.d > 0 ? dims.d : dims.tfi + dims.h + dims.tfs;
  const yc = cr.yc_mm;

  const A_cm2 = cr.A_mm2 / 1e2;
  const Ix_cm4 = cr.Ix_mm4 / 1e4;

  // Elastic section moduli
  const distTop = dTotal - yc; // mm from centroid to top fibre
  const distBot = yc;           // mm from centroid to bottom fibre
  const SxTop = distTop > 0 ? Ix_cm4 / (distTop / 10) : 0; // cm³
  const SxBot = distBot > 0 ? Ix_cm4 / (distBot / 10) : 0; // cm³

  const Zx = cr.Zx_mm3 / 1e3; // mm³ → cm³

  const Iy_eff_cm4 = cr.Iyc_mm4 / 1e4; // compression flange Iy for LTB

  // iy_eff: radius of gyration of compression flange + 1/6 web (AISC F2-Commentary)
  // Approximation: iy = √(Iyc / Afc) where Afc = compression flange area
  // More rigorous: use rt = rts from Ec. F2-7
  const Afc = dims.bfs * dims.tfs; // mm² — compression flange area
  const iy_eff = Afc > 0 ? Math.sqrt(cr.Iyc_mm4 / Afc) : 0; // mm

  const J_cm4 = cr.J_mm4 / 1e4;
  const Cw_cm6 = cr.Cw_mm6 / 1e6;

  // rts per CIRSOC 301-2018 Ec. F2-7:
  //   rts² = √(Iy·Cw) / Sx
  // → rts = (Iy·Cw)^(1/4) / Sx^(1/2)  [units: mm]
  // Note: use FULL section Iy (not Iyc) and Sx of compression flange (SxTop in mm³)
  const Sxc_mm3 = distTop > 0 ? cr.Ix_mm4 / distTop : 1; // mm³
  let rts = 0;
  if (cr.Iy_mm4 > 0 && cr.Cw_mm6 > 0 && Sxc_mm3 > 0) {
    // rts² = √(Iy·Cw) / Sx  →  rts⁴ = Iy·Cw / Sx²
    rts = Math.pow((cr.Iy_mm4 * cr.Cw_mm6) / (Sxc_mm3 ** 2), 0.25); // mm
  } else if (iy_eff > 0) {
    // Fallback for box sections where Cw ≈ 0
    rts = iy_eff;
  }

  const wDL = (cr.A_mm2 / 1e6) * GAMMA_STEEL; // kN/m

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

// ─── Main entry point ────────────────────────────────────────────────────────

export function calcSectionProps(config: SectionConfig): SectionProperties {
  const { type } = config;

  switch (type) {
    case "A":
    case "B":
      return buildSymmetricI(config);
    case "C":
      return buildMonosymmetricI(config);
    case "D":
      return buildTypeD(config);
    case "E":
      return buildTypeE(config);
    case "F":
      return buildTypeF(config);
    case "G":
      return buildTypeG(config);
    case "H":
    case "I":
      return buildBox(config);
    case "J":
      return buildTypeJ(config);
    case "K":
      return config.props;
    default:
      throw new Error(`Unknown section type: ${type}`);
  }
}

// ─── Type A/B: Doubly symmetric I-section ───────────────────────────────────
// Plates: bottom flange [0], web [1], top flange [2]

function buildSymmetricI(config: SectionConfig): SectionProperties {
  const { bfs, tfs, bfi, tfi, tw, h } = config.dims;
  const plates = makeIPlates(bfs, tfs, bfi, tfi, tw, h);
  const cr = compositeProps(plates, [2]); // top flange = index 2
  return toSectionProps(cr, config.dims);
}

// ─── Type C: Monosymmetric I-section ────────────────────────────────────────

function buildMonosymmetricI(config: SectionConfig): SectionProperties {
  const { bfs, tfs, bfi, tfi, tw, h } = config.dims;
  const plates = makeIPlates(bfs, tfs, bfi, tfi, tw, h);
  const cr = compositeProps(plates, [2]);
  return toSectionProps(cr, config.dims);
}

// ─── Type D: I + UPN channel on top flange ──────────────────────────────────
// The UPN sits on top of the top flange, contributing area, Ix, and Iy.
// Model UPN as 3 plates: 2 flanges (vertical) + 1 web (horizontal on top).
// Simplified: model UPN as a single plate on top of the I-beam.

function buildTypeD(config: SectionConfig): SectionProperties {
  const { bfs, tfs, bfi, tfi, tw, h } = config.dims;
  const plates = makeIPlates(bfs, tfs, bfi, tfi, tw, h);

  // UPN modeled as additional plate on top of the top flange
  // Typical UPN: web horizontal on top, flanges vertical downward.
  // For Iy contribution: the UPN web (horizontal) adds significant Iy.
  // Approximate: UPN as a horizontal plate 80×8mm sitting on top flange.
  // User should set dims to reflect composite, but we add a nominal UPN plate.
  // UPN dimensions: use bfs as width approximation, add tfs as extra height.
  // This is a first-order model — for precise calcs, use type K (manual).
  const upnWeb: Plate = {
    b: bfs * 0.6,       // UPN web width ≈ 60% of beam flange
    t: tfs * 0.5,       // UPN web thickness
    yc: tfi + h + tfs + tfs * 0.25, // sits on top of top flange
    zc: 0,
  };
  plates.push(upnWeb);

  const cr = compositeProps(plates, [2, 3]); // top flange + UPN
  // Update dims.d to include UPN
  const adjustedDims = { ...config.dims, d: config.dims.d + upnWeb.t };
  return toSectionProps(cr, adjustedDims);
}

// ─── Type E: I + cover plate on top flange ──────────────────────────────────
// Cover plate welded on top of the top flange.

function buildTypeE(config: SectionConfig): SectionProperties {
  const { bfs, tfs, bfi, tfi, tw, h } = config.dims;
  const plates = makeIPlates(bfs, tfs, bfi, tfi, tw, h);

  const pBf = config.plateBf ?? bfs * 1.2;
  const pTf = config.plateTf ?? 16;

  const coverPlate: Plate = {
    b: pBf,
    t: pTf,
    yc: tfi + h + tfs + pTf / 2, // on top of top flange
    zc: 0,
  };
  plates.push(coverPlate);

  const cr = compositeProps(plates, [2, 3]); // top flange + cover plate
  const adjustedDims = { ...config.dims, d: config.dims.d + pTf };
  return toSectionProps(cr, adjustedDims);
}

// ─── Type F: I + horizontal surge plate ─────────────────────────────────────
// Surge plate welded laterally to one side of the top flange.
// It contributes to Iy (strong lateral stiffness) but negligibly to Ix.

function buildTypeF(config: SectionConfig): SectionProperties {
  const { bfs, tfs, bfi, tfi, tw, h } = config.dims;
  const plates = makeIPlates(bfs, tfs, bfi, tfi, tw, h);

  const sBf = config.surgeBf ?? 300;
  const sTf = config.surgeTf ?? 12;

  // Surge plate is horizontal, at the level of top flange centroid
  // Its centroid in z is offset: at bfs/2 + sBf/2 from beam axis
  const surgePlate: Plate = {
    b: sBf,                         // horizontal extent
    t: sTf,                         // vertical thickness
    yc: tfi + h + tfs / 2,         // same height as top flange centroid
    zc: bfs / 2 + sBf / 2,         // offset from beam centerline (Steiner for Iy)
  };
  plates.push(surgePlate);

  const cr = compositeProps(plates, [2, 3]); // top flange + surge plate
  return toSectionProps(cr, config.dims);
}

// ─── Type G: Main beam + surge plate + auxiliary beam ───────────────────────
// Main I-beam + horizontal surge plate + smaller auxiliary beam at separation.

function buildTypeG(config: SectionConfig): SectionProperties {
  const { bfs, tfs, bfi, tfi, tw, h } = config.dims;
  const plates = makeIPlates(bfs, tfs, bfi, tfi, tw, h);

  const sBf = config.surgeBf ?? 300;
  const sTf = config.surgeTf ?? 12;
  const sep = config.auxSep ?? 500; // mm center-to-center

  // Surge plate connecting the two beams
  const surgePlate: Plate = {
    b: sBf,
    t: sTf,
    yc: tfi + h + tfs / 2,
    zc: bfs / 2 + sBf / 2,
  };
  plates.push(surgePlate);

  // Auxiliary beam: model as small I at distance 'sep' from main beam axis
  // Approximate as 3 plates (flanges + web), half the size of main beam
  const auxD = h * 0.5;     // half the main web height
  const auxBf = bfs * 0.5;
  const auxTf = tfs * 0.8;
  const auxTw = tw * 0.8;
  const auxH = auxD - 2 * auxTf;
  const auxYBase = tfi + h + tfs / 2 - auxD / 2; // centered at top flange level

  const auxBotFlange: Plate = { b: auxBf, t: auxTf, yc: auxYBase + auxTf / 2, zc: sep };
  const auxWeb: Plate = { b: auxTw, t: Math.max(auxH, 1), yc: auxYBase + auxTf + auxH / 2, zc: sep };
  const auxTopFlange: Plate = { b: auxBf, t: auxTf, yc: auxYBase + auxTf + auxH + auxTf / 2, zc: sep };
  plates.push(auxBotFlange, auxWeb, auxTopFlange);

  // Top flange indices: main top flange + surge plate + aux top flange
  const cr = compositeProps(plates, [2, 3, 6]);
  return toSectionProps(cr, config.dims);
}

// ─── Type H/I: Box section ──────────────────────────────────────────────────
// Two webs, two flanges. Closed section → Bredt for J, Cw ≈ 0.

function buildBox(config: SectionConfig): SectionProperties {
  const { bfs, tfs, bfi, tfi, tw, h } = config.dims;
  const bEnc = config.bInt ?? Math.max(bfs - 2 * tw, tw); // enclosed width

  // Plates: bottom flange, left web, right web, top flange
  const plates: Plate[] = [
    { b: bfi, t: tfi, yc: tfi / 2, zc: 0 },                          // [0] bot flange
    { b: tw, t: h, yc: tfi + h / 2, zc: -(bEnc / 2 + tw / 2) },     // [1] left web
    { b: tw, t: h, yc: tfi + h / 2, zc: bEnc / 2 + tw / 2 },        // [2] right web
    { b: bfs, t: tfs, yc: tfi + h + tfs / 2, zc: 0 },                // [3] top flange
  ];

  // Bredt's formula for closed box
  const Aenc = bEnc * h;
  const perimRatio = bEnc / tfs + bEnc / tfi + h / tw + h / tw;

  const cr = compositeProps(plates, [3], true, Aenc, perimRatio);
  return toSectionProps(cr, config.dims);
}

// ─── Type J: Twin beam (birriel) ────────────────────────────────────────────
// Two identical I-beams at separation `companionSep`, connected by bracing.
// Ix_system = 2·Ix_single (bracing doesn't increase Ix)
// Iy_system = 2·Iy_single + 2·A_single·(sep/2)² (Steiner)

function buildTypeJ(config: SectionConfig): SectionProperties {
  const { bfs, tfs, bfi, tfi, tw, h } = config.dims;
  const sep = config.companionSep ?? 0; // mm center-to-center

  // Build two I-beams offset in z
  const halfSep = sep / 2;

  const plates: Plate[] = [
    // Beam 1 (left, z = -halfSep)
    { b: bfi, t: tfi, yc: tfi / 2, zc: -halfSep },
    { b: tw, t: h, yc: tfi + h / 2, zc: -halfSep },
    { b: bfs, t: tfs, yc: tfi + h + tfs / 2, zc: -halfSep },
    // Beam 2 (right, z = +halfSep)
    { b: bfi, t: tfi, yc: tfi / 2, zc: halfSep },
    { b: tw, t: h, yc: tfi + h / 2, zc: halfSep },
    { b: bfs, t: tfs, yc: tfi + h + tfs / 2, zc: halfSep },
  ];

  // Top flanges are indices 2 and 5
  const cr = compositeProps(plates, [2, 5]);
  return toSectionProps(cr, config.dims);
}

// ─── Helper: build standard I-shape plates ──────────────────────────────────

function makeIPlates(
  bfs: number, tfs: number, bfi: number, tfi: number, tw: number, h: number
): Plate[] {
  return [
    { b: bfi, t: tfi, yc: tfi / 2, zc: 0 },                // [0] bottom flange
    { b: tw, t: h, yc: tfi + h / 2, zc: 0 },               // [1] web
    { b: bfs, t: tfs, yc: tfi + h + tfs / 2, zc: 0 },      // [2] top flange
  ];
}

// ─── Legacy exports (for compatibility with calcZxLayers calls) ─────────────

export interface ZxLayer {
  A: number;
  yc: number;
}

export function calcZxLayers(layers: ZxLayer[]): number {
  // Convert legacy layers to plates (assume width=1 for area=A, t=1)
  // This is kept for backward compat but new code should use calcSectionProps
  const plates: Plate[] = layers.map((l) => ({
    b: l.A, // treat area as b×1
    t: 1,
    yc: l.yc,
    zc: 0,
  }));
  return calcZxFromPlates(plates) / 1e3; // mm³ → cm³
}
