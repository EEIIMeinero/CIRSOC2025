import { create } from "zustand";
import {
  GeneralData,
  Span,
  Support,
  StiffenerConfig,
  SectionConfig,
  RailConfig,
  CraneConfig,
  BufferConfig,
  CalculationSettings,
  SpanResult,
  ReactionResult,
  EnvelopeResult,
  CmaaClass,
} from "@/lib/types";

interface ProjectStore {
  // --- Datos del proyecto ---
  projectId: string | null;
  general: GeneralData;
  spans: Span[];
  supports: Support[];
  stiffeners: StiffenerConfig[];
  section: SectionConfig | null;
  rail: RailConfig;
  cranes: CraneConfig[];
  buffer: BufferConfig;
  settings: CalculationSettings;

  // --- Resultados ---
  spanResults: SpanResult[];
  reactions: ReactionResult[];
  envelopes: EnvelopeResult[][];
  trainPosition: number; // posición actual del tren en mm
  isCalculated: boolean;

  // --- Acciones ---
  setGeneral: (data: Partial<GeneralData>) => void;
  setSpans: (spans: Span[]) => void;
  addSpan: () => void;
  removeSpan: (index: number) => void;
  updateSpanLength: (index: number, length: number) => void;
  setSupports: (supports: Support[]) => void;
  updateSupport: (nodeIndex: number, data: Partial<Support>) => void;
  setSection: (section: SectionConfig | null) => void;
  setRail: (rail: RailConfig) => void;
  setCranes: (cranes: CraneConfig[]) => void;
  setBuffer: (buffer: BufferConfig) => void;
  setSettings: (settings: Partial<CalculationSettings>) => void;
  setTrainPosition: (pos: number) => void;
  setResults: (results: {
    spanResults: SpanResult[];
    reactions: ReactionResult[];
    envelopes: EnvelopeResult[][];
  }) => void;
  resetProject: () => void;
  loadProject: (data: Partial<ProjectStore>) => void;
}

const defaultGeneral: GeneralData = {
  projectName: "Nuevo Proyecto",
  engineer: "",
  date: new Date().toISOString().slice(0, 10),
  material: {
    id: "ar-f36",
    group: "AR",
    name: "F36 / A36",
    designation: "F36",
    Fy: 250,
    Fu: 400,
    E: 200000,
    G: 77000,
    gamma: 78.5,
    norm: "IRAM-IAS U 500-503",
  },
  craneType: "top-running",
  cmaaClass: "C" as CmaaClass,
};

const defaultSpans: Span[] = [
  { index: 0, length: 6.0 },
  { index: 1, length: 6.0 },
  { index: 2, length: 6.0 },
];

const defaultSupports: Support[] = [
  { nodeIndex: 0, type: "pinned", bearingLength: 150, stiffener: "rigid", hasHinge: false },
  { nodeIndex: 1, type: "roller", bearingLength: 150, stiffener: "rigid", hasHinge: false },
  { nodeIndex: 2, type: "roller", bearingLength: 150, stiffener: "rigid", hasHinge: false },
  { nodeIndex: 3, type: "pinned", bearingLength: 150, stiffener: "rigid", hasHinge: false },
];

const defaultRail: RailConfig = {
  type: "none",
  hr: 0,
  br: 0,
  tw_r: 0,
  eccentricity: 0,
  connection: "continuous",
};

const defaultBuffer: BufferConfig = {
  eStop: 200,
  bufferFactor: 0.20,
  eccentricity: 0,
};

const defaultSettings: CalculationSettings = {
  stepMm: 50,
  envelopePositions: 140,
  diagramPoints: 60,
  Cb: 1.0,
  Lb: "auto",
  deflLimitV: 600,
  deflLimitH: 400,
  enableFatigue: false,
  combinations: [
    { id: "U1", name: "1.4D", gammaD: 1.4, gammaL: 0, gammaW: 0 },
    { id: "U2", name: "1.2D + 1.6L", gammaD: 1.2, gammaL: 1.6, gammaW: 0 },
    { id: "U3", name: "1.2D + 1.6L + 0.5W", gammaD: 1.2, gammaL: 1.6, gammaW: 0.5 },
    { id: "U4", name: "1.2D + 1.0W + L", gammaD: 1.2, gammaL: 1.0, gammaW: 1.0 },
    { id: "U5", name: "0.9D + 1.0W", gammaD: 0.9, gammaL: 0, gammaW: 1.0 },
  ],
};

export const useProjectStore = create<ProjectStore>((set) => ({
  projectId: null,
  general: defaultGeneral,
  spans: defaultSpans,
  supports: defaultSupports,
  stiffeners: [],
  section: null,
  rail: defaultRail,
  cranes: [],
  buffer: defaultBuffer,
  settings: defaultSettings,
  spanResults: [],
  reactions: [],
  envelopes: [],
  trainPosition: 0,
  isCalculated: false,

  setGeneral: (data) =>
    set((s) => ({ general: { ...s.general, ...data }, isCalculated: false })),

  setSpans: (spans) => set({ spans, isCalculated: false }),

  addSpan: () =>
    set((s) => {
      if (s.spans.length >= 10) return s;
      const newSpan: Span = { index: s.spans.length, length: 6.0 };
      const newSupport: Support = {
        nodeIndex: s.spans.length + 1,
        type: "pinned",
        bearingLength: 150,
        stiffener: "rigid",
        hasHinge: false,
      };
      // Last support becomes roller, new one becomes pinned
      const updatedSupports = s.supports.map((sup, i) =>
        i === s.supports.length - 1 ? { ...sup, type: "roller" as const } : sup
      );
      return {
        spans: [...s.spans, newSpan],
        supports: [...updatedSupports, newSupport],
        isCalculated: false,
      };
    }),

  removeSpan: (index) =>
    set((s) => {
      if (s.spans.length <= 1) return s;
      const newSpans = s.spans
        .filter((_, i) => i !== index)
        .map((sp, i) => ({ ...sp, index: i }));
      const newSupports = s.supports
        .filter((_, i) => i !== index + 1)
        .map((sup, i) => ({ ...sup, nodeIndex: i }));
      // Ensure last support is pinned
      if (newSupports.length > 0) {
        newSupports[newSupports.length - 1].type = "pinned";
      }
      return { spans: newSpans, supports: newSupports, isCalculated: false };
    }),

  updateSpanLength: (index, length) =>
    set((s) => ({
      spans: s.spans.map((sp) =>
        sp.index === index ? { ...sp, length } : sp
      ),
      isCalculated: false,
    })),

  setSupports: (supports) => set({ supports, isCalculated: false }),

  updateSupport: (nodeIndex, data) =>
    set((s) => ({
      supports: s.supports.map((sup) =>
        sup.nodeIndex === nodeIndex ? { ...sup, ...data } : sup
      ),
      isCalculated: false,
    })),

  setSection: (section) => set({ section, isCalculated: false }),
  setRail: (rail) => set({ rail, isCalculated: false }),
  setCranes: (cranes) => set({ cranes, isCalculated: false }),
  setBuffer: (buffer) => set({ buffer, isCalculated: false }),

  setSettings: (data) =>
    set((s) => ({ settings: { ...s.settings, ...data }, isCalculated: false })),

  setTrainPosition: (trainPosition) => set({ trainPosition }),

  setResults: (results) =>
    set({ ...results, isCalculated: true }),

  resetProject: () =>
    set({
      projectId: null,
      general: defaultGeneral,
      spans: defaultSpans,
      supports: defaultSupports,
      stiffeners: [],
      section: null,
      rail: defaultRail,
      cranes: [],
      buffer: defaultBuffer,
      settings: defaultSettings,
      spanResults: [],
      reactions: [],
      envelopes: [],
      trainPosition: 0,
      isCalculated: false,
    }),

  loadProject: (data) => set({ ...data }),
}));
