// ============================================================================
// VIGACARRILERA — Major-axis flexure check per CIRSOC 301-2018 §F2 / §F4
// §F2: Doubly symmetric compact I-shapes (Types A, B, D, E, H, I, J)
// §F4: Monosymmetric I-shapes with compact/noncompact web (Type C)
// φb = 0.90
// ============================================================================

import type { SectionProperties, SectionDimensions, FlexuralStrength } from "@/lib/types";

const PHI_B = 0.90; // CIRSOC 301-2018 §F1

// ─── §F2: Doubly symmetric compact I-shapes bent about major axis ────────────

/**
 * Check major-axis flexural strength per CIRSOC 301-2018 §F2 or §F4.
 *
 * @param props   Section properties (Ix, Sx, Zx, J, Cw, rts, iy_eff, etc.).
 * @param dims    Section dimensions (mm).
 * @param Fy      Yield stress (MPa).
 * @param E       Modulus of elasticity (MPa).
 * @param Lb      Unbraced length (m).
 * @param Cb      Lateral-torsional buckling modification factor.
 * @param mono    If true, use §F4 (monosymmetric); default false → §F2.
 * @param rho     ρ = Iyc/Iy — required for §F4 monosymmetric sections.
 * @returns FlexuralStrength { Mp, Lp, Lr, Lb, Cb, Mn, phiMn, ltbZone }.
 */
export function checkFlexureMajor(
  props: SectionProperties,
  dims: SectionDimensions,
  Fy: number,
  E: number,
  Lb: number,
  Cb: number,
  mono: boolean = false,
  rho?: number
): FlexuralStrength {
  if (mono && rho !== undefined) {
    return checkF4(props, dims, Fy, E, Lb, Cb, rho);
  }
  return checkF2(props, dims, Fy, E, Lb, Cb);
}

// ─── §F2 implementation ──────────────────────────────────────────────────────

function checkF2(
  props: SectionProperties,
  dims: SectionDimensions,
  Fy: number,
  E: number,
  Lb: number,
  Cb: number
): FlexuralStrength {
  const { Zx, SxTop, SxBot, J, rts } = props;
  const Sx = Math.min(SxTop, SxBot); // cm³ — governing elastic modulus

  // Mp — plastic moment — CIRSOC 301-2018 Ec. F2-1
  const Mp = Fy * Zx / 1e3; // kNm (Fy in MPa, Zx in cm³ → MPa·cm³ / 1000 = kNm)

  // ho — distance between flange centroids (mm)
  const ho = dims.d - dims.tfs / 2 - dims.tfi / 2;

  // Lp — limiting laterally unbraced length for yielding — Ec. F2-5
  // Lp = 1.76·iy·√(E/Fy)
  const iy = props.iy_eff; // mm
  const Lp = 1.76 * iy * Math.sqrt(E / Fy) / 1000; // mm → m

  // Lr — limiting laterally unbraced length for inelastic LTB — Ec. F2-6
  // Lr = 1.95·rts·(E/(0.7·Fy))·√(J·c/(Sx·ho) + √((J·c/(Sx·ho))² + 6.76·(0.7·Fy/E)²))
  const c = 1.0; // for doubly symmetric sections
  const rts_mm = rts; // mm
  const Sx_mm3 = Sx * 1e3; // cm³ → mm³
  const J_mm4 = J * 1e4;   // cm⁴ → mm⁴

  const jcsh = (J_mm4 * c) / (Sx_mm3 * ho);
  const term = jcsh + Math.sqrt(jcsh ** 2 + 6.76 * (0.7 * Fy / E) ** 2);
  const Lr = (1.95 * rts_mm * (E / (0.7 * Fy)) * Math.sqrt(term)) / 1000; // mm → m

  // Lb in m
  let Mn: number;
  let ltbZone: 1 | 2 | 3;

  if (Lb <= Lp) {
    // Zone 1: Yielding — Ec. F2-1
    Mn = Mp;
    ltbZone = 1;
  } else if (Lb <= Lr) {
    // Zone 2: Inelastic LTB — Ec. F2-2
    // Mn = Cb·[Mp - (Mp - 0.7·Fy·Sx)·(Lb-Lp)/(Lr-Lp)] ≤ Mp
    const Mr = 0.7 * Fy * Sx / 1e3; // kNm
    Mn = Cb * (Mp - (Mp - Mr) * (Lb - Lp) / (Lr - Lp));
    Mn = Math.min(Mn, Mp);
    ltbZone = 2;
  } else {
    // Zone 3: Elastic LTB — Ec. F2-3
    // Fcr = (Cb·π²·E / (Lb/rts)²)·√(1 + 0.078·J·c/(Sx·ho)·(Lb/rts)²)
    const Lb_mm = Lb * 1000;
    const slender = Lb_mm / rts_mm;
    const Fcr =
      ((Cb * Math.PI ** 2 * E) / slender ** 2) *
      Math.sqrt(1 + 0.078 * jcsh * slender ** 2);
    Mn = Fcr * Sx / 1e3; // kNm
    Mn = Math.min(Mn, Mp);
    ltbZone = 3;
  }

  return {
    Mp,
    Lp,
    Lr,
    Lb,
    Cb,
    Mn,
    phiMn: PHI_B * Mn,
    ltbZone,
  };
}

// ─── §F4 implementation: Monosymmetric I-shapes ─────────────────────────────

function checkF4(
  props: SectionProperties,
  dims: SectionDimensions,
  Fy: number,
  E: number,
  Lb: number,
  Cb: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _rho: number
): FlexuralStrength {
  const { Zx, SxTop, J, rts } = props;

  // Sxc — elastic section modulus to compression flange (top)
  // CIRSOC 301-2018 §F4
  const Sxc = SxTop; // cm³ (compression flange is at top for crane beams)
  const Sxt = props.SxBot; // cm³ (tension flange)

  const ho = dims.d - dims.tfs / 2 - dims.tfi / 2; // mm

  // FL — CIRSOC 301-2018 Ec. F4-6a / F4-6b
  // FL = max(0.7·Fy, Fy·Sxt/Sxc)  when Sxt/Sxc ≥ 0.7
  // FL = Fy·Sxt/Sxc                when Sxt/Sxc < 0.7
  const ratioSx = Sxt / Sxc;
  let FL: number;
  if (ratioSx >= 0.7) {
    FL = Math.max(0.7 * Fy, Fy * ratioSx); // Ec. F4-6a
  } else {
    FL = Fy * ratioSx; // Ec. F4-6b
  }

  // Myc — yield moment at compression flange
  const Myc = Fy * Sxc / 1e3; // kNm

  // Mp — plastic moment ≤ 1.6·Myc (for monosymmetric)
  const RpMp = Fy * Zx / 1e3; // kNm
  const Mp = Math.min(RpMp, 1.6 * Myc); // CIRSOC 301-2018 Ec. F4-1

  // Lp — Ec. F4-7
  const iy = props.iy_eff; // mm
  const Lp = 1.76 * iy * Math.sqrt(E / Fy) / 1000; // m

  // Lr — Ec. F4-8 (monosymmetric)
  const J_mm4 = J * 1e4;
  const Sxc_mm3 = Sxc * 1e3;

  const jsh = J_mm4 / (Sxc_mm3 * ho);
  const term = jsh + Math.sqrt(jsh ** 2 + 6.76 * (FL / E) ** 2);
  const Lr = (1.95 * (rts) * (E / FL) * Math.sqrt(term)) / 1000; // m

  let Mn: number;
  let ltbZone: 1 | 2 | 3;

  if (Lb <= Lp) {
    // Zone 1: Yielding — Ec. F4-1
    Mn = Mp;
    ltbZone = 1;
  } else if (Lb <= Lr) {
    // Zone 2: Inelastic LTB — Ec. F4-2
    Mn = Cb * (Mp - (Mp - FL * Sxc / 1e3) * (Lb - Lp) / (Lr - Lp));
    Mn = Math.min(Mn, Mp);
    ltbZone = 2;
  } else {
    // Zone 3: Elastic LTB — Ec. F4-3
    const Lb_mm = Lb * 1000;
    const slender = Lb_mm / rts;
    const Fcr =
      ((Cb * Math.PI ** 2 * E) / slender ** 2) *
      Math.sqrt(1 + 0.078 * jsh * slender ** 2);
    Mn = Fcr * Sxc / 1e3; // kNm
    Mn = Math.min(Mn, Mp);
    ltbZone = 3;
  }

  return {
    Mp,
    Lp,
    Lr,
    Lb,
    Cb,
    Mn,
    phiMn: PHI_B * Mn,
    ltbZone,
  };
}
