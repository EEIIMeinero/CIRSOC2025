// ============================================================================
// VIGACARRILERA — Load combinations per CIRSOC 101-2025 Table 2.3
// Computes design forces (Mux, Muy, Vu) from service-level envelopes.
// Units: moments in kNm, shears in kN.
// ============================================================================

import type { LoadCombination } from "@/lib/types";

// ─── Default combinations per CIRSOC 101-2025 Table 2.3 ─────────────────────

/** U1: 1.4·D */
const U1: LoadCombination = {
  id: "U1",
  name: "1.4 D",
  gammaD: 1.4,
  gammaL: 0,
  gammaW: 0,
};

/** U2: 1.2·D + 1.6·L (crane live load) */
const U2: LoadCombination = {
  id: "U2",
  name: "1.2 D + 1.6 L",
  gammaD: 1.2,
  gammaL: 1.6,
  gammaW: 0,
};

/** U3: 1.2·D + 1.0·L + 1.0·W */
const U3: LoadCombination = {
  id: "U3",
  name: "1.2 D + 1.0 L + 1.0 W",
  gammaD: 1.2,
  gammaL: 1.0,
  gammaW: 1.0,
};

/** U4: 1.2·D + 1.6·W + 0.5·L */
const U4: LoadCombination = {
  id: "U4",
  name: "1.2 D + 1.6 W + 0.5 L",
  gammaD: 1.2,
  gammaL: 0.5,
  gammaW: 1.6,
};

/** U5: 0.9·D + 1.6·W */
const U5: LoadCombination = {
  id: "U5",
  name: "0.9 D + 1.6 W",
  gammaD: 0.9,
  gammaL: 0,
  gammaW: 1.6,
};

export const DEFAULT_COMBINATIONS: LoadCombination[] = [U1, U2, U3, U4, U5];

// ─── Design forces ───────────────────────────────────────────────────────────

export interface DesignForces {
  Mux: number;  // kNm — factored major-axis moment
  Muy: number;  // kNm — factored minor-axis moment
  Vu: number;   // kN  — factored shear
}

/**
 * Calculate factored design forces for a given load combination.
 *
 * @param Mpp      Dead-load bending moment, major axis (kNm).
 * @param Mv_env   Maximum live-load bending moment from vertical envelope (kNm).
 * @param Mh_env   Maximum live-load bending moment from horizontal envelope (kNm).
 * @param Vpp      Dead-load shear (kN).
 * @param Vv_env   Maximum live-load shear from vertical envelope (kN).
 * @param combo    Load combination to apply.
 * @returns Factored design forces { Mux, Muy, Vu }.
 *
 * CIRSOC 101-2025 Table 2.3: U = γD·D + γL·L
 * For crane beams, vertical crane loads = live load (L),
 * horizontal crane loads treated as part of the crane live load.
 */
export function calcDesignForces(
  Mpp: number,
  Mv_env: number,
  Mh_env: number,
  Vpp: number,
  Vv_env: number,
  combo: LoadCombination
): DesignForces {
  const Mux = combo.gammaD * Mpp + combo.gammaL * Mv_env;
  const Muy = combo.gammaL * Mh_env;
  const Vu = combo.gammaD * Vpp + combo.gammaL * Vv_env;

  return { Mux, Muy, Vu };
}

/**
 * Compute design forces for all default combinations and return the governing one.
 *
 * @returns The combination producing the maximum interaction demand.
 */
export function calcAllCombinations(
  Mpp: number,
  Mv_env: number,
  Mh_env: number,
  Vpp: number,
  Vv_env: number,
  combos?: LoadCombination[]
): { combo: LoadCombination; forces: DesignForces }[] {
  const list = combos ?? DEFAULT_COMBINATIONS;
  return list.map((combo) => ({
    combo,
    forces: calcDesignForces(Mpp, Mv_env, Mh_env, Vpp, Vv_env, combo),
  }));
}
