// ============================================================================
// VIGACARRILERA — Biaxial interaction check per CIRSOC 301-2018 §H1.1
// Simplified for beams without axial load (crane runway beams).
// ============================================================================

import type { InteractionCheck } from "@/lib/types";

/**
 * Check biaxial bending interaction per CIRSOC 301-2018 §H1.1.
 *
 * For members subject to bending about both axes without significant axial
 * force, the interaction equation simplifies to:
 *
 *   η = Mux / φMnx + Muy / φMny ≤ 1.0   — Ec. H1-1b (simplified)
 *
 * This is the conservative linear interaction for beams without axial load
 * (Pu/φPn ≈ 0 → use Ec. H1-1b directly).
 *
 * @param Mux     Factored major-axis moment (kNm).
 * @param Muy     Factored minor-axis moment (kNm).
 * @param phiMnx  Design major-axis flexural strength (kNm).
 * @param phiMny  Design minor-axis flexural strength (kNm).
 * @returns InteractionCheck { rx, ry, eta, pass }.
 */
export function checkInteraction(
  Mux: number,
  Muy: number,
  phiMnx: number,
  phiMny: number
): InteractionCheck {
  if (phiMnx <= 0 || phiMny <= 0) {
    throw new Error("Design flexural strengths must be > 0");
  }

  // CIRSOC 301-2018 Ec. H1-1b (beams without axial)
  const rx = Mux / phiMnx;
  const ry = Muy / phiMny;
  const eta = rx + ry;

  return {
    rx,
    ry,
    eta,
    pass: eta <= 1.0,
  };
}
