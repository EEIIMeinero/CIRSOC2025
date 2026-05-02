import type { PdfCtx } from "./helpers";
import { title, text, bold, formula, gap, newPage, f, checkPage } from "./helpers";
import type { SpanResult, ProjectData } from "@/lib/types";

export function writeVerificaciones(ctx: PdfCtx, p: ProjectData, results: SpanResult[]): void {
  const sec = p.section;
  if (!sec) return;
  const pr = sec.props;
  const d = sec.dims;
  const Fy = p.general.material.Fy;
  const E = p.general.material.E;
  const isMono = sec.type === "C";

  for (const r of results) {
    newPage(ctx);
    title(ctx, `6. VERIFICACIONES LRFD — VANO V${r.spanIndex + 1} (L = ${f(r.length, 2)} m)`);

    // ── 6.1 Solicitaciones de diseno ──
    bold(ctx, "6.1 Solicitaciones de diseno (envolvente mayorada)");
    formula(ctx, `Mux = ${f(r.Mux)} kNm  (momento mayorado eje fuerte)`);
    formula(ctx, `Muy = ${f(r.Muy)} kNm  (momento mayorado eje menor)`);
    formula(ctx, `Vu  = ${f(r.Vu)} kN   (corte mayorado)`);
    gap(ctx);

    // ── 6.2 Flexion eje mayor — CIRSOC 301-2018 §F2/F4 ──
    bold(ctx, `6.2 Flexion eje mayor — CIRSOC 301-2018 ${isMono ? "\u00A7F4" : "\u00A7F2"}`);
    text(ctx, `Seccion ${isMono ? "monosimetrica" : "doblemente simetrica"}, phi_b = 0.90`);
    gap(ctx, 2);

    // Mp
    bold(ctx, "Momento plastico Mp:");
    formula(ctx, `Mp = Fy * Zx = ${Fy} * ${f(pr.Zx)} / 1000 = ${f(r.flexure.Mp)} kNm   [Ec. F2-1]`);
    gap(ctx, 2);

    // ho
    const ho = d.d - d.tfs / 2 - d.tfi / 2;
    formula(ctx, `ho = d - tfs/2 - tfi/2 = ${f(d.d)} - ${f(d.tfs)}/2 - ${f(d.tfi)}/2 = ${f(ho)} mm`);

    // Lp
    bold(ctx, "Longitud limite Lp (pandeo inelastico):");
    formula(ctx, `Lp = 1.76 * iy,eff * sqrt(E/Fy)   [Ec. F2-5]`);
    formula(ctx, `   = 1.76 * ${f(pr.iy_eff)} * sqrt(${E}/${Fy}) / 1000`);
    formula(ctx, `   = ${f(r.flexure.Lp, 3)} m`);
    gap(ctx, 2);

    // Lr
    bold(ctx, "Longitud limite Lr (pandeo elastico):");
    formula(ctx, `Lr = 1.95 * rts * (E/(0.7*Fy)) * sqrt(J*c/(Sx*ho) + sqrt((J*c/(Sx*ho))^2 + 6.76*(0.7*Fy/E)^2))   [Ec. F2-6]`);
    formula(ctx, `rts = ${f(pr.rts)} mm   [Ec. F2-7: rts = (Iy*Cw/Sx^2)^(1/4)]`);
    formula(ctx, `Lr = ${f(r.flexure.Lr, 3)} m`);
    gap(ctx, 2);

    // Zone determination
    const Lb = r.flexure.Lb;
    const Cb = r.flexure.Cb;
    bold(ctx, "Determinacion de zona de pandeo:");
    formula(ctx, `Lb = ${f(Lb, 3)} m  (longitud no arriostrada)`);
    formula(ctx, `Cb = ${f(Cb, 2)}  (factor de momento no uniforme)`);

    if (r.flexure.ltbZone === 1) {
      formula(ctx, `Lb = ${f(Lb,3)} <= Lp = ${f(r.flexure.Lp,3)} => ZONA 1: Fluencia (no hay LTB)`);
      formula(ctx, `Mn = Mp = ${f(r.flexure.Mp)} kNm   [Ec. F2-1]`);
    } else if (r.flexure.ltbZone === 2) {
      formula(ctx, `Lp = ${f(r.flexure.Lp,3)} < Lb = ${f(Lb,3)} <= Lr = ${f(r.flexure.Lr,3)} => ZONA 2: LTB inelastico`);
      formula(ctx, `Mn = Cb * [Mp - (Mp - 0.7*Fy*Sx)*(Lb-Lp)/(Lr-Lp)] <= Mp   [Ec. F2-2]`);
      formula(ctx, `Mn = ${f(r.flexure.Mn)} kNm`);
    } else {
      formula(ctx, `Lb = ${f(Lb,3)} > Lr = ${f(r.flexure.Lr,3)} => ZONA 3: LTB elastico`);
      formula(ctx, `Fcr = (Cb*pi^2*E/(Lb/rts)^2) * sqrt(1 + 0.078*J*c/(Sx*ho)*(Lb/rts)^2)   [Ec. F2-3/F2-4]`);
      formula(ctx, `Mn = Fcr * Sx = ${f(r.flexure.Mn)} kNm`);
    }

    formula(ctx, `phi*Mnx = 0.90 * ${f(r.flexure.Mn)} = ${f(r.flexure.phiMn)} kNm`);
    const statusFlex = r.Mux <= r.flexure.phiMn ? "OK" : "NO VERIFICA";
    formula(ctx, `Mux = ${f(r.Mux)} ${r.Mux <= r.flexure.phiMn ? "<=" : ">"} phi*Mnx = ${f(r.flexure.phiMn)} => ${statusFlex}`);
    gap(ctx);

    // ── 6.3 Flexion eje menor — §F6 ──
    checkPage(ctx, 50);
    bold(ctx, "6.3 Flexion eje menor — CIRSOC 301-2018 \u00A7F6");
    text(ctx, "No aplica pandeo lateral torsional para flexion sobre eje menor.");

    const Sy = (d.tfs * d.bfs ** 2) / 6 / 1e3;
    const Zy = (d.tfs * d.bfs ** 2) / 4 / 1e3;
    formula(ctx, `Sy = tfs * bfs^2 / 6 = ${f(d.tfs)} * ${f(d.bfs)}^2 / 6 / 1000 = ${f(Sy)} cm3`);
    formula(ctx, `Zy = tfs * bfs^2 / 4 = ${f(d.tfs)} * ${f(d.bfs)}^2 / 4 / 1000 = ${f(Zy)} cm3`);
    formula(ctx, `Mn,y = min(Fy*Zy, 1.6*Fy*Sy) / 1000   [Ec. F6-1]`);
    formula(ctx, `     = min(${Fy}*${f(Zy)}, 1.6*${Fy}*${f(Sy)}) / 1000 = ${f(r.flexureMinor.Mn)} kNm`);
    formula(ctx, `phi*Mny = 0.90 * ${f(r.flexureMinor.Mn)} = ${f(r.flexureMinor.phiMn)} kNm`);
    gap(ctx);

    // ── 6.4 Corte — §G2.1 ──
    checkPage(ctx, 60);
    bold(ctx, "6.4 Corte — CIRSOC 301-2018 \u00A7G2.1");
    formula(ctx, `Aw = d * tw = ${f(d.d)} * ${f(d.tw)} = ${f(d.d * d.tw / 100, 1)} cm2`);

    const lambdaW = d.h / d.tw;
    const limit224 = 2.24 * Math.sqrt(E / Fy);
    formula(ctx, `h/tw = ${f(d.h)} / ${f(d.tw)} = ${f(lambdaW, 2)}`);
    formula(ctx, `2.24*sqrt(E/Fy) = 2.24*sqrt(${E}/${Fy}) = ${f(limit224, 2)}`);

    if (lambdaW <= limit224) {
      formula(ctx, `h/tw = ${f(lambdaW,2)} <= ${f(limit224,2)} => Cv1 = 1.0, phi_v = ${sec.type === "A" ? "1.00" : "0.90"}   [Ec. G2-2]`);
    } else {
      formula(ctx, `h/tw = ${f(lambdaW,2)} > ${f(limit224,2)} => Verificar con kv=5.34   [Ec. G2-3/G2-4]`);
      formula(ctx, `Cv1 = ${f(r.shear.Cv1, 3)}`);
    }

    formula(ctx, `Vn = 0.6 * Fy * Aw * Cv1 = 0.6 * ${Fy} * ${f(r.shear.Aw)} * ${f(r.shear.Cv1,3)} / 1000   [Ec. G2-1]`);
    formula(ctx, `   = ${f(r.shear.Vn)} kN`);
    formula(ctx, `phi*Vn = ${f(r.shear.phiVn)} kN`);
    const statusShear = r.Vu <= r.shear.phiVn ? "OK" : "NO VERIFICA";
    formula(ctx, `Vu = ${f(r.Vu)} ${r.Vu <= r.shear.phiVn ? "<=" : ">"} phi*Vn = ${f(r.shear.phiVn)} => ${statusShear}`);
    gap(ctx);

    // ── 6.5 Interaccion biaxial — §H1.1 ──
    checkPage(ctx, 50);
    bold(ctx, "6.5 Interaccion biaxial — CIRSOC 301-2018 \u00A7H1.1");
    text(ctx, "Para vigas sin carga axial significativa (Pu/phi*Pn ~ 0):");
    formula(ctx, `eta = Mux/(phi*Mnx) + Muy/(phi*Mny) <= 1.0   [Ec. H1-1b]`);
    formula(ctx, `rx = Mux/(phi*Mnx) = ${f(r.Mux)} / ${f(r.flexure.phiMn)} = ${f(r.interaction.rx, 4)}`);
    formula(ctx, `ry = Muy/(phi*Mny) = ${f(r.Muy)} / ${f(r.flexureMinor.phiMn)} = ${f(r.interaction.ry, 4)}`);
    formula(ctx, `eta = rx + ry = ${f(r.interaction.rx, 4)} + ${f(r.interaction.ry, 4)} = ${f(r.interaction.eta, 4)}`);
    const statusInt = r.interaction.pass ? "OK" : "NO VERIFICA";
    formula(ctx, `eta = ${f(r.interaction.eta, 4)} ${r.interaction.pass ? "<=" : ">"} 1.000 => ${statusInt}`);
    gap(ctx);

    // ── 6.6 Deflexion — §L3 ──
    checkPage(ctx, 60);
    bold(ctx, "6.6 Deflexion — CIRSOC 301-2018 \u00A7L3 (servicio)");
    text(ctx, "Viga simplemente apoyada con carga concentrada movil:");
    formula(ctx, `delta = P * a * (L^2 - a^2)^(3/2) / (9*sqrt(3)*E*I*L)`);
    gap(ctx, 2);

    bold(ctx, "Deflexion vertical:");
    formula(ctx, `delta_v = ${f(r.deflection.deltaV, 2)} mm`);
    formula(ctx, `Limite = L/${p.settings.deflLimitV} = ${f(r.length * 1000)}/${p.settings.deflLimitV} = ${f(r.deflection.limitV, 2)} mm`);
    const statusDV = r.deflection.passV ? "OK" : "NO VERIFICA";
    formula(ctx, `delta_v = ${f(r.deflection.deltaV, 2)} ${r.deflection.passV ? "<=" : ">"} ${f(r.deflection.limitV, 2)} => ${statusDV}`);
    gap(ctx, 2);

    bold(ctx, "Deflexion horizontal:");
    formula(ctx, `delta_h = ${f(r.deflection.deltaH, 2)} mm`);
    formula(ctx, `Limite = L/${p.settings.deflLimitH} = ${f(r.length * 1000)}/${p.settings.deflLimitH} = ${f(r.deflection.limitH, 2)} mm`);
    const statusDH = r.deflection.passH ? "OK" : "NO VERIFICA";
    formula(ctx, `delta_h = ${f(r.deflection.deltaH, 2)} ${r.deflection.passH ? "<=" : ">"} ${f(r.deflection.limitH, 2)} => ${statusDH}`);
  }
}
