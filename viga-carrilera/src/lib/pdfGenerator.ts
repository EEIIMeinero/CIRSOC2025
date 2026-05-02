// ============================================================================
// VIGACARRILERA — PDF Memoria de Calculo (orquestador)
// Genera memoria detallada paso a paso, auditable por revision de pares.
// ============================================================================

import jsPDF from "jspdf";
import type { ProjectData, SpanResult, ReactionResult } from "@/lib/types";
import { newCtx } from "./pdf/helpers";
import { writePortada } from "./pdf/sec01-portada";
import { writeDatos } from "./pdf/sec02-datos";
import { writeGeometria } from "./pdf/sec03-geometria";
import { writeSeccion } from "./pdf/sec04-seccion";
import { writeCargas } from "./pdf/sec05-cargas";
import { writeCombinaciones } from "./pdf/sec06-combinaciones";
import { writeVerificaciones } from "./pdf/sec07-verificaciones";
import { writeReacciones } from "./pdf/sec08-reacciones";
import { writeResumen } from "./pdf/sec09-resumen";

export function generatePDF(
  project: ProjectData,
  spanResults: SpanResult[],
  reactions: ReactionResult[]
): jsPDF {
  const doc = new jsPDF("p", "mm", "a4");
  const ctx = newCtx(doc);

  // 0. Portada
  writePortada(ctx, project);

  // 1. Datos generales y material
  writeDatos(ctx, project);

  // 2. Geometria y apoyos
  writeGeometria(ctx, project);

  // 3. Seccion transversal + compacidad
  writeSeccion(ctx, project);

  // 4. Acciones (cargas de grua)
  writeCargas(ctx, project);

  // 5. Combinaciones de carga
  writeCombinaciones(ctx, project);

  // 6. Verificaciones LRFD por vano (paso a paso con formulas)
  if (spanResults.length > 0) {
    writeVerificaciones(ctx, project, spanResults);

    // 7. Reacciones
    writeReacciones(ctx, reactions);

    // 8. Resumen global
    writeResumen(ctx, spanResults);
  }

  return doc;
}
