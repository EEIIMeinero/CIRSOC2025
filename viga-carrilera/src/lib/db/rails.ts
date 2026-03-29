// ============================================================================
// VIGACARRILERA — Crane rail profile database
// SA (ASCE square), SF (flat), IRAM (railway) rail profiles.
// All dimensions in mm, Ir in cm4, Ar in cm2, weight in kg/m.
// ============================================================================

export interface RailProfile {
  name: string;
  type: "SA" | "SF" | "IRAM";
  hr: number;    // mm total height
  br: number;    // mm head width
  bbase: number; // mm base width
  tw_r: number;  // mm web thickness
  Ir: number;    // cm4 moment of inertia
  Ar: number;    // cm2 area
  weight: number; // kg/m
}

// ---- SA Series (ASCE square rail) ------------------------------------------
// Approximate symmetric square-head rails. Ir estimated as ~bw*hr^3/12 scaled.

const SA_RAILS: RailProfile[] = [
  {
    name: "SA 30",
    type: "SA",
    hr: 30,
    br: 30,
    bbase: 30,
    tw_r: 8,
    Ir: 1.8,
    Ar: 3.6,
    weight: 2.8,
  },
  {
    name: "SA 40",
    type: "SA",
    hr: 40,
    br: 40,
    bbase: 40,
    tw_r: 12,
    Ir: 6.4,
    Ar: 7.2,
    weight: 5.7,
  },
  {
    name: "SA 50",
    type: "SA",
    hr: 50,
    br: 50,
    bbase: 50,
    tw_r: 14,
    Ir: 15.6,
    Ar: 12.0,
    weight: 9.4,
  },
  {
    name: "SA 65",
    type: "SA",
    hr: 65,
    br: 65,
    bbase: 65,
    tw_r: 18,
    Ir: 44.2,
    Ar: 22.0,
    weight: 17.3,
  },
  {
    name: "SA 80",
    type: "SA",
    hr: 80,
    br: 80,
    bbase: 80,
    tw_r: 22,
    Ir: 102.4,
    Ar: 36.0,
    weight: 28.3,
  },
  {
    name: "SA 100",
    type: "SA",
    hr: 100,
    br: 100,
    bbase: 100,
    tw_r: 28,
    Ir: 250.0,
    Ar: 60.0,
    weight: 47.1,
  },
];

// ---- SF Series (flat crane rail) -------------------------------------------

const SF_RAILS: RailProfile[] = [
  {
    name: "SF 60",
    type: "SF",
    hr: 60,
    br: 60,
    bbase: 45,
    tw_r: 15,
    Ir: 22.5,
    Ar: 14.4,
    weight: 11.3,
  },
  {
    name: "SF 80",
    type: "SF",
    hr: 80,
    br: 80,
    bbase: 55,
    tw_r: 20,
    Ir: 68.3,
    Ar: 28.0,
    weight: 22.0,
  },
];

// ---- IRAM Series (railway rails, vias ferroviarias) ------------------------
// Based on Argentine railway rail standards.

const IRAM_RAILS: RailProfile[] = [
  {
    name: "A45",
    type: "IRAM",
    hr: 142,
    br: 67,
    bbase: 125,
    tw_r: 14.3,
    Ir: 1489,
    Ar: 57.3,
    weight: 44.6,
  },
  {
    name: "A55",
    type: "IRAM",
    hr: 155,
    br: 69,
    bbase: 140,
    tw_r: 15.5,
    Ir: 2180,
    Ar: 70.1,
    weight: 54.9,
  },
  {
    name: "A65",
    type: "IRAM",
    hr: 172,
    br: 72,
    bbase: 150,
    tw_r: 17.0,
    Ir: 3290,
    Ar: 82.6,
    weight: 64.9,
  },
  {
    name: "A75",
    type: "IRAM",
    hr: 183,
    br: 73,
    bbase: 152,
    tw_r: 17.5,
    Ir: 4050,
    Ar: 95.2,
    weight: 74.8,
  },
  {
    name: "A100",
    type: "IRAM",
    hr: 192,
    br: 75,
    bbase: 155,
    tw_r: 18.0,
    Ir: 5090,
    Ar: 127.7,
    weight: 100.2,
  },
];

// ---- Combined database -----------------------------------------------------

export const ALL_RAILS: RailProfile[] = [
  ...SA_RAILS,
  ...SF_RAILS,
  ...IRAM_RAILS,
];

/**
 * Look up a rail by exact name (case-insensitive).
 */
export function getRailByName(name: string): RailProfile | undefined {
  const normalized = name.trim().toUpperCase().replace(/\s+/g, " ");
  return ALL_RAILS.find(
    (r) => r.name.toUpperCase().replace(/\s+/g, " ") === normalized
  );
}

/**
 * Get all rails of a given type.
 */
export function getRailsByType(type: "SA" | "SF" | "IRAM"): RailProfile[] {
  return ALL_RAILS.filter((r) => r.type === type);
}
