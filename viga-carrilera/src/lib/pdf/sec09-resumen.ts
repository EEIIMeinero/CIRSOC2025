import autoTable from "jspdf-autotable";
import type { PdfCtx } from "./helpers";
import { title, gap, getTableY, newPage } from "./helpers";
import type { SpanResult } from "@/lib/types";

export function writeResumen(ctx: PdfCtx, results: SpanResult[]): void {
  newPage(ctx);
  title(ctx, "8. RESUMEN GLOBAL DE VERIFICACIONES");
  gap(ctx);

  const globalPass = results.every((r) => r.status !== "fail");

  autoTable(ctx.doc, {
    startY: ctx.y,
    head: [["Vano", "eta_flex", "eta_corte", "dv/lim", "dh/lim", "eta_max", "Estado"]],
    body: results.map((r) => {
      const etaShear = r.shear.phiVn > 0 ? r.Vu / r.shear.phiVn : 0;
      return [
        `V${r.spanIndex + 1}`,
        r.interaction.eta.toFixed(3),
        etaShear.toFixed(3),
        `${r.deflection.deltaV.toFixed(1)}/${r.deflection.limitV.toFixed(1)}`,
        `${r.deflection.deltaH.toFixed(1)}/${r.deflection.limitH.toFixed(1)}`,
        r.etaMax.toFixed(3),
        r.status === "fail" ? "NO VERIFICA" : r.status === "warning" ? "AJUSTADO" : "OK",
      ];
    }),
    margin: { left: ctx.ml },
    styles: { fontSize: 9 },
    headStyles: { fillColor: globalPass ? [34, 197, 94] : [239, 68, 68] },
  });
  ctx.y = getTableY(ctx.doc) + 14;

  ctx.doc.setFontSize(16);
  ctx.doc.setFont("helvetica", "bold");
  ctx.doc.setTextColor(globalPass ? 22 : 220, globalPass ? 163 : 38, globalPass ? 74 : 38);
  ctx.doc.text(
    `RESULTADO GLOBAL: ${globalPass ? "VERIFICA" : "NO VERIFICA"}`,
    ctx.pageW / 2, ctx.y, { align: "center" }
  );
  ctx.doc.setTextColor(0, 0, 0);
  ctx.y += 20;

  // Referencias
  title(ctx, "REFERENCIAS NORMATIVAS", 11);
  const refs = [
    "CIRSOC 301-2018  Reglamento Argentino de Estructuras de Acero",
    "CIRSOC 101-2025  Reglamento de Cargas y Combinaciones",
    "AISC 360-22  Specification for Structural Steel Buildings",
    "AISC DG7-2019  Design Guide 7 — Industrial Buildings, 3ra ed.",
    "CMAA Spec. 70  Specifications for Top Running Bridge & Gantry Type Multiple Girder EOT Cranes",
  ];
  ctx.doc.setFontSize(9);
  ctx.doc.setFont("helvetica", "normal");
  for (const ref of refs) {
    ctx.doc.text(`\u2022 ${ref}`, ctx.ml, ctx.y);
    ctx.y += 5;
  }
}
