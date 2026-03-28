import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ProjectData, SpanResult, ReactionResult } from "@/lib/types";

export function generatePDF(
  project: ProjectData,
  spanResults: SpanResult[],
  reactions: ReactionResult[]
): jsPDF {
  const doc = new jsPDF("p", "mm", "a4");
  const pageW = 210;
  let y = 20;

  const addTitle = (text: string, size = 14) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", "bold");
    doc.text(text, 14, y);
    y += size * 0.5 + 4;
  };

  const addText = (text: string, size = 10) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(text, pageW - 28);
    doc.text(lines, 14, y);
    y += lines.length * size * 0.4 + 2;
  };

  const checkPage = (needed = 30) => {
    if (y > 270 - needed) {
      doc.addPage();
      y = 20;
    }
  };

  // ── PORTADA ──
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("MEMORIA DE CÁLCULO", pageW / 2, 60, { align: "center" });
  doc.setFontSize(18);
  doc.text("Viga Carrilera", pageW / 2, 72, { align: "center" });
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(project.general.projectName, pageW / 2, 90, { align: "center" });
  doc.setFontSize(10);
  doc.text(`Profesional: ${project.general.engineer || "—"}`, pageW / 2, 105, { align: "center" });
  doc.text(`Matrícula: ${project.general.license || "—"}`, pageW / 2, 112, { align: "center" });
  doc.text(`Empresa: ${project.general.company || "—"}`, pageW / 2, 119, { align: "center" });
  doc.text(`Fecha: ${project.general.date}`, pageW / 2, 126, { align: "center" });

  doc.setFontSize(9);
  doc.text("Normativa:", pageW / 2, 145, { align: "center" });
  doc.text("CIRSOC 301-2018 · CIRSOC 101-2025 · AISC 360-22 · AISC DG7-2019", pageW / 2, 152, { align: "center" });

  // ── SECCIÓN 1: DATOS GENERALES ──
  doc.addPage();
  y = 20;
  addTitle("1. DATOS GENERALES Y MATERIAL");
  y += 4;

  const mat = project.general.material;
  autoTable(doc, {
    startY: y,
    head: [["Propiedad", "Valor", "Referencia"]],
    body: [
      ["Material", mat.name, mat.norm || "—"],
      ["Fy", `${mat.Fy} MPa`, "CIRSOC 301-2018 §A3"],
      ["Fu", `${mat.Fu} MPa`, ""],
      ["E", `${mat.E} MPa`, ""],
      ["G", `${mat.G} MPa`, ""],
      ["Tipo de grúa", project.general.craneType === "top-running" ? "Puente grúa superior" : "Grúa suspendida", ""],
      ["Clase CMAA", project.general.cmaaClass, "CMAA Spec. 70"],
    ],
    margin: { left: 14 },
    styles: { fontSize: 9 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // ── SECCIÓN 2: GEOMETRÍA ──
  checkPage(50);
  addTitle("2. GEOMETRÍA Y CONDICIONES DE APOYO");
  y += 2;

  const spanData = project.spans.map((s) => [
    `V${s.index + 1}`,
    `${s.length.toFixed(1)} m`,
  ]);
  const totalL = project.spans.reduce((sum, s) => sum + s.length, 0);
  spanData.push(["TOTAL", `${totalL.toFixed(1)} m`]);

  autoTable(doc, {
    startY: y,
    head: [["Vano", "Longitud"]],
    body: spanData,
    margin: { left: 14 },
    styles: { fontSize: 9 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // Supports table
  checkPage(40);
  const supData = project.supports.map((s) => [
    `N${s.nodeIndex}`,
    s.type,
    `${s.bearingLength} mm`,
    s.stiffener,
    s.hasHinge ? "Sí" : "No",
  ]);

  autoTable(doc, {
    startY: y,
    head: [["Nodo", "Tipo apoyo", "Long. apoyo", "Rigidizador", "Articulación"]],
    body: supData,
    margin: { left: 14 },
    styles: { fontSize: 9 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // ── SECCIÓN 3: SECCIÓN TRANSVERSAL ──
  checkPage(50);
  addTitle("3. SECCIÓN TRANSVERSAL");
  y += 2;

  if (project.section) {
    const sec = project.section;
    const props = sec.props;
    autoTable(doc, {
      startY: y,
      head: [["Propiedad", "Valor", "Unidad"]],
      body: [
        ["Tipo de sección", sec.type, ""],
        ["d (altura total)", `${sec.dims.d}`, "mm"],
        ["bfs (ala sup.)", `${sec.dims.bfs}`, "mm"],
        ["tfs (ala sup.)", `${sec.dims.tfs}`, "mm"],
        ["bfi (ala inf.)", `${sec.dims.bfi}`, "mm"],
        ["tfi (ala inf.)", `${sec.dims.tfi}`, "mm"],
        ["tw (alma)", `${sec.dims.tw}`, "mm"],
        ["h (alma libre)", `${sec.dims.h}`, "mm"],
        ["A", props.A.toFixed(1), "cm²"],
        ["yc (centroide)", props.yc.toFixed(1), "mm"],
        ["Ix", props.Ix.toFixed(1), "cm⁴"],
        ["Sx+ (sup.)", props.SxTop.toFixed(1), "cm³"],
        ["Sx- (inf.)", props.SxBot.toFixed(1), "cm³"],
        ["Zx", props.Zx.toFixed(1), "cm³"],
        ["Iy_eff (LTB)", props.Iy_eff.toFixed(1), "cm⁴"],
        ["J", props.J.toFixed(2), "cm⁴"],
        ["Cw", props.Cw.toFixed(0), "cm⁶"],
        ["Peso propio", props.wDL.toFixed(2), "kN/m"],
      ],
      margin: { left: 14 },
      styles: { fontSize: 9 },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  // ── SECCIÓN 6: VERIFICACIONES ──
  if (spanResults.length > 0) {
    doc.addPage();
    y = 20;
    addTitle("6. VERIFICACIONES LRFD POR VANO");
    y += 4;

    for (const r of spanResults) {
      checkPage(80);
      addTitle(`Vano V${r.spanIndex + 1} — L = ${r.length.toFixed(1)} m`, 12);
      y += 2;

      autoTable(doc, {
        startY: y,
        head: [["Verificación", "Demanda", "Capacidad", "Ratio", "Estado", "Referencia"]],
        body: [
          [
            "Flexión eje mayor (§F2/F4)",
            `Mux = ${r.Mux.toFixed(1)} kNm`,
            `φMnx = ${r.flexure.phiMn.toFixed(1)} kNm`,
            r.interaction.rx.toFixed(3),
            r.interaction.rx <= 1 ? "OK" : "NG",
            "CIRSOC 301-2018 §F2",
          ],
          [
            "Flexión eje menor (§F6)",
            `Muy = ${r.Muy.toFixed(1)} kNm`,
            `φMny = ${r.flexureMinor.phiMn.toFixed(1)} kNm`,
            r.interaction.ry.toFixed(3),
            r.interaction.ry <= 1 ? "OK" : "NG",
            "CIRSOC 301-2018 §F6",
          ],
          [
            "Interacción biaxial (§H1)",
            `η = rx + ry`,
            "≤ 1.0",
            r.interaction.eta.toFixed(3),
            r.interaction.pass ? "OK" : "NG",
            "CIRSOC 301-2018 §H1.1",
          ],
          [
            "Corte (§G2)",
            `Vu = ${r.Vu.toFixed(1)} kN`,
            `φVn = ${r.shear.phiVn.toFixed(1)} kN`,
            (r.Vu / r.shear.phiVn).toFixed(3),
            r.Vu / r.shear.phiVn <= 1 ? "OK" : "NG",
            "CIRSOC 301-2018 §G2.1",
          ],
          [
            "Deflexión vertical (§L3)",
            `δv = ${r.deflection.deltaV.toFixed(1)} mm`,
            `lím = ${r.deflection.limitV.toFixed(1)} mm`,
            r.deflection.ratioV.toFixed(3),
            r.deflection.passV ? "OK" : "NG",
            "CIRSOC 301-2018 §L3",
          ],
          [
            "Deflexión horizontal (§L3)",
            `δh = ${r.deflection.deltaH.toFixed(1)} mm`,
            `lím = ${r.deflection.limitH.toFixed(1)} mm`,
            r.deflection.ratioH.toFixed(3),
            r.deflection.passH ? "OK" : "NG",
            "CIRSOC 301-2018 §L3",
          ],
        ],
        margin: { left: 14 },
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
      });
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    }

    // ── SECCIÓN 11: REACCIONES ──
    checkPage(50);
    addTitle("11. REACCIONES EN APOYOS");

    autoTable(doc, {
      startY: y,
      head: [["Apoyo", "R_max (kN)", "R_min (kN)"]],
      body: reactions.map((r) => [
        `N${r.nodeIndex}`,
        r.Rmax.toFixed(1),
        r.Rmin.toFixed(1),
      ]),
      margin: { left: 14 },
      styles: { fontSize: 9 },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    // ── RESUMEN GLOBAL ──
    doc.addPage();
    y = 20;
    addTitle("12. RESUMEN GLOBAL");
    y += 4;

    const globalPass = spanResults.every((r) => r.status !== "fail");

    autoTable(doc, {
      startY: y,
      head: [["Vano", "η_flex", "η_corte", "δv/lím", "δh/lím", "Estado"]],
      body: spanResults.map((r) => [
        `V${r.spanIndex + 1}`,
        r.interaction.eta.toFixed(3),
        (r.Vu / r.shear.phiVn).toFixed(3),
        `${r.deflection.deltaV.toFixed(1)}/${r.deflection.limitV.toFixed(1)}`,
        `${r.deflection.deltaH.toFixed(1)}/${r.deflection.limitH.toFixed(1)}`,
        r.status === "fail" ? "✗ NG" : r.status === "warning" ? "⚠ OK" : "✓ OK",
      ]),
      margin: { left: 14 },
      styles: { fontSize: 9 },
      headStyles: { fillColor: globalPass ? [34, 197, 94] : [239, 68, 68] },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(globalPass ? 22 : 220, globalPass ? 163 : 38, globalPass ? 74 : 38);
    doc.text(
      `RESULTADO GLOBAL: ${globalPass ? "✓ VERIFICA" : "✗ NO VERIFICA"}`,
      pageW / 2,
      y + 5,
      { align: "center" }
    );
    doc.setTextColor(0, 0, 0);
  }

  // ── REFERENCIAS ──
  y += 20;
  checkPage(40);
  addTitle("REFERENCIAS NORMATIVAS", 11);
  addText("· CIRSOC 301-2018  Res. MOP 112/23 — vigente julio 2023");
  addText("· CIRSOC 101-2025  Res. SOP 11/2026 — vigente enero 2026");
  addText("· AISC 360-22  ANSI/AISC 360-22");
  addText("· AISC DG7-2019  3ra edición — Industrial Building Design");

  return doc;
}
