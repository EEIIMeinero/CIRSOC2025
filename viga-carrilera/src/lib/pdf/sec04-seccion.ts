import autoTable from "jspdf-autotable";
import type { PdfCtx } from "./helpers";
import { title, text, bold, formula, gap, getTableY, newPage, f } from "./helpers";
import type { ProjectData } from "@/lib/types";

export function writeSeccion(ctx: PdfCtx, p: ProjectData): void {
  newPage(ctx);
  title(ctx, "3. SECCION TRANSVERSAL");

  if (!p.section) { text(ctx, "Seccion no definida."); return; }

  const sec = p.section;
  const d = sec.dims;
  const pr = sec.props;

  // 3.1 Dimensiones
  bold(ctx, "3.1 Dimensiones");
  autoTable(ctx.doc, {
    startY: ctx.y,
    head: [["Parametro", "Valor", "Unidad"]],
    body: [
      ["Tipo de seccion", sec.type + (sec.profileName ? ` (${sec.profileName})` : ""), ""],
      ["d (altura total)", f(d.d), "mm"],
      ["bfs (ancho ala superior)", f(d.bfs), "mm"],
      ["tfs (espesor ala superior)", f(d.tfs), "mm"],
      ["bfi (ancho ala inferior)", f(d.bfi), "mm"],
      ["tfi (espesor ala inferior)", f(d.tfi), "mm"],
      ["tw (espesor alma)", f(d.tw), "mm"],
      ["h (altura libre alma)", f(d.h), "mm"],
    ],
    margin: { left: ctx.ml },
    styles: { fontSize: 8 },
  });
  ctx.y = getTableY(ctx.doc) + 6;

  // 3.2 Propiedades calculadas
  bold(ctx, "3.2 Propiedades de la seccion (calculadas)");
  autoTable(ctx.doc, {
    startY: ctx.y,
    head: [["Propiedad", "Valor", "Unidad", "Descripcion"]],
    body: [
      ["A", f(pr.A, 2), "cm2", "Area total de la seccion"],
      ["yc", f(pr.yc), "mm", "Centroide desde fibra inferior"],
      ["Ix", f(pr.Ix, 0), "cm4", "Momento de inercia eje fuerte"],
      ["Sx+ (sup)", f(pr.SxTop), "cm3", "Modulo elastico fibra superior"],
      ["Sx- (inf)", f(pr.SxBot), "cm3", "Modulo elastico fibra inferior"],
      ["Zx", f(pr.Zx), "cm3", "Modulo plastico eje fuerte"],
      ["Iy,eff", f(pr.Iy_eff, 0), "cm4", "Inercia efectiva ala comprimida (LTB)"],
      ["iy,eff", f(pr.iy_eff), "mm", "Radio de giro ala comprimida"],
      ["rts", f(pr.rts), "mm", "Radio de giro para LTB (Ec. F2-7)"],
      ["J", f(pr.J, 2), "cm4", "Constante torsional St. Venant"],
      ["Cw", f(pr.Cw, 0), "cm6", "Constante de alabeo (warping)"],
      ["wDL", f(pr.wDL, 3), "kN/m", "Peso propio"],
    ],
    margin: { left: ctx.ml },
    styles: { fontSize: 8 },
  });
  ctx.y = getTableY(ctx.doc) + 6;

  // 3.3 Compacidad
  bold(ctx, "3.3 Clasificacion de compacidad — CIRSOC 301-2018 Tabla B4.1b");
  gap(ctx, 2);

  const c = sec.compactness;
  const sqrtEFy = `sqrt(E/Fy) = sqrt(${p.general.material.E}/${p.general.material.Fy}) = ${Math.sqrt(p.general.material.E / p.general.material.Fy).toFixed(2)}`;
  text(ctx, `sqrt(E/Fy) = ${sqrtEFy}`);

  bold(ctx, "Ala (Caso 10 — elemento no rigidizado):");
  formula(ctx, `lf = bfs/(2*tfs) = ${f(d.bfs)}/(2*${f(d.tfs)}) = ${f(c.lambda_f, 2)}`);
  formula(ctx, `lpf = 0.38*sqrt(E/Fy) = ${f(c.lambda_pf, 2)}`);
  formula(ctx, `lrf = 1.00*sqrt(E/Fy) = ${f(c.lambda_rf, 2)}`);
  formula(ctx, `lf=${f(c.lambda_f,2)} ${c.lambda_f <= c.lambda_pf ? "<=" : ">"} lpf=${f(c.lambda_pf,2)} => ALA ${c.flangeClass === "compact" ? "COMPACTA" : c.flangeClass === "noncompact" ? "NO COMPACTA" : "ESBELTA"}`);
  gap(ctx, 2);

  bold(ctx, "Alma (Caso 15 — elemento rigidizado):");
  formula(ctx, `lw = h/tw = ${f(d.h)}/${f(d.tw)} = ${f(c.lambda_w, 2)}`);
  formula(ctx, `lpw = 3.76*sqrt(E/Fy) = ${f(c.lambda_pw, 2)}`);
  formula(ctx, `lrw = 5.70*sqrt(E/Fy) = ${f(c.lambda_rw, 2)}`);
  formula(ctx, `lw=${f(c.lambda_w,2)} ${c.lambda_w <= c.lambda_pw ? "<=" : ">"} lpw=${f(c.lambda_pw,2)} => ALMA ${c.webClass === "compact" ? "COMPACTA" : c.webClass === "noncompact" ? "NO COMPACTA" : "ESBELTA"}`);
}
