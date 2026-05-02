"use client";

import { useMemo } from "react";
import { useProjectStore } from "@/store/projectStore";
import { makePattern } from "@/lib/calc/loads";
import { VerifCard, PropCard, Panel, Badge } from "@/components/blueprint";
import { SummaryCard } from "@/components/results/SummaryCard";
import { AnimatedBeam } from "@/components/visualization/AnimatedBeam";
import { ReactionsBarChart } from "@/components/conceptual-graphs/ReactionsBarChart";
import { BeamSummaryView } from "@/components/conceptual-graphs/BeamSummaryView";
import { LTBCurve } from "@/components/conceptual-graphs/LTBCurve";
import { BiaxialInteraction } from "@/components/conceptual-graphs/BiaxialInteraction";
import { DeflectionGraph } from "@/components/conceptual-graphs/DeflectionGraph";
import { CompactnessGraph } from "@/components/conceptual-graphs/CompactnessGraph";

export default function ResultadosPage() {
  const {
    spanResults, reactions, envelopes, spans, supports, cranes, section,
    isCalculated, trainPosition, setTrainPosition, general,
  } = useProjectStore();

  const axlePattern = useMemo(() => {
    if (cranes.length === 0) return [];
    const nCranes = Math.min(cranes.length, 2);
    const gapMm = cranes[0]?.minSeparation ?? 1000;
    const pattern = makePattern(cranes, nCranes, gapMm);
    return pattern.map((p) => ({ dx: p.dx * 1000, Pv: p.Pv, Ph: p.Ph }));
  }, [cranes]);

  const flatEnvelopes = useMemo(() => {
    if (envelopes.length === 0) return [];
    let cumLength = 0;
    const flat = [];
    for (let si = 0; si < envelopes.length; si++) {
      const spanEnv = envelopes[si];
      for (const e of spanEnv) {
        flat.push({ x: e.x + cumLength, Mmax: e.Mmax, Mmin: e.Mmin, Vmax: e.Vmax, Vmin: e.Vmin });
      }
      cumLength += spans[si]?.length ?? 0;
    }
    return flat;
  }, [envelopes, spans]);

  const criticalSpan = useMemo(() => {
    if (spanResults.length === 0) return null;
    return spanResults.reduce((best, r) => r.etaMax > best.etaMax ? r : best, spanResults[0]);
  }, [spanResults]);

  if (!isCalculated || spanResults.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        <div className="text-center">
          <div className="text-5xl mb-3 opacity-30">⊞</div>
          <div className="text-sm font-semibold text-slate-400">
            Sin resultados disponibles
          </div>
          <div className="text-xs text-slate-600 mt-1 mono">
            Ejecute el calculo desde el Modulo 5 (CIRSOC 301-2018)
          </div>
        </div>
      </div>
    );
  }

  const overallPass = spanResults.every((r) => r.status !== "fail");
  const overallWarn = spanResults.some((r) => r.status === "warning");
  const maxMoment = flatEnvelopes.length > 0 ? Math.max(...flatEnvelopes.map((e) => e.Mmax)) : 0;
  const maxShear = flatEnvelopes.length > 0
    ? Math.max(...flatEnvelopes.map((e) => Math.abs(e.Vmax)), ...flatEnvelopes.map((e) => Math.abs(e.Vmin)))
    : 0;

  return (
    <div className="space-y-3">
      {/* ─── Resultado global hero ─────────────────────────────────────── */}
      <div className={`rounded-lg border-2 px-4 py-3 flex items-center justify-between ${
        overallPass
          ? overallWarn ? "border-amber-700 bg-amber-950/40" : "border-green-700 bg-green-950/40"
          : "border-red-700 bg-red-950/40"
      }`}>
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-widest">Resultado General</div>
          <div className="text-base font-bold text-white mt-0.5">
            {section?.profileName ?? `Tipo ${section?.type}`} · {spans.length} vano{spans.length > 1 ? "s" : ""}
          </div>
          <div className="text-xs text-slate-500 mono">
            {general.material.name} Fy={general.material.Fy}MPa · CMAA {general.cmaaClass} ·{" "}
            {cranes.length} grua{cranes.length !== 1 ? "s" : ""}
          </div>
        </div>
        <div className="text-2xl font-black tracking-wider">
          {overallPass ? (
            overallWarn
              ? <span className="text-amber-400">⚠ AJUSTADO</span>
              : <span className="text-green-400">✓ VERIFICA</span>
          ) : (
            <span className="text-red-400">✗ NO VERIFICA</span>
          )}
        </div>
      </div>

      {/* ─── Verificaciones del vano critico (VerifCard grid) ──────────── */}
      {criticalSpan && (
        <Panel title={`Vano Critico V${criticalSpan.spanIndex + 1} (L=${criticalSpan.length.toFixed(2)} m) — Verificaciones LRFD`}>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            <VerifCard
              title="Flexion Eje Mayor"
              subtitle={`§F2/F4 · LTB Zona ${criticalSpan.flexure.ltbZone}`}
              value={criticalSpan.Mux.toFixed(1)}
              unit="kNm (Mux)"
              capacity={criticalSpan.flexure.phiMn.toFixed(1)}
              capUnit="kNm (φMnx)"
              dcr={criticalSpan.interaction.rx}
              passes={criticalSpan.interaction.rx <= 1.0}
            />
            <VerifCard
              title="Flexion Eje Menor"
              subtitle="§F6 · sin LTB"
              value={criticalSpan.Muy.toFixed(1)}
              unit="kNm (Muy)"
              capacity={criticalSpan.flexureMinor.phiMn.toFixed(1)}
              capUnit="kNm (φMny)"
              dcr={criticalSpan.interaction.ry}
              passes={criticalSpan.interaction.ry <= 1.0}
            />
            <VerifCard
              title="Interaccion Biaxial"
              subtitle="§H1.1 · η = rx + ry"
              value={criticalSpan.interaction.eta.toFixed(3)}
              unit=""
              capacity="1.000"
              capUnit="(limite)"
              dcr={criticalSpan.interaction.eta}
              passes={criticalSpan.interaction.pass}
            />
            <VerifCard
              title="Corte"
              subtitle="§G2.1"
              value={criticalSpan.Vu.toFixed(1)}
              unit="kN (Vu)"
              capacity={criticalSpan.shear.phiVn.toFixed(1)}
              capUnit="kN (φVn)"
              dcr={criticalSpan.shear.phiVn > 0 ? criticalSpan.Vu / criticalSpan.shear.phiVn : 0}
              passes={criticalSpan.Vu <= criticalSpan.shear.phiVn}
            />
            <VerifCard
              title="Deflexion Vertical"
              subtitle={`§L3 · L/${(criticalSpan.length * 1000 / criticalSpan.deflection.limitV).toFixed(0)}`}
              value={criticalSpan.deflection.deltaV.toFixed(2)}
              unit="mm (δv)"
              capacity={criticalSpan.deflection.limitV.toFixed(2)}
              capUnit="mm (lim)"
              dcr={criticalSpan.deflection.ratioV}
              passes={criticalSpan.deflection.passV}
            />
            <VerifCard
              title="Deflexion Horizontal"
              subtitle={`§L3 · L/${(criticalSpan.length * 1000 / criticalSpan.deflection.limitH).toFixed(0)}`}
              value={criticalSpan.deflection.deltaH.toFixed(2)}
              unit="mm (δh)"
              capacity={criticalSpan.deflection.limitH.toFixed(2)}
              capUnit="mm (lim)"
              dcr={criticalSpan.deflection.ratioH}
              passes={criticalSpan.deflection.passH}
            />
          </div>
        </Panel>
      )}

      {/* ─── Detalle de propiedades del calculo ────────────────────────── */}
      {criticalSpan && (
        <Panel title="Detalle Numerico — Vano Critico">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
            <PropCard label="Mp" value={criticalSpan.flexure.Mp.toFixed(1)} unit="kNm" />
            <PropCard label="Lp" value={criticalSpan.flexure.Lp.toFixed(3)} unit="m" />
            <PropCard label="Lr" value={criticalSpan.flexure.Lr.toFixed(3)} unit="m" />
            <PropCard label="Lb" value={criticalSpan.flexure.Lb.toFixed(3)} unit="m" />
            <PropCard label="Cb" value={criticalSpan.flexure.Cb.toFixed(2)} />
            <PropCard label="Mn" value={criticalSpan.flexure.Mn.toFixed(1)} unit="kNm" />
            <PropCard label="Aw" value={criticalSpan.shear.Aw.toFixed(2)} unit="cm²" />
            <PropCard label="Cv1" value={criticalSpan.shear.Cv1.toFixed(3)} />
            <PropCard label="Vn" value={criticalSpan.shear.Vn.toFixed(1)} unit="kN" />
            <PropCard label="rx" value={criticalSpan.interaction.rx.toFixed(4)} />
            <PropCard label="ry" value={criticalSpan.interaction.ry.toFixed(4)} />
            <PropCard label="η_max" value={criticalSpan.etaMax.toFixed(4)} />
          </div>
        </Panel>
      )}

      {/* ─── Resumen de todos los vanos ────────────────────────────────── */}
      <Panel title="Resumen por Vano">
        <SummaryCard results={spanResults} />
      </Panel>

      {/* ─── Vista general de vanos ────────────────────────────────────── */}
      <Panel title="Vista General de Vanos">
        <div className="flex justify-center">
          <BeamSummaryView results={spanResults} width={700} height={100} />
        </div>
      </Panel>

      {/* ─── Envolventes y tren ────────────────────────────────────────── */}
      <Panel title="Envolventes M, V y Tren de Cargas">
        <AnimatedBeam
          spans={spans}
          supports={supports}
          envelopes={flatEnvelopes}
          axlePattern={axlePattern}
          trainPosition={trainPosition}
          onPositionChange={setTrainPosition}
          width={960}
          height={560}
        />
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          <PropCard label="M_max envolvente" value={maxMoment.toFixed(1)} unit="kNm" />
          <PropCard label="V_max envolvente" value={maxShear.toFixed(1)} unit="kN" />
          <PropCard label="Posicion tren" value={trainPosition.toFixed(2)} unit="m" />
        </div>
      </Panel>

      {/* ─── Reacciones ────────────────────────────────────────────────── */}
      {reactions.length > 0 && (
        <Panel title="Reacciones en Apoyos">
          <ReactionsBarChart reactions={reactions} width={450} height={200} />
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-1.5">
            {reactions.map((r) => (
              <div key={r.nodeIndex} className="bg-slate-800/50 rounded p-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 mono">N{r.nodeIndex}</span>
                  <Badge passes={true} label="APOYO" />
                </div>
                <div className="mt-1 mono text-xs text-slate-300">
                  R<sub>max</sub>: <span className="text-blue-300 font-bold">{r.Rmax.toFixed(1)}</span> kN
                </div>
                <div className="mono text-xs text-slate-500">
                  R<sub>min</sub>: {r.Rmin.toFixed(1)} kN
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* ─── Graficos conceptuales ────────────────────────────────────── */}
      {criticalSpan && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <Panel title="Pandeo Lateral Torsional (LTB)">
            <LTBCurve flexure={criticalSpan.flexure} width={440} height={240} />
          </Panel>
          <Panel title="Interaccion Biaxial (Ec. H1-1b)">
            <BiaxialInteraction check={criticalSpan.interaction} width={280} height={280} />
          </Panel>
          <Panel title="Verificacion de Deflexion">
            <DeflectionGraph
              check={criticalSpan.deflection}
              spanLength={criticalSpan.length}
              width={440}
              height={160}
            />
          </Panel>
          {section && section.compactness && (
            <Panel title="Compacidad (Tabla B4.1b)">
              <CompactnessGraph compactness={section.compactness} width={440} height={120} />
            </Panel>
          )}
        </div>
      )}
    </div>
  );
}
