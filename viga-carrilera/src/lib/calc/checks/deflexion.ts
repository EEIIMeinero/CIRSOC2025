// ============================================================================
// VIGACARRILERA — Deflection check per CIRSOC 301-2018 §L3
// Simply supported beam under concentrated moving load.
// ============================================================================

import type { DeflectionCheck } from "@/lib/types";

/**
 * Check deflection for a simply supported crane runway beam.
 *
 * For a concentrated load P at distance a from the left support on a
 * simply supported beam of span L, the maximum deflection is:
 *
 *   δ_max = P·a·(L² − a²)^(3/2) / (9·√3·E·I·L)
 *
 * This formula gives the absolute maximum deflection at the critical
 * point x = √((L² − a²)/3), not necessarily at midspan.
 *
 * CIRSOC 301-2018 §L3 — Serviceability limits:
 *   Vertical:   L/600 (typical) or L/800 (strict)
 *   Horizontal: L/400
 *
 * @param Lm           Span length (m).
 * @param Ix           Major-axis moment of inertia (cm⁴).
 * @param Iy_eff       Effective minor-axis moment of inertia (cm⁴).
 * @param E            Modulus of elasticity (MPa).
 * @param Pv_max       Maximum vertical wheel load at service level (kN).
 * @param Ph_max       Maximum horizontal load at service level (kN).
 * @param aPos         Distance from left support to the critical load (m).
 * @param limitV_denom Denominator for vertical limit (e.g. 600 → L/600).
 * @param limitH_denom Denominator for horizontal limit (e.g. 400 → L/400).
 * @returns DeflectionCheck { deltaV, deltaH, limitV, limitH, ratioV, ratioH, passV, passH }.
 */
export function checkDeflection(
  Lm: number,
  Ix: number,
  Iy_eff: number,
  E: number,
  Pv_max: number,
  Ph_max: number,
  aPos: number,
  limitV_denom: number = 600,
  limitH_denom: number = 400
): DeflectionCheck {
  const L_mm = Lm * 1000;        // m → mm
  const a_mm = aPos * 1000;      // m → mm
  const Ix_mm4 = Ix * 1e4;       // cm⁴ → mm⁴
  const Iy_mm4 = Iy_eff * 1e4;   // cm⁴ → mm⁴
  const Pv_N = Pv_max * 1000;    // kN → N
  const Ph_N = Ph_max * 1000;    // kN → N

  // δ = P·a·(L² − a²)^(3/2) / (9·√3·E·I·L)
  const denom9sqrt3 = 9 * Math.sqrt(3);

  // Vertical deflection
  const L2a2_v = L_mm ** 2 - a_mm ** 2;
  const deltaV_mm =
    L2a2_v > 0
      ? (Pv_N * a_mm * L2a2_v ** 1.5) / (denom9sqrt3 * E * Ix_mm4 * L_mm)
      : 0;

  // Horizontal deflection (same formula, using Iy_eff)
  const deltaH_mm =
    L2a2_v > 0
      ? (Ph_N * a_mm * L2a2_v ** 1.5) / (denom9sqrt3 * E * Iy_mm4 * L_mm)
      : 0;

  // Limits (mm)
  const limitV = L_mm / limitV_denom;
  const limitH = L_mm / limitH_denom;

  const ratioV = limitV > 0 ? deltaV_mm / limitV : 0;
  const ratioH = limitH > 0 ? deltaH_mm / limitH : 0;

  return {
    deltaV: deltaV_mm,
    deltaH: deltaH_mm,
    limitV,
    limitH,
    ratioV,
    ratioH,
    passV: deltaV_mm <= limitV,
    passH: deltaH_mm <= limitH,
  };
}
