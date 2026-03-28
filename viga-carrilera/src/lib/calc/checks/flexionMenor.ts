// ============================================================================
// VIGACARRILERA — Minor-axis flexure check per CIRSOC 301-2018 §F6
// Applies to I-shaped members bent about the minor (weak) axis.
// φb = 0.90
// ============================================================================

const PHI_B = 0.90; // CIRSOC 301-2018 §F1

/**
 * Check minor-axis flexural strength per CIRSOC 301-2018 §F6.
 *
 * Mn = min(Fy·Zy, 1.6·Fy·Sy)  — Ec. F6-1
 *
 * The 1.6 limit ensures the shape factor does not exceed a reasonable
 * bound for redistribution.
 *
 * Note: Lateral-torsional buckling does not apply to minor-axis bending.
 *
 * @param Fy  Yield stress (MPa).
 * @param Sy  Elastic section modulus about minor axis (cm³).
 * @param Zy  Plastic section modulus about minor axis (cm³).
 * @returns { Mn, phiMn } in kNm.
 */
export function checkFlexureMinor(
  Fy: number,
  Sy: number,
  Zy: number
): { Mn: number; phiMn: number } {
  // CIRSOC 301-2018 Ec. F6-1
  // Mp_y = Fy·Zy, but ≤ 1.6·Fy·Sy
  const Mp_y = Fy * Zy / 1e3;          // kNm
  const limit = 1.6 * Fy * Sy / 1e3;   // kNm  (1.5 in some editions; CIRSOC uses 1.6)
  const Mn = Math.min(Mp_y, limit);

  return {
    Mn,
    phiMn: PHI_B * Mn,
  };
}
