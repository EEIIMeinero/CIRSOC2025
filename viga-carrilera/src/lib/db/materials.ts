import { Material } from "@/lib/types";

// Base de datos de materiales — 4 grupos regionales
// CIRSOC 301-2018 §A3 / AISC 360-22 §A3 / EN 10025

export const MATERIALS: Material[] = [
  // ── GRUPO 1 — ARGENTINA (IRAM / CIRSOC) ──
  { id: "ar-f24", group: "AR", name: "F24", designation: "F24", Fy: 235, Fu: 360, E: 200000, G: 77000, gamma: 78.5, norm: "IRAM-IAS U 500-503", notes: "Perfiles laminados livianos" },
  { id: "ar-f36", group: "AR", name: "F36 / A36", designation: "F36", Fy: 250, Fu: 400, E: 200000, G: 77000, gamma: 78.5, norm: "IRAM-IAS U 500-503", notes: "Perfiles laminados, chapas, más común AR" },
  { id: "ar-f40", group: "AR", name: "F40", designation: "F40", Fy: 275, Fu: 430, E: 200000, G: 77000, gamma: 78.5, norm: "IRAM-IAS U 500-503", notes: "Chapas gruesas" },
  { id: "ar-f50", group: "AR", name: "F50 / A572 Gr.50", designation: "F50", Fy: 345, Fu: 450, E: 200000, G: 77000, gamma: 78.5, norm: "IRAM-IAS U 500-503", notes: "Vigas armadas, grúas medianas y pesadas" },
  { id: "ar-f70", group: "AR", name: "F70 / A514", designation: "F70", Fy: 485, Fu: 620, E: 200000, G: 77000, gamma: 78.5, norm: "IRAM-IAS U 500-503", notes: "Grúas muy pesadas, alta resistencia" },

  // ── GRUPO 2 — ESTADOS UNIDOS (ASTM / AISC) ──
  { id: "us-a36", group: "US", name: "A36", designation: "A36", Fy: 250, Fu: 400, E: 200000, G: 77000, gamma: 78.5, norm: "ASTM A36" },
  { id: "us-a572-42", group: "US", name: "A572 Gr.42", designation: "A572-42", Fy: 290, Fu: 415, E: 200000, G: 77000, gamma: 78.5, norm: "ASTM A572" },
  { id: "us-a572-50", group: "US", name: "A572 Gr.50", designation: "A572-50", Fy: 345, Fu: 450, E: 200000, G: 77000, gamma: 78.5, norm: "ASTM A572", notes: "Perfiles W, el más usado en USA" },
  { id: "us-a572-60", group: "US", name: "A572 Gr.60", designation: "A572-60", Fy: 415, Fu: 520, E: 200000, G: 77000, gamma: 78.5, norm: "ASTM A572" },
  { id: "us-a572-65", group: "US", name: "A572 Gr.65", designation: "A572-65", Fy: 450, Fu: 550, E: 200000, G: 77000, gamma: 78.5, norm: "ASTM A572" },
  { id: "us-a992", group: "US", name: "A992", designation: "A992", Fy: 345, Fu: 450, E: 200000, G: 77000, gamma: 78.5, norm: "ASTM A992", notes: "Perfiles W laminados (Fy/Fu≤0.85)" },
  { id: "us-a588", group: "US", name: "A588 Gr.50 (Corten)", designation: "A588-50", Fy: 345, Fu: 485, E: 200000, G: 77000, gamma: 78.5, norm: "ASTM A588", notes: "Resistente a la corrosión" },
  { id: "us-a514b", group: "US", name: "A514 Gr.B", designation: "A514-B", Fy: 690, Fu: 760, E: 200000, G: 77000, gamma: 78.5, norm: "ASTM A514", notes: "Alta resistencia (e ≤ 65mm)" },
  { id: "us-a514h", group: "US", name: "A514 Gr.H", designation: "A514-H", Fy: 620, Fu: 690, E: 200000, G: 77000, gamma: 78.5, norm: "ASTM A514", notes: "Chapas gruesas (e > 65mm)" },
  { id: "us-a1011", group: "US", name: "A1011 Gr.50", designation: "A1011-50", Fy: 345, Fu: 414, E: 200000, G: 77000, gamma: 78.5, norm: "ASTM A1011" },
  { id: "us-a709", group: "US", name: "A709 Gr.50", designation: "A709-50", Fy: 345, Fu: 450, E: 200000, G: 77000, gamma: 78.5, norm: "ASTM A709", notes: "Puentes y estructuras especiales" },

  // ── GRUPO 3 — EUROPA (EN 10025) ──
  { id: "eu-s235", group: "EU", name: "S235", designation: "S235", Fy: 235, Fu: 360, E: 200000, G: 77000, gamma: 78.5, norm: "EN 10025-2", notes: "Equiv. aprox. F24/A36" },
  { id: "eu-s275", group: "EU", name: "S275", designation: "S275", Fy: 275, Fu: 430, E: 200000, G: 77000, gamma: 78.5, norm: "EN 10025-2", notes: "Perfiles IPE/HEB" },
  { id: "eu-s355", group: "EU", name: "S355", designation: "S355", Fy: 355, Fu: 490, E: 200000, G: 77000, gamma: 78.5, norm: "EN 10025-2", notes: "Más usado en Europa para industria" },
  { id: "eu-s420", group: "EU", name: "S420", designation: "S420", Fy: 420, Fu: 520, E: 200000, G: 77000, gamma: 78.5, norm: "EN 10025-3" },
  { id: "eu-s460", group: "EU", name: "S460", designation: "S460", Fy: 460, Fu: 540, E: 200000, G: 77000, gamma: 78.5, norm: "EN 10025-3" },
  { id: "eu-s690", group: "EU", name: "S690", designation: "S690", Fy: 690, Fu: 770, E: 200000, G: 77000, gamma: 78.5, norm: "EN 10025-6", notes: "Ultra alta resistencia" },
];

export function getMaterialsByGroup(group: Material["group"]): Material[] {
  return MATERIALS.filter((m) => m.group === group);
}

export function getMaterialById(id: string): Material | undefined {
  return MATERIALS.find((m) => m.id === id);
}

// Ajuste de Fy por espesor — CIRSOC 301-2018 §A3
export function adjustFyByThickness(mat: Material, maxThickness: number): number {
  const { Fy, designation } = mat;
  if (designation.startsWith("S355") || designation === "S355") {
    if (maxThickness <= 16) return 355;
    if (maxThickness <= 40) return 345;
    if (maxThickness <= 63) return 335;
    if (maxThickness <= 80) return 325;
    if (maxThickness <= 100) return 315;
  }
  if (designation.includes("A572") && designation.includes("50")) {
    if (maxThickness <= 32) return 345;
    if (maxThickness <= 102) return 310;
  }
  return Fy;
}
