import type { PdfCtx } from "./helpers";
import type { ProjectData } from "@/lib/types";

export function writePortada(ctx: PdfCtx, p: ProjectData): void {
  const { doc, pageW } = ctx;
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("MEMORIA DE CALCULO", pageW / 2, 60, { align: "center" });
  doc.setFontSize(18);
  doc.text("Viga Carrilera", pageW / 2, 72, { align: "center" });
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(p.general.projectName, pageW / 2, 90, { align: "center" });
  doc.setFontSize(10);
  doc.text(`Profesional: ${p.general.engineer || "\u2014"}`, pageW / 2, 105, { align: "center" });
  doc.text(`Matricula: ${p.general.license || "\u2014"}`, pageW / 2, 112, { align: "center" });
  doc.text(`Empresa: ${p.general.company || "\u2014"}`, pageW / 2, 119, { align: "center" });
  doc.text(`Fecha: ${p.general.date}`, pageW / 2, 126, { align: "center" });
  doc.setFontSize(9);
  doc.text("Normativa de referencia:", pageW / 2, 145, { align: "center" });
  doc.text("CIRSOC 301-2018 \u00B7 CIRSOC 101-2025 \u00B7 AISC 360-22 \u00B7 AISC DG7-2019", pageW / 2, 152, { align: "center" });
}
