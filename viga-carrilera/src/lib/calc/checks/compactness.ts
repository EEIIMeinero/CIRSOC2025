// ============================================================================
// VIGACARRILERA — Section classification per CIRSOC 301-2018 Table B4.1b
// Determines whether flange and web are compact, noncompact, or slender.
// ============================================================================

import type { SectionDimensions, CompactnessResult } from "@/lib/types";

/**
 * Classify the compactness of an I-shaped section for flexure.
 *
 * CIRSOC 301-2018 Table B4.1b:
 *   Flange (unstiffened element — Case 10):
 *     λf  = bfs / (2·tfs)
 *     λpf = 0.38·√(E/Fy)
 *     λrf = 1.0·√(E/Fy)
 *
 *   Web (stiffened element — Case 15):
 *     λw  = h / tw
 *     λpw = 3.76·√(E/Fy)
 *     λrw = 5.70·√(E/Fy)
 *
 * @param dims Section dimensions (mm).
 * @param Fy   Yield stress (MPa).
 * @param E    Modulus of elasticity (MPa).
 * @returns CompactnessResult with slenderness ratios and classification.
 */
export function checkCompactness(
  dims: SectionDimensions,
  Fy: number,
  E: number
): CompactnessResult {
  const sqrtEFy = Math.sqrt(E / Fy);

  // ── Flange (compression flange — top flange assumed) ──
  // CIRSOC 301-2018 Table B4.1b, Case 10
  const lambda_f = dims.bfs / (2 * dims.tfs);
  const lambda_pf = 0.38 * sqrtEFy;
  const lambda_rf = 1.0 * sqrtEFy;

  let flangeClass: "compact" | "noncompact" | "slender";
  if (lambda_f <= lambda_pf) {
    flangeClass = "compact";
  } else if (lambda_f <= lambda_rf) {
    flangeClass = "noncompact";
  } else {
    flangeClass = "slender";
  }

  // ── Web ──
  // CIRSOC 301-2018 Table B4.1b, Case 15
  const lambda_w = dims.h / dims.tw;
  const lambda_pw = 3.76 * sqrtEFy;
  const lambda_rw = 5.70 * sqrtEFy;

  let webClass: "compact" | "noncompact" | "slender";
  if (lambda_w <= lambda_pw) {
    webClass = "compact";
  } else if (lambda_w <= lambda_rw) {
    webClass = "noncompact";
  } else {
    webClass = "slender";
  }

  return {
    lambda_f,
    lambda_pf,
    lambda_rf,
    flangeClass,
    lambda_w,
    lambda_pw,
    lambda_rw,
    webClass,
  };
}
