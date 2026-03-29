import autoTable from "jspdf-autotable";
import type { PdfCtx } from "./helpers";
import { title, gap, getTableY, checkPage } from "./helpers";
import type { ReactionResult } from "@/lib/types";

export function writeReacciones(ctx: PdfCtx, reactions: ReactionResult[]): void {
  checkPage(ctx, 60);
  title(ctx, "7. REACCIONES EN APOYOS");
  gap(ctx);

  autoTable(ctx.doc, {
    startY: ctx.y,
    head: [["Apoyo", "R_max (kN)", "R_min (kN)", "R_inst (kN)"]],
    body: reactions.map((r) => [
      `N${r.nodeIndex}`,
      r.Rmax.toFixed(1),
      r.Rmin.toFixed(1),
      r.Rinst.toFixed(1),
    ]),
    margin: { left: ctx.ml },
    styles: { fontSize: 9 },
  });
  ctx.y = getTableY(ctx.doc) + 10;
}
