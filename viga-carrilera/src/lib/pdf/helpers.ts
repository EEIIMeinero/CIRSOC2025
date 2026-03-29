// PDF helpers — shared utilities for all sections
import jsPDF from "jspdf";

export interface PdfCtx {
  doc: jsPDF;
  y: number;
  pageW: number;
  ml: number; // margin left
}

export function newCtx(doc: jsPDF): PdfCtx {
  return { doc, y: 20, pageW: 210, ml: 14 };
}

export function checkPage(ctx: PdfCtx, needed = 30): void {
  if (ctx.y > 270 - needed) {
    ctx.doc.addPage();
    ctx.y = 20;
  }
}

export function title(ctx: PdfCtx, text: string, size = 14): void {
  checkPage(ctx, size + 10);
  ctx.doc.setFontSize(size);
  ctx.doc.setFont("helvetica", "bold");
  ctx.doc.text(text, ctx.ml, ctx.y);
  ctx.y += size * 0.5 + 4;
}

export function text(ctx: PdfCtx, t: string, size = 9): void {
  ctx.doc.setFontSize(size);
  ctx.doc.setFont("helvetica", "normal");
  const lines = ctx.doc.splitTextToSize(t, ctx.pageW - ctx.ml * 2);
  checkPage(ctx, lines.length * size * 0.4 + 4);
  ctx.doc.text(lines, ctx.ml, ctx.y);
  ctx.y += lines.length * size * 0.4 + 2;
}

export function bold(ctx: PdfCtx, t: string, size = 9): void {
  ctx.doc.setFontSize(size);
  ctx.doc.setFont("helvetica", "bold");
  checkPage(ctx, size * 0.5 + 4);
  ctx.doc.text(t, ctx.ml, ctx.y);
  ctx.y += size * 0.4 + 2;
}

/** Write a formula line: "label = formula = value unit" */
export function formula(ctx: PdfCtx, line: string): void {
  text(ctx, `   ${line}`, 8);
}

export function gap(ctx: PdfCtx, mm = 4): void {
  ctx.y += mm;
}

export function newPage(ctx: PdfCtx): void {
  ctx.doc.addPage();
  ctx.y = 20;
}

export function getTableY(doc: jsPDF): number {
  return (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
}

/** Format number: fixed decimals */
export function f(n: number, d = 1): string {
  return n.toFixed(d);
}
