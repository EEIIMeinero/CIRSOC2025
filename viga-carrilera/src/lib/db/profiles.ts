// ============================================================================
// VIGACARRILERA — Rolled steel profile database
// Common profiles used in Argentina and worldwide for crane runway beams.
// All dimensions in mm, areas in cm², moments of inertia in cm⁴,
// section moduli in cm³, J in cm⁴, Cw in cm⁶, weight in kg/m.
// ============================================================================

export type ProfileSeries = "IPE" | "HEB" | "IPN" | "W";

export interface SteelProfile {
  name: string;
  series: ProfileSeries;
  d: number;    // mm — overall depth
  bf: number;   // mm — flange width
  tf: number;   // mm — flange thickness
  tw: number;   // mm — web thickness
  h: number;    // mm — clear web height = d - 2*tf
  A: number;    // cm² — cross-sectional area
  Ix: number;   // cm⁴ — strong axis moment of inertia
  Iy: number;   // cm⁴ — weak axis moment of inertia
  Wx: number;   // cm³ — elastic section modulus strong axis
  Wy: number;   // cm³ — elastic section modulus weak axis
  Zx: number;   // cm³ — plastic section modulus strong axis
  Zy: number;   // cm³ — plastic section modulus weak axis
  J: number;    // cm⁴ — St. Venant torsional constant
  Cw: number;   // cm⁶ — warping constant
  weight: number; // kg/m
}

// ─── IPE Series (European I-beams, EN 19-57) ────────────────────────────────

const IPE_PROFILES: SteelProfile[] = [
  { name: "IPE 200", series: "IPE", d: 200, bf: 100, tf: 8.5, tw: 5.6, h: 183, A: 28.5, Ix: 1943, Iy: 142, Wx: 194.3, Wy: 28.5, Zx: 220.6, Zy: 44.6, J: 6.98, Cw: 12990, weight: 22.4 },
  { name: "IPE 220", series: "IPE", d: 220, bf: 110, tf: 9.2, tw: 5.9, h: 201.6, A: 33.4, Ix: 2772, Iy: 205, Wx: 252.0, Wy: 37.3, Zx: 285.4, Zy: 58.1, J: 9.07, Cw: 22670, weight: 26.2 },
  { name: "IPE 240", series: "IPE", d: 240, bf: 120, tf: 9.8, tw: 6.2, h: 220.4, A: 39.1, Ix: 3892, Iy: 284, Wx: 324.3, Wy: 47.3, Zx: 366.6, Zy: 73.9, J: 12.88, Cw: 37390, weight: 30.7 },
  { name: "IPE 270", series: "IPE", d: 270, bf: 135, tf: 10.2, tw: 6.6, h: 249.6, A: 45.9, Ix: 5790, Iy: 420, Wx: 428.9, Wy: 62.2, Zx: 484.0, Zy: 97.0, J: 15.94, Cw: 70580, weight: 36.1 },
  { name: "IPE 300", series: "IPE", d: 300, bf: 150, tf: 10.7, tw: 7.1, h: 278.6, A: 53.8, Ix: 8356, Iy: 604, Wx: 557.1, Wy: 80.5, Zx: 628.4, Zy: 125.2, J: 20.12, Cw: 126000, weight: 42.2 },
  { name: "IPE 330", series: "IPE", d: 330, bf: 160, tf: 11.5, tw: 7.5, h: 307, A: 62.6, Ix: 11770, Iy: 788, Wx: 713.1, Wy: 98.5, Zx: 804.3, Zy: 153.7, J: 26.44, Cw: 199100, weight: 49.1 },
  { name: "IPE 360", series: "IPE", d: 360, bf: 170, tf: 12.7, tw: 8.0, h: 334.6, A: 72.7, Ix: 16270, Iy: 1043, Wx: 903.6, Wy: 122.8, Zx: 1019, Zy: 191.1, J: 37.32, Cw: 313600, weight: 57.1 },
  { name: "IPE 400", series: "IPE", d: 400, bf: 180, tf: 13.5, tw: 8.6, h: 373, A: 84.5, Ix: 23130, Iy: 1318, Wx: 1156, Wy: 146.4, Zx: 1307, Zy: 229.0, J: 51.08, Cw: 490000, weight: 66.3 },
  { name: "IPE 450", series: "IPE", d: 450, bf: 190, tf: 14.6, tw: 9.4, h: 420.8, A: 98.8, Ix: 33740, Iy: 1676, Wx: 1500, Wy: 176.4, Zx: 1702, Zy: 276.4, J: 66.87, Cw: 791000, weight: 77.6 },
  { name: "IPE 500", series: "IPE", d: 500, bf: 200, tf: 16.0, tw: 10.2, h: 468, A: 115.5, Ix: 48200, Iy: 2142, Wx: 1928, Wy: 214.2, Zx: 2194, Zy: 335.9, J: 89.29, Cw: 1249000, weight: 90.7 },
  { name: "IPE 550", series: "IPE", d: 550, bf: 210, tf: 17.2, tw: 11.1, h: 515.6, A: 134.4, Ix: 67120, Iy: 2668, Wx: 2441, Wy: 254.1, Zx: 2787, Zy: 400.5, J: 123.2, Cw: 1884000, weight: 105.5 },
  { name: "IPE 600", series: "IPE", d: 600, bf: 220, tf: 19.0, tw: 12.0, h: 562, A: 156.0, Ix: 92080, Iy: 3387, Wx: 3069, Wy: 307.9, Zx: 3512, Zy: 485.6, J: 165.4, Cw: 2846000, weight: 122.4 },
];

// ─── HEB Series (European wide-flange, EN 53-62) ────────────────────────────

const HEB_PROFILES: SteelProfile[] = [
  { name: "HEB 200", series: "HEB", d: 200, bf: 200, tf: 15, tw: 9.0, h: 170, A: 78.1, Ix: 5696, Iy: 2003, Wx: 569.6, Wy: 200.3, Zx: 642.5, Zy: 305.8, J: 59.28, Cw: 171100, weight: 61.3 },
  { name: "HEB 220", series: "HEB", d: 220, bf: 220, tf: 16, tw: 9.5, h: 188, A: 91.0, Ix: 8091, Iy: 2843, Wx: 735.5, Wy: 258.5, Zx: 827.4, Zy: 395.4, J: 76.57, Cw: 295400, weight: 71.5 },
  { name: "HEB 240", series: "HEB", d: 240, bf: 240, tf: 17, tw: 10.0, h: 206, A: 106.0, Ix: 11260, Iy: 3923, Wx: 938.3, Wy: 326.9, Zx: 1053, Zy: 498.4, J: 102.7, Cw: 486900, weight: 83.2 },
  { name: "HEB 260", series: "HEB", d: 260, bf: 260, tf: 17.5, tw: 10.0, h: 225, A: 118.4, Ix: 14920, Iy: 5135, Wx: 1148, Wy: 395.0, Zx: 1283, Zy: 602.2, J: 123.8, Cw: 753700, weight: 93.0 },
  { name: "HEB 280", series: "HEB", d: 280, bf: 280, tf: 18, tw: 10.5, h: 244, A: 131.4, Ix: 19270, Iy: 6595, Wx: 1376, Wy: 471.1, Zx: 1534, Zy: 717.6, J: 143.7, Cw: 1130000, weight: 103.1 },
  { name: "HEB 300", series: "HEB", d: 300, bf: 300, tf: 19, tw: 11.0, h: 262, A: 149.1, Ix: 25170, Iy: 8563, Wx: 1678, Wy: 570.9, Zx: 1869, Zy: 870.1, J: 185.0, Cw: 1688000, weight: 117.0 },
  { name: "HEB 320", series: "HEB", d: 320, bf: 300, tf: 20.5, tw: 11.5, h: 279, A: 161.3, Ix: 30820, Iy: 9239, Wx: 1926, Wy: 615.9, Zx: 2149, Zy: 939.1, J: 225.1, Cw: 2069000, weight: 126.6 },
  { name: "HEB 340", series: "HEB", d: 340, bf: 300, tf: 21.5, tw: 12.0, h: 297, A: 170.9, Ix: 36660, Iy: 9690, Wx: 2156, Wy: 646.0, Zx: 2408, Zy: 985.7, J: 257.2, Cw: 2454000, weight: 134.2 },
  { name: "HEB 360", series: "HEB", d: 360, bf: 300, tf: 22.5, tw: 12.5, h: 315, A: 180.6, Ix: 43190, Iy: 10140, Wx: 2400, Wy: 676.1, Zx: 2683, Zy: 1032, J: 292.5, Cw: 2883000, weight: 141.8 },
  { name: "HEB 400", series: "HEB", d: 400, bf: 300, tf: 24, tw: 13.5, h: 352, A: 197.8, Ix: 57680, Iy: 10820, Wx: 2884, Wy: 721.3, Zx: 3232, Zy: 1104, J: 355.7, Cw: 3817000, weight: 155.3 },
  { name: "HEB 450", series: "HEB", d: 450, bf: 300, tf: 26, tw: 14.0, h: 398, A: 218.0, Ix: 79890, Iy: 11720, Wx: 3551, Wy: 781.4, Zx: 3982, Zy: 1198, J: 441.2, Cw: 5258000, weight: 171.0 },
  { name: "HEB 500", series: "HEB", d: 500, bf: 300, tf: 28, tw: 14.5, h: 444, A: 238.6, Ix: 107200, Iy: 12620, Wx: 4287, Wy: 841.6, Zx: 4815, Zy: 1292, J: 538.4, Cw: 7018000, weight: 187.3 },
  { name: "HEB 550", series: "HEB", d: 550, bf: 300, tf: 29, tw: 15.0, h: 492, A: 254.1, Ix: 136700, Iy: 13080, Wx: 4971, Wy: 871.8, Zx: 5591, Zy: 1341, J: 600.3, Cw: 8856000, weight: 199.5 },
  { name: "HEB 600", series: "HEB", d: 600, bf: 300, tf: 30, tw: 15.5, h: 540, A: 270.0, Ix: 171000, Iy: 13530, Wx: 5701, Wy: 902.0, Zx: 6425, Zy: 1391, J: 667.2, Cw: 10970000, weight: 212.0 },
];

// ─── IPN Series (European standard I-beams, DIN 1025-1) ─────────────────────

const IPN_PROFILES: SteelProfile[] = [
  { name: "IPN 200", series: "IPN", d: 200, bf: 90, tf: 11.3, tw: 7.5, h: 177.4, A: 33.4, Ix: 2140, Iy: 117, Wx: 214.0, Wy: 26.0, Zx: 244.6, Zy: 41.2, J: 12.88, Cw: 8650, weight: 26.2 },
  { name: "IPN 220", series: "IPN", d: 220, bf: 98, tf: 12.2, tw: 8.1, h: 195.6, A: 39.5, Ix: 3060, Iy: 162, Wx: 278.2, Wy: 33.1, Zx: 317.7, Zy: 52.4, J: 18.04, Cw: 14060, weight: 31.1 },
  { name: "IPN 240", series: "IPN", d: 240, bf: 106, tf: 13.1, tw: 8.7, h: 213.8, A: 46.1, Ix: 4250, Iy: 221, Wx: 354.2, Wy: 41.7, Zx: 404.9, Zy: 66.0, J: 24.57, Cw: 22280, weight: 36.2 },
  { name: "IPN 260", series: "IPN", d: 260, bf: 113, tf: 14.1, tw: 9.4, h: 231.8, A: 53.3, Ix: 5740, Iy: 288, Wx: 441.5, Wy: 51.0, Zx: 505.2, Zy: 80.7, J: 32.80, Cw: 33500, weight: 41.9 },
  { name: "IPN 280", series: "IPN", d: 280, bf: 119, tf: 15.2, tw: 10.1, h: 249.6, A: 61.0, Ix: 7590, Iy: 364, Wx: 542.1, Wy: 61.2, Zx: 621.5, Zy: 96.9, J: 43.56, Cw: 49540, weight: 47.9 },
  { name: "IPN 300", series: "IPN", d: 300, bf: 125, tf: 16.2, tw: 10.8, h: 267.6, A: 69.0, Ix: 9800, Iy: 451, Wx: 653.3, Wy: 72.2, Zx: 749.7, Zy: 114.1, J: 56.24, Cw: 70100, weight: 54.2 },
  { name: "IPN 320", series: "IPN", d: 320, bf: 131, tf: 17.3, tw: 11.5, h: 285.4, A: 77.7, Ix: 12510, Iy: 555, Wx: 782.0, Wy: 84.7, Zx: 897.8, Zy: 133.6, J: 72.01, Cw: 97000, weight: 61.0 },
  { name: "IPN 340", series: "IPN", d: 340, bf: 137, tf: 18.3, tw: 12.2, h: 303.4, A: 86.7, Ix: 15700, Iy: 674, Wx: 923.5, Wy: 98.4, Zx: 1062, Zy: 155.0, J: 90.72, Cw: 131700, weight: 68.0 },
  { name: "IPN 360", series: "IPN", d: 360, bf: 143, tf: 19.5, tw: 13.0, h: 321, A: 97.1, Ix: 19610, Iy: 818, Wx: 1089, Wy: 114.4, Zx: 1253, Zy: 180.3, J: 115.1, Cw: 175700, weight: 76.1 },
  { name: "IPN 380", series: "IPN", d: 380, bf: 149, tf: 20.5, tw: 13.7, h: 339, A: 107.2, Ix: 24010, Iy: 975, Wx: 1264, Wy: 130.9, Zx: 1456, Zy: 206.5, J: 139.3, Cw: 226400, weight: 84.0 },
  { name: "IPN 400", series: "IPN", d: 400, bf: 155, tf: 21.6, tw: 14.4, h: 356.8, A: 118.0, Ix: 29210, Iy: 1160, Wx: 1460, Wy: 149.7, Zx: 1684, Zy: 236.0, J: 168.9, Cw: 289200, weight: 92.4 },
];

// ─── W Series (American wide-flange, AISC) ──────────────────────────────────

const W_PROFILES: SteelProfile[] = [
  { name: "W12x26", series: "W", d: 310, bf: 165, tf: 9.7, tw: 5.8, h: 290.6, A: 33.4, Ix: 8490, Iy: 370, Wx: 547.7, Wy: 44.8, Zx: 609.8, Zy: 70.5, J: 10.50, Cw: 89100, weight: 26.0 },
  { name: "W14x30", series: "W", d: 353, bf: 171, tf: 10.0, tw: 6.9, h: 333, A: 38.7, Ix: 12100, Iy: 420, Wx: 685.6, Wy: 49.1, Zx: 766.3, Zy: 77.4, J: 14.0, Cw: 137700, weight: 30.0 },
  { name: "W16x36", series: "W", d: 403, bf: 178, tf: 10.9, tw: 7.5, h: 381.2, A: 46.5, Ix: 19500, Iy: 545, Wx: 967.7, Wy: 61.2, Zx: 1086, Zy: 96.7, J: 19.4, Cw: 254000, weight: 36.0 },
  { name: "W18x40", series: "W", d: 455, bf: 178, tf: 11.0, tw: 7.5, h: 433, A: 51.6, Ix: 27300, Iy: 554, Wx: 1200, Wy: 62.3, Zx: 1349, Zy: 98.3, J: 21.4, Cw: 381700, weight: 40.0 },
  { name: "W21x44", series: "W", d: 525, bf: 165, tf: 11.4, tw: 8.9, h: 502.2, A: 56.8, Ix: 35100, Iy: 430, Wx: 1337, Wy: 52.1, Zx: 1507, Zy: 82.9, J: 25.8, Cw: 399300, weight: 44.0 },
  { name: "W24x55", series: "W", d: 599, bf: 178, tf: 12.8, tw: 10.0, h: 573.4, A: 70.3, Ix: 56200, Iy: 603, Wx: 1877, Wy: 67.8, Zx: 2120, Zy: 107.9, J: 40.1, Cw: 730100, weight: 55.0 },
  { name: "W24x68", series: "W", d: 603, bf: 228, tf: 14.9, tw: 10.5, h: 573.2, A: 87.1, Ix: 76200, Iy: 1480, Wx: 2528, Wy: 129.8, Zx: 2833, Zy: 201.0, J: 63.7, Cw: 1764000, weight: 68.0 },
  { name: "W27x84", series: "W", d: 678, bf: 253, tf: 16.3, tw: 11.7, h: 645.4, A: 107.1, Ix: 119000, Iy: 2220, Wx: 3510, Wy: 175.5, Zx: 3937, Zy: 271.3, J: 99.0, Cw: 3720000, weight: 84.0 },
  { name: "W30x99", series: "W", d: 753, bf: 265, tf: 17.0, tw: 13.2, h: 719, A: 127.1, Ix: 166000, Iy: 2660, Wx: 4410, Wy: 200.8, Zx: 4962, Zy: 311.5, J: 136.0, Cw: 5480000, weight: 99.0 },
  { name: "W33x118", series: "W", d: 835, bf: 292, tf: 18.8, tw: 14.0, h: 797.4, A: 151.0, Ix: 244000, Iy: 3690, Wx: 5844, Wy: 252.7, Zx: 6570, Zy: 392.5, J: 191.0, Cw: 9870000, weight: 118.0 },
  { name: "W36x135", series: "W", d: 904, bf: 304, tf: 20.1, tw: 15.2, h: 863.8, A: 174.2, Ix: 330000, Iy: 4680, Wx: 7301, Wy: 307.9, Zx: 8230, Zy: 478.7, J: 260.0, Cw: 14870000, weight: 135.0 },
  { name: "W36x150", series: "W", d: 912, bf: 305, tf: 23.9, tw: 16.0, h: 864.2, A: 193.5, Ix: 379000, Iy: 5660, Wx: 8311, Wy: 371.1, Zx: 9348, Zy: 573.8, J: 367.0, Cw: 18520000, weight: 150.0 },
  { name: "W36x160", series: "W", d: 915, bf: 305, tf: 25.4, tw: 16.5, h: 864.2, A: 205.8, Ix: 406000, Iy: 5970, Wx: 8874, Wy: 391.5, Zx: 10000, Zy: 606.6, J: 416.0, Cw: 19680000, weight: 160.0 },
  { name: "W36x194", series: "W", d: 927, bf: 310, tf: 30.2, tw: 18.3, h: 866.6, A: 248.4, Ix: 502000, Iy: 7230, Wx: 10830, Wy: 466.5, Zx: 12230, Zy: 725.4, J: 616.0, Cw: 24600000, weight: 194.0 },
  { name: "W36x232", series: "W", d: 943, bf: 312, tf: 36.1, tw: 21.2, h: 870.8, A: 297.4, Ix: 616000, Iy: 8680, Wx: 13060, Wy: 556.4, Zx: 14800, Zy: 868.9, J: 923.0, Cw: 30900000, weight: 232.0 },
  { name: "W36x256", series: "W", d: 953, bf: 314, tf: 39.6, tw: 23.1, h: 873.8, A: 328.4, Ix: 690000, Iy: 9600, Wx: 14480, Wy: 611.5, Zx: 16440, Zy: 957.4, J: 1130, Cw: 34800000, weight: 256.0 },
];

// ─── Combined database ──────────────────────────────────────────────────────

export const ALL_PROFILES: SteelProfile[] = [
  ...IPE_PROFILES,
  ...HEB_PROFILES,
  ...IPN_PROFILES,
  ...W_PROFILES,
];

/**
 * Look up a profile by exact name (case-insensitive).
 * Returns undefined if not found.
 */
export function getProfileByName(name: string): SteelProfile | undefined {
  const normalized = name.trim().toUpperCase().replace(/\s+/g, " ");
  return ALL_PROFILES.find(
    (p) => p.name.toUpperCase().replace(/\s+/g, " ") === normalized
  );
}

/**
 * Returns all available profile names grouped by series.
 */
export function getProfileNames(): Record<ProfileSeries, string[]> {
  const groups: Record<ProfileSeries, string[]> = {
    IPE: [],
    HEB: [],
    IPN: [],
    W: [],
  };
  for (const p of ALL_PROFILES) {
    groups[p.series].push(p.name);
  }
  return groups;
}
