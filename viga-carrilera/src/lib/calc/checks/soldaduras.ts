// ============================================================================
// VIGACARRILERA — Weld check per CIRSOC 301-2018 §J2
// Fillet weld verification for flange-to-web connections in crane runway beams.
// ============================================================================

import type { WeldCheck } from "@/lib/types";

/**
 * Check fillet weld adequacy for a flange-to-web connection.
 *
 * CIRSOC 301-2018 §J2:
 *   The shear flow in the weld is:
 *     q = V·Q / Ix   (kN/m)
 *
 *   For two fillet welds (one on each side of the web), the shear stress is:
 *     τ = q / (2·aw)  (MPa)
 *
 *   where aw = throat dimension of the fillet weld (mm).
 *
 *   Allowable shear stress on the weld (base metal governed):
 *     τ_adm = 0.6·Fy / √3   (MPa)  — Von Mises criterion
 *
 *   This is a simplified approach. For full CIRSOC 301-2018 §J2.4 checks,
 *   the weld metal strength (0.6·FEXX) should also be verified.
 *
 * @param V         Factored shear at the section (kN).
 * @param Q         First moment of area of the connected flange about the NA (cm³).
 * @param Ix        Moment of inertia of the full section (cm⁴).
 * @param aw        Weld throat dimension (mm).
 * @param Fy        Yield stress of base metal (MPa).
 * @param location  Description of the weld location (e.g. "top-flange-to-web").
 * @returns WeldCheck { location, aw, q, tau, tauAdm, ratio, pass }.
 */
export function checkWeld(
  V: number,
  Q: number,
  Ix: number,
  aw: number,
  Fy: number,
  location: string = "flange-to-web"
): WeldCheck {
  if (aw <= 0) {
    throw new Error("Weld throat dimension (aw) must be > 0");
  }
  if (Ix <= 0) {
    throw new Error("Moment of inertia (Ix) must be > 0");
  }

  // Shear flow: q = V·Q/Ix
  // V in kN, Q in cm³, Ix in cm⁴ → q in kN/cm → convert to kN/m
  const q_kNcm = (V * Q) / Ix; // kN/cm
  const q = q_kNcm * 100;       // kN/m

  // Shear stress on weld throat: τ = q / (2·aw)
  // q in kN/m, aw in mm → convert: q (kN/m) / (2·aw mm × 1m/1000mm) = q / (2·aw/1000)
  // τ in kN/m² = kPa → convert to MPa: /1000
  // Simpler: τ (MPa) = q (N/mm) / (2·aw)
  // q in kN/m = N/mm (1 kN/m = 1 N/mm)
  const tau = q / (2 * aw); // MPa (since 1 kN/m = 1 N/mm, and N/mm / mm = N/mm² = MPa)

  // Allowable shear stress — CIRSOC 301-2018 §J2
  // τ_adm = 0.6·Fy / √3 (Von Mises shear yield criterion)
  const tauAdm = (0.6 * Fy) / Math.sqrt(3);

  const ratio = tau / tauAdm;

  return {
    location,
    aw,
    q,
    tau,
    tauAdm,
    ratio,
    pass: ratio <= 1.0,
  };
}
