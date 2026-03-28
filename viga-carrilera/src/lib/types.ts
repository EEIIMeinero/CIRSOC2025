// ============================================================================
// VIGACARRILERA — Tipos TypeScript globales
// ============================================================================

// --- Material ---
export type MaterialGroup = "AR" | "US" | "EU" | "CUSTOM";

export interface Material {
  id: string;
  group: MaterialGroup;
  name: string;
  designation: string;
  Fy: number;   // MPa
  Fu: number;   // MPa
  E: number;    // MPa (default 200000)
  G: number;    // MPa (default 77000)
  gamma: number; // kN/m³ (default 78.5)
  norm?: string;
  notes?: string;
}

// --- Datos Generales ---
export type CraneType = "top-running" | "underhung";
export type CmaaClass = "A" | "B" | "C" | "D" | "E" | "F";

export interface GeneralData {
  projectName: string;
  expediente?: string;
  engineer?: string;
  license?: string;
  company?: string;
  date: string;
  comments?: string;
  material: Material;
  craneType: CraneType;
  cmaaClass: CmaaClass;
}

// --- Geometría ---
export type SupportType =
  | "pinned"       // 1. Articulado simple
  | "roller"       // 2. Móvil
  | "fixed"        // 3. Empotrado
  | "warping"      // 4. Con restricción alabeo
  | "lat-top"      // 5. Lateral ala superior
  | "lat-bot"      // 6. Lateral ala inferior
  | "custom";      // 7. Definido por usuario

export interface CustomSpringConstants {
  Kz: number;   // kN/m
  Ky: number;   // kN/m
  Kphi: number; // kNm/rad
  Kw: number;   // kNm²/rad
}

export interface Support {
  nodeIndex: number;
  type: SupportType;
  bearingLength: number;    // mm - longitud de apoyo 'a'
  stiffener: "none" | "rigid" | "non-rigid";
  hasHinge: boolean;        // articulación interna M=0
  customSprings?: CustomSpringConstants;
}

export interface Span {
  index: number;
  length: number;  // m
}

export type StiffenerShape = "rectangular" | "trapezoidal";
export type StiffenerLayout = "regular" | "custom";

export interface StiffenerConfig {
  panelIndex: number;
  count: number;
  layout: StiffenerLayout;
  positions?: number[];  // mm desde apoyo izq (si layout=custom)
  shape: StiffenerShape;
  // Rectangular
  b_st?: number;   // mm
  t_st?: number;   // mm
  // Trapezoidal
  b_sup?: number;  // mm
  b_inf?: number;  // mm
  h_st?: number;   // mm
  classification: "rigid" | "non-rigid";
}

// --- Sección Transversal ---
export type SectionType =
  | "A"  // Laminado simple
  | "B"  // Armada simétrica
  | "C"  // Armada asimétrica (monosimétrica)
  | "D"  // Laminado + canal UPN
  | "E"  // Laminado + chapa PL
  | "F"  // Laminado + surge plate horizontal
  | "G"  // Viga principal + surge plate + viga auxiliar
  | "H"  // Sección cajón simple
  | "I"  // Sección cajón con celosía
  | "J"  // Sistema birriel
  | "K"; // Sección existente manual

export interface SectionDimensions {
  bfs: number;  // mm ancho ala superior
  tfs: number;  // mm espesor ala superior
  bfi: number;  // mm ancho ala inferior
  tfi: number;  // mm espesor ala inferior
  tw: number;   // mm espesor alma
  h: number;    // mm altura libre alma
  d: number;    // mm altura total = tfs + h + tfi
}

export interface SectionProperties {
  A: number;      // cm² área total
  yc: number;     // mm centroide desde base
  Ix: number;     // cm⁴ inercia eje fuerte
  SxTop: number;  // cm³ módulo elástico fibra superior (Sx+)
  SxBot: number;  // cm³ módulo elástico fibra inferior (Sx-)
  Zx: number;     // cm³ módulo plástico eje fuerte
  Iy_eff: number; // cm⁴ inercia efectiva para LTB
  iy_eff: number; // cm radio de giro efectivo
  rts: number;    // mm para LTB §F2
  J: number;      // cm⁴ St. Venant torsional
  Cw: number;     // cm⁶ constante de alabeo
  wDL: number;    // kN/m peso propio estimado
}

export interface CompactnessResult {
  // Ala
  lambda_f: number;
  lambda_pf: number;
  lambda_rf: number;
  flangeClass: "compact" | "noncompact" | "slender";
  // Alma
  lambda_w: number;
  lambda_pw: number;
  lambda_rw: number;
  webClass: "compact" | "noncompact" | "slender";
}

export interface SectionConfig {
  type: SectionType;
  dims: SectionDimensions;
  props: SectionProperties;
  compactness: CompactnessResult;
  // Tipo A: perfil laminado
  profileName?: string;
  // Tipo D: canal UPN
  upnProfile?: string;
  // Tipo E: chapa PL
  plateBf?: number;
  plateTf?: number;
  // Tipo F: surge plate
  surgeBf?: number;
  surgeTf?: number;
  // Tipo G: viga auxiliar
  auxProfile?: string;
  auxH?: number;
  auxSep?: number;
  // Tipo H/I: cajón
  bInt?: number;
  // Tipo J: birriel
  companionProfile?: string;
  companionSep?: number;
}

// --- Carril ---
export type RailType = "SA" | "SF" | "IRAM" | "custom" | "none";

export interface RailConfig {
  type: RailType;
  designation?: string;
  hr: number;     // mm altura total
  br: number;     // mm ancho cabeza
  tw_r: number;   // mm alma
  eccentricity: number; // mm excentricidad respecto al alma
  connection: "continuous" | "discontinuous";
  spliceB?: number; // mm
  spliceT?: number; // mm
}

// --- Grúa ---
export interface CraneAxle {
  index: number;
  dx: number;    // mm posición relativa desde eje 1
  Pw: number;    // kN carga por rueda estática
  Ph: number;    // kN fuerza lateral por riel
  HT: number;    // kN fuerza longitudinal de marcha
  Pv: number;    // kN = Pw * (1 + phi) — calculado
}

export interface CraneConfig {
  id: string;
  label: string;
  color: string;
  cmaaClass: CmaaClass;
  phi: number;          // factor dinámico vertical
  Gcrane: number;       // kN peso total del puente
  axles: CraneAxle[];
  minSeparation: number; // mm separación mín entre grúas
}

export interface BufferConfig {
  eStop: number;       // mm distancia rueda final al tope
  bufferFactor: number; // fracción de Gcrane (0.10, 0.20, 0.30)
  eccentricity: number; // mm excentricidad del tope
}

// --- Cargas Excéntricas ---
export interface EccentricLoads {
  Hts: number; // kN fuerza lateral ala superior
  Hti: number; // kN fuerza lateral ala inferior
}

// --- Combinaciones ---
export interface LoadCombination {
  id: string;
  name: string;
  gammaD: number; // factor carga permanente
  gammaL: number; // factor carga variable (grúa)
  gammaW: number; // factor viento
}

// --- Resultados por posición ---
export interface InternalForces {
  x: number;    // m posición
  My: number;   // kNm momento eje mayor
  Mz: number;   // kNm momento eje menor
  Vy: number;   // kN corte eje mayor
  Vz: number;   // kN corte eje menor
  N: number;    // kN axial
}

export interface EnvelopeResult {
  x: number;
  Mmax: number;
  Mmin: number;
  Vmax: number;
  Vmin: number;
}

// --- Verificaciones ---
export interface FlexuralStrength {
  Mp: number;     // kNm momento plástico
  Lp: number;     // m longitud límite pandeo inelástico
  Lr: number;     // m longitud límite pandeo elástico
  Lb: number;     // m longitud no arriostrada
  Cb: number;     // factor momento no uniforme
  Mn: number;     // kNm momento nominal
  phiMn: number;  // kNm momento de diseño
  ltbZone: 1 | 2 | 3;
}

export interface ShearStrength {
  Aw: number;     // cm² área alma
  Cv1: number;    // coeficiente de corte
  Vn: number;     // kN resistencia nominal
  phiVn: number;  // kN resistencia de diseño
}

export interface InteractionCheck {
  rx: number;     // Mux/phiMnx
  ry: number;     // Muy/phiMny
  eta: number;    // rx + ry
  pass: boolean;
}

export interface DeflectionCheck {
  deltaV: number;    // mm deflexión vertical
  deltaH: number;    // mm deflexión horizontal
  limitV: number;    // mm límite vertical
  limitH: number;    // mm límite horizontal
  ratioV: number;
  ratioH: number;
  passV: boolean;
  passH: boolean;
}

export interface SpanResult {
  spanIndex: number;
  length: number;       // m
  flexure: FlexuralStrength;
  flexureMinor: { Mn: number; phiMn: number };
  shear: ShearStrength;
  interaction: InteractionCheck;
  deflection: DeflectionCheck;
  Mux: number;          // kNm solicitación mayorada eje mayor
  Muy: number;          // kNm solicitación mayorada eje menor
  Vu: number;           // kN corte mayorado
  etaMax: number;       // demanda máxima
  status: "ok" | "warning" | "fail";
}

export interface ReactionResult {
  nodeIndex: number;
  Rmax: number;   // kN
  Rmin: number;   // kN
  Rinst: number;  // kN instantánea
}

// --- Punto de tensión ---
export interface StressPoint {
  id: string;      // P1...P10
  label: string;
  sigmaX: number;  // MPa normal global
  sigmaZ: number;  // MPa local
  tauXZ: number;   // MPa corte
  sigmaEq: number; // MPa Von Mises equiv.
  limit: number;   // MPa
  ratio: number;
  fatigueCategory?: string;
}

// --- Fatiga ---
export interface FatigueCheck {
  pointId: string;
  category: string;
  FSR: number;        // MPa rango admisible
  deltaSigma: number; // MPa rango actuante
  ratio: number;
  pass: boolean;
  nCycles: number;
}

// --- Soldaduras ---
export interface WeldCheck {
  location: string;
  aw: number;       // mm garganta
  q: number;        // kN/m flujo de corte
  tau: number;      // MPa tensión tangencial
  tauAdm: number;   // MPa admisible
  ratio: number;
  pass: boolean;
}

// --- Proyecto completo ---
export interface ProjectData {
  general: GeneralData;
  spans: Span[];
  supports: Support[];
  stiffeners: StiffenerConfig[];
  section: SectionConfig;
  rail: RailConfig;
  cranes: CraneConfig[];
  buffer: BufferConfig;
  settings: CalculationSettings;
}

export interface CalculationSettings {
  stepMm: number;           // paso del tren en mm
  envelopePositions: number; // ≥ 140
  diagramPoints: number;     // puntos por vano (default 60)
  Cb: number | "auto";      // factor LTB
  Lb: number | "auto";      // longitud no arriostrada
  deflLimitV: number;       // denominador (ej: 600 para L/600)
  deflLimitH: number;       // denominador (ej: 400 para L/400)
  enableFatigue: boolean;
  combinations: LoadCombination[];
}
