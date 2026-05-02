import autoTable from "jspdf-autotable";
import type { PdfCtx } from "./helpers";
import { title, text, gap, getTableY } from "./helpers";
import type { ProjectData } from "@/lib/types";

export function writeCombinaciones(ctx: PdfCtx, p: ProjectData): void {
  title(ctx, "5. COMBINACIONES DE CARGA — CIRSOC 101-2025 Tabla 2.3");
  gap(ctx);
  text(ctx, "Metodo de diseno: LRFD (Load and Resistance Factor Design)");
  text(ctx, "D = carga permanente (peso propio), L = carga variable (grua), W = viento");
  gap(ctx, 2);

  autoTable(ctx.doc, {
    startY: ctx.y,
    head: [["Combinacion", "Expresion", "gD", "gL", "gW"]],
    body: p.settings.combinations.map((c) => [
      c.id,
      c.name,
      c.gammaD.toFixed(2),
      c.gammaL.toFixed(2),
      c.gammaW.toFixed(2),
    ]),
    margin: { left: ctx.ml },
    styles: { fontSize: 9 },
  });
  ctx.y = getTableY(ctx.doc) + 6;

  text(ctx, "La combinacion gobernante es la que produce la maxima demanda (Mux + Muy).");
  text(ctx, "Referencia: CIRSOC 101-2025 Tabla 2.3, ASCE/SEI 7-22 Sec. 2.3.2");
}
