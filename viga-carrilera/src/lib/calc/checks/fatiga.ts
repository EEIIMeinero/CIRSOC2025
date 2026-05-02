// ============================================================================
// VIGACARRILERA — Fatigue check per AISC Design Guide 7 (DG7-2019)
// Stress range verification for welded crane runway beam details.
// ============================================================================

import type { FatigueCheck } from "@/lib/types";

// ─── Fatigue threshold stress ranges (FSR) by category ───────────────────────
// AISC DG7-2019, Table 5.1 / AISC 360-16 Appendix 3, Table A-3.1
// Values are for 2×10⁶ cycles (constant amplitude fatigue limit, CAFL).
// Units: MPa

const FSR_TABLE: Record<string, number> = {
  A: 165,
  B: 110,
  "B'": 83,
  C: 69,
  "C'": 69,
  D: 48,
  E: 31,
  "E'": 18,
};

/**
 * Get the fatigue stress range (FSR / CAFL) for a given detail category.
 *
 * @param category Detail category string (e.g. "B", "C'", "E").
 * @returns FSR in MPa.
 */
export function getFSR(category: string): number {
  const fsr = FSR_TABLE[category];
  if (fsr === undefined) {
    throw new Error(`Unknown fatigue category: "${category}". Valid: ${Object.keys(FSR_TABLE).join(", ")}`);
  }
  return fsr;
}

/**
 * Check fatigue for a specific detail point.
 *
 * AISC DG7-2019 / AISC 360-16 Appendix 3:
 *   The computed stress range Δσ must not exceed the allowable fatigue
 *   stress range FSR for the applicable detail category.
 *
 *   ratio = Δσ / FSR ≤ 1.0   → pass
 *
 * For crane runway beams, the number of load cycles is typically based on
 * the CMAA class and expected service life. When nCycles ≤ 20,000,
 * fatigue may not govern; this function still computes the ratio.
 *
 * @param deltaSigma  Computed stress range at the detail (MPa).
 * @param category    Fatigue detail category (e.g. "B", "C", "D").
 * @param nCycles     Number of load cycles (for reference).
 * @param pointId     Identifier for the stress point (e.g. "P1").
 * @returns FatigueCheck { pointId, category, FSR, deltaSigma, ratio, pass, nCycles }.
 */
export function checkFatigue(
  deltaSigma: number,
  category: string,
  nCycles: number,
  pointId: string = "P1"
): FatigueCheck {
  const FSR = getFSR(category);
  const ratio = deltaSigma / FSR;

  return {
    pointId,
    category,
    FSR,
    deltaSigma,
    ratio,
    pass: ratio <= 1.0,
    nCycles,
  };
}
