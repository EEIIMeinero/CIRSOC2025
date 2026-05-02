import autoTable from "jspdf-autotable";
import type { PdfCtx } from "./helpers";
import { title, text, bold, gap, getTableY, newPage, f } from "./helpers";
import type { ProjectData } from "@/lib/types";

export function writeCargas(ctx: PdfCtx, p: ProjectData): void {
  newPage(ctx);
  title(ctx, "4. ACCIONES — CARGAS DE GRUA");

  if (p.cranes.length === 0) {
    text(ctx, "No se definieron gruas.");
    return;
  }

  for (let ci = 0; ci < p.cranes.length; ci++) {
    const crane = p.cranes[ci];
    bold(ctx, `4.${ci + 1} Grua: ${crane.label} (Clase ${crane.cmaaClass})`);
    text(ctx, `Factor dinamico vertical: phi = ${f(crane.phi, 2)}`);
    text(ctx, `Peso total puente: Gcrane = ${f(crane.Gcrane)} kN`);
    text(ctx, `Separacion minima entre gruas: ${f(crane.minSeparation, 0)} mm`);
    gap(ctx, 2);

    autoTable(ctx.doc, {
      startY: ctx.y,
      head: [["Eje", "dx (mm)", "Pw (kN)", "Pv=Pw*(1+phi) (kN)", "Ph (kN)", "HT (kN)"]],
      body: crane.axles.map((a) => [
        `${a.index + 1}`,
        f(a.dx, 0),
        f(a.Pw),
        f(a.Pv),
        f(a.Ph),
        f(a.HT),
      ]),
      margin: { left: ctx.ml },
      styles: { fontSize: 8 },
    });
    ctx.y = getTableY(ctx.doc) + 6;

    text(ctx, `Pv = Pw * (1 + phi) — CIRSOC 301-2018 / AISC DG7-2019 Sec. 2.2`);
    gap(ctx, 4);
  }

  // Buffer
  bold(ctx, "4.X Tope de fin de carrera");
  text(ctx, `Distancia rueda-tope: ${f(p.buffer.eStop, 0)} mm`);
  text(ctx, `Factor de tope: ${f(p.buffer.bufferFactor, 2)} * Gcrane`);
  text(ctx, `Excentricidad tope: ${f(p.buffer.eccentricity, 0)} mm`);
}
