// ============================================================================
// VIGACARRILERA — Shear check per CIRSOC 301-2018 §G2.1
// For I-shaped members, unstiffened or stiffened webs.
// ============================================================================

import type { ShearStrength } from "@/lib/types";

/**
 * Check shear strength per CIRSOC 301-2018 §G2.1.
 *
 * Vn = 0.6·Fy·Aw·Cv1  — Ec. G2-1
 *
 * Cv1 depends on h/tw:
 *   If h/tw ≤ 2.24·√(E/Fy):  Cv1 = 1.0, φv = 1.0  (rolled shapes — Ec. G2-2)
 *   Otherwise:                 Cv1 < 1.0, φv = 0.90
 *
 * @param d     Total depth of section (mm).
 * @param tw    Web thickness (mm).
 * @param Fy    Yield stress (MPa).
 * @param E     Modulus of elasticity (MPa).
 * @param h     Clear web height (mm). If not provided, approximated as d - 2·tf.
 * @param rolled Whether the section is a hot-rolled shape (affects φv).
 * @returns ShearStrength { Aw, Cv1, Vn, phiVn }.
 */
export function checkShear(
  d: number,
  tw: number,
  Fy: number,
  E: number,
  h?: number,
  rolled: boolean = true
): ShearStrength {
  // Aw — area of web (cm²)
  const Aw_mm2 = d * tw;
  const Aw = Aw_mm2 / 1e2; // cm²

  // Web slenderness
  const hw = h ?? d; // use clear height if provided
  const lambdaW = hw / tw;
  const limit = 2.24 * Math.sqrt(E / Fy);

  let Cv1: number;
  let phiV: number;

  if (lambdaW <= limit) {
    // CIRSOC 301-2018 Ec. G2-2 — compact web
    Cv1 = 1.0;
    phiV = rolled ? 1.0 : 0.90;
  } else {
    // CIRSOC 301-2018 Ec. G2-3 / G2-4
    // For h/tw ≤ 1.10·√(kv·E/Fy): Cv1 = 1.0
    // For h/tw > 1.10·√(kv·E/Fy): Cv1 = 1.10·√(kv·E/Fy) / (h/tw)
    // kv = 5.34 for unstiffened panels
    const kv = 5.34;
    const limit2 = 1.10 * Math.sqrt((kv * E) / Fy);
    if (lambdaW <= limit2) {
      Cv1 = 1.0;
    } else {
      Cv1 = limit2 / lambdaW; // Ec. G2-4
    }
    phiV = 0.90;
  }

  // Vn = 0.6·Fy·Aw·Cv1 — Ec. G2-1
  const Vn = (0.6 * Fy * Aw_mm2 * Cv1) / 1e3; // kN (MPa·mm² = N → /1000 = kN)

  return {
    Aw,
    Cv1,
    Vn,
    phiVn: phiV * Vn,
  };
}
