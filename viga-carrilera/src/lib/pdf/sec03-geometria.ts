import autoTable from "jspdf-autotable";
import type { PdfCtx } from "./helpers";
import { title, gap, getTableY, checkPage } from "./helpers";
import type { ProjectData } from "@/lib/types";

export function writeGeometria(ctx: PdfCtx, p: ProjectData): void {
  checkPage(ctx, 60);
  title(ctx, "2. GEOMETRIA Y CONDICIONES DE APOYO");
  gap(ctx);

  const rows = p.spans.map((s) => [`V${s.index + 1}`, `${s.length.toFixed(2)} m`]);
  const total = p.spans.reduce((s, v) => s + v.length, 0);
  rows.push(["TOTAL", `${total.toFixed(2)} m`]);

  autoTable(ctx.doc, {
    startY: ctx.y,
    head: [["Vano", "Longitud"]],
    body: rows,
    margin: { left: ctx.ml },
    styles: { fontSize: 9 },
  });
  ctx.y = getTableY(ctx.doc) + 8;

  checkPage(ctx, 40);
  autoTable(ctx.doc, {
    startY: ctx.y,
    head: [["Nodo", "Tipo apoyo", "Long. apoyo (mm)", "Rigidizador", "Articulacion"]],
    body: p.supports.map((s) => [
      `N${s.nodeIndex}`,
      s.type,
      `${s.bearingLength}`,
      s.stiffener,
      s.hasHinge ? "Si" : "No",
    ]),
    margin: { left: ctx.ml },
    styles: { fontSize: 9 },
  });
  ctx.y = getTableY(ctx.doc) + 10;
}
