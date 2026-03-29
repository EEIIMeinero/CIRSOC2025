import autoTable from "jspdf-autotable";
import type { PdfCtx } from "./helpers";
import { title, gap, getTableY, newPage } from "./helpers";
import type { ProjectData } from "@/lib/types";

export function writeDatos(ctx: PdfCtx, p: ProjectData): void {
  newPage(ctx);
  title(ctx, "1. DATOS GENERALES Y MATERIAL");
  gap(ctx);

  const mat = p.general.material;
  autoTable(ctx.doc, {
    startY: ctx.y,
    head: [["Propiedad", "Valor", "Referencia"]],
    body: [
      ["Material", mat.name, mat.norm || "\u2014"],
      ["Fy (tension de fluencia)", `${mat.Fy} MPa`, "CIRSOC 301-2018 \u00A7A3"],
      ["Fu (tension de rotura)", `${mat.Fu} MPa`, ""],
      ["E (modulo de elasticidad)", `${mat.E} MPa`, ""],
      ["G (modulo de corte)", `${mat.G} MPa`, ""],
      ["Tipo de grua", p.general.craneType === "top-running" ? "Puente grua superior (top-running)" : "Grua suspendida (underhung)", "AISC DG7-2019 \u00A71.2"],
      ["Clase CMAA", p.general.cmaaClass, "CMAA Spec. 70"],
    ],
    margin: { left: ctx.ml },
    styles: { fontSize: 9 },
  });
  ctx.y = getTableY(ctx.doc) + 10;
}
