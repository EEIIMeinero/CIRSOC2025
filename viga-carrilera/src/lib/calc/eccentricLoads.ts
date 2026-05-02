// ============================================================================
// VIGACARRILERA — Eccentric load model (Image 2)
// Resolves the vertical eccentric load P and longitudinal traction HT
// into lateral forces on the top and bottom flanges.
// Units: forces in kN, distances in mm.
// ============================================================================

import type { EccentricLoads } from "@/lib/types";

/**
 * Calculate eccentric lateral forces on top and bottom flanges.
 *
 * Model: A vertical wheel load P applied at eccentricity e from the web
 * centroid, combined with a longitudinal traction force Ht applied at
 * height d1 above the bottom flange, produces lateral forces in both flanges.
 *
 * @param P   Vertical wheel load (kN).
 * @param e   Eccentricity of the rail from the web centreline (mm).
 * @param Ht  Longitudinal traction force at the rail (kN).
 * @param d1  Height of the traction force application from bottom flange centroid (mm).
 * @param d   Distance between flange centroids (mm), i.e. ho = d - tfs/2 - tfi/2.
 * @returns   { Hts, Hti } — lateral forces on top and bottom flanges (kN).
 *
 * Sign convention: positive = outward from the beam centreline.
 *
 * Hts = (P·e + Ht·d1) / d + Ht   (top flange — includes direct Ht)
 * Hti = (P·e + Ht·d1) / d          (bottom flange)
 */
export function calcEccentricLoads(
  P: number,
  e: number,
  Ht: number,
  d1: number,
  d: number
): EccentricLoads {
  if (d <= 0) {
    throw new Error("Distance between flange centroids (d) must be > 0");
  }

  // Eccentricity: convert e from mm to m? No — keep consistent.
  // All inputs in compatible units: P in kN, e in mm, Ht in kN, d1 in mm, d in mm.
  // The formula ratio e/d and d1/d are dimensionless.
  const couple = (P * e + Ht * d1) / d;

  const Hts = couple + Ht; // kN — top flange total lateral force
  const Hti = couple;       // kN — bottom flange lateral force

  return { Hts, Hti };
}
