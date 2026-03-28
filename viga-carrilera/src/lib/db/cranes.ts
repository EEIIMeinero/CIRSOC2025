// Biblioteca de puentes grúa estándar
// Fuentes: IRAM-IAS U 500-23 / CMAA Spec.70 / fabricantes típicos

export interface CraneTemplateData {
  code: string;
  category: number;
  Q: number;      // kN capacidad
  Lp: number;     // m luz del puente
  Gp: number;     // kN peso del puente
  Gc: number;     // kN peso del carro
  axles: number;
  aw: number;     // mm distancia entre ruedas
  cmaa: string;
  application: string;
}

export const CRANE_TEMPLATES: CraneTemplateData[] = [
  // CAT 1 — GRÚAS LIVIANAS (Clase A/B)
  { code: "GL-01", category: 1, Q: 20, Lp: 10.5, Gp: 45, Gc: 12, axles: 2, aw: 1200, cmaa: "A", application: "Talleres mantenimiento" },
  { code: "GL-02", category: 1, Q: 30, Lp: 12.0, Gp: 55, Gc: 15, axles: 2, aw: 1400, cmaa: "A", application: "Depósitos" },
  { code: "GL-03", category: 1, Q: 50, Lp: 12.0, Gp: 75, Gc: 20, axles: 2, aw: 1500, cmaa: "B", application: "Montaje liviano" },
  { code: "GL-04", category: 1, Q: 50, Lp: 15.0, Gp: 85, Gc: 22, axles: 2, aw: 1600, cmaa: "B", application: "Planta general" },
  { code: "GL-05", category: 1, Q: 80, Lp: 15.0, Gp: 110, Gc: 28, axles: 2, aw: 1800, cmaa: "B", application: "Prefabricados" },
  { code: "GL-06", category: 1, Q: 100, Lp: 16.0, Gp: 130, Gc: 32, axles: 2, aw: 2000, cmaa: "B", application: "Armado general" },
  { code: "GL-07", category: 1, Q: 100, Lp: 18.0, Gp: 145, Gc: 35, axles: 2, aw: 2100, cmaa: "B", application: "Construcción" },
  { code: "GL-08", category: 1, Q: 150, Lp: 18.0, Gp: 185, Gc: 45, axles: 2, aw: 2200, cmaa: "B", application: "Montaje pesado" },

  // CAT 2 — GRÚAS MEDIANAS (Clase C/D)
  { code: "GM-01", category: 2, Q: 150, Lp: 15.0, Gp: 200, Gc: 50, axles: 4, aw: 2000, cmaa: "C", application: "Metalmecánica" },
  { code: "GM-02", category: 2, Q: 200, Lp: 16.0, Gp: 240, Gc: 60, axles: 4, aw: 2200, cmaa: "C", application: "Fabricación" },
  { code: "GM-03", category: 2, Q: 200, Lp: 18.0, Gp: 260, Gc: 65, axles: 4, aw: 2400, cmaa: "C", application: "Acería pequeña" },
  { code: "GM-04", category: 2, Q: 250, Lp: 18.0, Gp: 300, Gc: 75, axles: 4, aw: 2500, cmaa: "C", application: "Fundición mediana" },
  { code: "GM-05", category: 2, Q: 300, Lp: 20.0, Gp: 360, Gc: 90, axles: 4, aw: 2600, cmaa: "C", application: "Industria general" },
  { code: "GM-06", category: 2, Q: 300, Lp: 22.0, Gp: 390, Gc: 95, axles: 4, aw: 2800, cmaa: "D", application: "Uso frecuente" },
  { code: "GM-07", category: 2, Q: 400, Lp: 20.0, Gp: 450, Gc: 110, axles: 4, aw: 2800, cmaa: "D", application: "Matricería" },
  { code: "GM-08", category: 2, Q: 400, Lp: 22.0, Gp: 480, Gc: 120, axles: 4, aw: 3000, cmaa: "D", application: "Trabajo pesado" },
  { code: "GM-09", category: 2, Q: 500, Lp: 22.0, Gp: 560, Gc: 140, axles: 4, aw: 3000, cmaa: "D", application: "Acería mediana" },
  { code: "GM-10", category: 2, Q: 500, Lp: 25.0, Gp: 610, Gc: 155, axles: 4, aw: 3200, cmaa: "D", application: "Fundición pesada" },

  // CAT 3 — GRÚAS PESADAS (Clase D/E)
  { code: "GP-01", category: 3, Q: 630, Lp: 22.0, Gp: 720, Gc: 185, axles: 4, aw: 3000, cmaa: "D", application: "Trabajo pesado" },
  { code: "GP-02", category: 3, Q: 630, Lp: 25.0, Gp: 780, Gc: 200, axles: 4, aw: 3200, cmaa: "D", application: "Metalurgia" },
  { code: "GP-03", category: 3, Q: 800, Lp: 25.0, Gp: 920, Gc: 240, axles: 4, aw: 3400, cmaa: "E", application: "Acería grande" },
  { code: "GP-04", category: 3, Q: 800, Lp: 28.0, Gp: 980, Gc: 260, axles: 4, aw: 3500, cmaa: "E", application: "Laminadora" },
  { code: "GP-05", category: 3, Q: 1000, Lp: 25.0, Gp: 1150, Gc: 300, axles: 4, aw: 3500, cmaa: "E", application: "Fundición pesada" },
  { code: "GP-06", category: 3, Q: 1000, Lp: 28.0, Gp: 1220, Gc: 320, axles: 4, aw: 3600, cmaa: "E", application: "Acería mediana" },
  { code: "GP-07", category: 3, Q: 1250, Lp: 28.0, Gp: 1450, Gc: 380, axles: 4, aw: 3800, cmaa: "E", application: "Colada continua" },
  { code: "GP-08", category: 3, Q: 1250, Lp: 30.0, Gp: 1530, Gc: 400, axles: 4, aw: 4000, cmaa: "E", application: "Industria pesada" },
  { code: "GP-09", category: 3, Q: 1600, Lp: 28.0, Gp: 1800, Gc: 480, axles: 4, aw: 4000, cmaa: "E", application: "Acería pesada" },
  { code: "GP-10", category: 3, Q: 1600, Lp: 30.0, Gp: 1900, Gc: 510, axles: 4, aw: 4200, cmaa: "E", application: "Gran acería" },

  // CAT 4 — GRÚAS MUY PESADAS (Clase E/F)
  { code: "GX-01", category: 4, Q: 2000, Lp: 28.0, Gp: 2200, Gc: 600, axles: 4, aw: 4200, cmaa: "E", application: "Acería integrada" },
  { code: "GX-02", category: 4, Q: 2000, Lp: 30.0, Gp: 2350, Gc: 650, axles: 4, aw: 4400, cmaa: "E", application: "Industria naval" },
  { code: "GX-03", category: 4, Q: 2500, Lp: 30.0, Gp: 2800, Gc: 780, axles: 8, aw: 4500, cmaa: "F", application: "Gran industria" },
  { code: "GX-04", category: 4, Q: 2500, Lp: 32.0, Gp: 2950, Gc: 820, axles: 8, aw: 4600, cmaa: "F", application: "Colada continua" },
  { code: "GX-05", category: 4, Q: 3200, Lp: 30.0, Gp: 3500, Gc: 980, axles: 8, aw: 4600, cmaa: "F", application: "Acería primaria" },
  { code: "GX-06", category: 4, Q: 3200, Lp: 32.0, Gp: 3700, Gc: 1050, axles: 8, aw: 4800, cmaa: "F", application: "Fundición horno" },
  { code: "GX-07", category: 4, Q: 4000, Lp: 32.0, Gp: 4400, Gc: 1250, axles: 8, aw: 5000, cmaa: "F", application: "Sector pesado" },
  { code: "GX-08", category: 4, Q: 5000, Lp: 30.0, Gp: 5300, Gc: 1550, axles: 8, aw: 5000, cmaa: "F", application: "Máx. industria" },

  // CAT 5 — GRÚAS ESPECIALES Y DE PROCESO
  { code: "GE-01", category: 5, Q: 30, Lp: 8.0, Gp: 35, Gc: 10, axles: 2, aw: 900, cmaa: "A", application: "Sala máquinas" },
  { code: "GE-02", category: 5, Q: 50, Lp: 10.0, Gp: 55, Gc: 15, axles: 2, aw: 1200, cmaa: "B", application: "Subestación" },
  { code: "GE-03", category: 5, Q: 100, Lp: 12.0, Gp: 120, Gc: 30, axles: 2, aw: 1500, cmaa: "B", application: "Turbinas" },
  { code: "GE-04", category: 5, Q: 200, Lp: 14.0, Gp: 230, Gc: 58, axles: 4, aw: 2000, cmaa: "C", application: "Química/Farmac." },
  { code: "GE-05", category: 5, Q: 300, Lp: 16.0, Gp: 340, Gc: 85, axles: 4, aw: 2400, cmaa: "C", application: "Cemento" },
  { code: "GE-06", category: 5, Q: 500, Lp: 20.0, Gp: 560, Gc: 142, axles: 4, aw: 2800, cmaa: "D", application: "Minería" },
  { code: "GE-07", category: 5, Q: 800, Lp: 22.0, Gp: 900, Gc: 230, axles: 4, aw: 3200, cmaa: "D", application: "Papel/celulosa" },
  { code: "GE-08", category: 5, Q: 1000, Lp: 20.0, Gp: 1100, Gc: 280, axles: 4, aw: 3400, cmaa: "E", application: "Puerto / dique" },
  { code: "GE-09", category: 5, Q: 150, Lp: 12.0, Gp: 175, Gc: 45, axles: 4, aw: 1800, cmaa: "C", application: "Alimentación" },
  { code: "GE-10", category: 5, Q: 250, Lp: 16.0, Gp: 290, Gc: 72, axles: 4, aw: 2200, cmaa: "C", application: "Automotriz" },
];

export function getCranesByCategory(category: number): CraneTemplateData[] {
  return CRANE_TEMPLATES.filter((c) => c.category === category);
}

export function getCraneByCode(code: string): CraneTemplateData | undefined {
  return CRANE_TEMPLATES.find((c) => c.code === code);
}

export const CMAA_PHI: Record<string, number> = {
  A: 0.10,
  B: 0.15,
  C: 0.20,
  D: 0.25,
  E: 0.30,
  F: 0.40,
};

export const CMAA_BUFFER_FACTOR: Record<string, number> = {
  A: 0.10, B: 0.10,
  C: 0.20, D: 0.20,
  E: 0.30, F: 0.30,
};

export const CATEGORY_NAMES: Record<number, string> = {
  1: "Livianas (Clase A/B)",
  2: "Medianas (Clase C/D)",
  3: "Pesadas (Clase D/E)",
  4: "Muy pesadas (Clase E/F)",
  5: "Especiales y de proceso",
};
