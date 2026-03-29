"use client";

import { useMemo } from "react";
import { useProjectStore } from "@/store/projectStore";
import { makePattern } from "@/lib/calc/loads";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SummaryCard } from "@/components/results/SummaryCard";
import { AnimatedBeam } from "@/components/visualization/AnimatedBeam";
import { ReactionsBarChart } from "@/components/conceptual-graphs/ReactionsBarChart";
import { BeamSummaryView } from "@/components/conceptual-graphs/BeamSummaryView";
import { LTBCurve } from "@/components/conceptual-graphs/LTBCurve";
import { BiaxialInteraction } from "@/components/conceptual-graphs/BiaxialInteraction";
import { DeflectionGraph } from "@/components/conceptual-graphs/DeflectionGraph";
import { CompactnessGraph } from "@/components/conceptual-graphs/CompactnessGraph";

function RatioBar({ label, value, limit }: { label: string; value: number; limit?: number }) {
  const ratio = limit ? value / limit : value;
  const pct = Math.min(ratio * 100, 100);
  const color =
    ratio >= 1.0 ? "bg-red-500" :
    ratio >= 0.85 ? "bg-yellow-500" :
    ratio >= 0.50 ? "bg-green-500" :
    "bg-blue-400";
  const textColor =
    ratio >= 1.0 ? "text-red-700" :
    ratio >= 0.85 ? "text-yellow-700" :
    "text-green-700";

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-slate-500 w-14 text-right shrink-0">{label}</span>
      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-[10px] font-mono font-bold w-10 ${textColor}`}>
        {ratio.toFixed(3)}
      </span>
    </div>
  );
}

export default function ResultadosPage() {
  const {
    spanResults,
    reactions,
    envelopes,
    spans,
    supports,
    cranes,
    section,
    isCalculated,
    trainPosition,
    setTrainPosition,
  } = useProjectStore();

  // Build axle pattern for the animated beam visualization
  const axlePattern = useMemo(() => {
    if (cranes.length === 0) return [];
    const nCranes = Math.min(cranes.length, 2);
    const gapMm = cranes[0]?.minSeparation ?? 1000;
    const pattern = makePattern(cranes, nCranes, gapMm);
    return pattern.map((p) => ({
      dx: p.dx * 1000,
      Pv: p.Pv,
      Ph: p.Ph,
    }));
  }, [cranes]);

  // Flatten all envelopes
  const flatEnvelopes = useMemo(() => {
    if (envelopes.length === 0) return [];
    let cumLength = 0;
    const flat = [];
    for (let si = 0; si < envelopes.length; si++) {
      const spanEnv = envelopes[si];
      for (const e of spanEnv) {
        flat.push({
          x: e.x + cumLength,
          Mmax: e.Mmax,
          Mmin: e.Mmin,
          Vmax: e.Vmax,
          Vmin: e.Vmin,
        });
      }
      cumLength += spans[si]?.length ?? 0;
    }
    return flat;
  }, [envelopes, spans]);

  // Find the critical span (highest etaMax)
  const criticalSpan = useMemo(() => {
    if (spanResults.length === 0) return null;
    return spanResults.reduce((best, r) =>
      r.etaMax > best.etaMax ? r : best
    , spanResults[0]);
  }, [spanResults]);

  if (!isCalculated || spanResults.length === 0) {
    return (
      <div className="space-y-3">
        <Card>
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-base">Resultados</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold mb-1">Sin resultados disponibles</h3>
              <p className="text-xs text-muted-foreground max-w-md">
                Ejecute el calculo desde el Modulo 5. Asegurese de haber completado geometria, seccion y acciones.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pre-compute critical values for display
  const maxMoment = flatEnvelopes.length > 0 ? Math.max(...flatEnvelopes.map(e => e.Mmax)) : 0;
  const maxShear = flatEnvelopes.length > 0 ? Math.max(...flatEnvelopes.map(e => Math.abs(e.Vmax)), ...flatEnvelopes.map(e => Math.abs(e.Vmin))) : 0;

  return (
    <div className="space-y-2">
      {/* Summary + beam view side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* Summary card */}
        <Card>
          <CardHeader className="py-1.5 px-3">
            <CardTitle className="text-sm">Verificaciones por Vano</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-2">
            <SummaryCard results={spanResults} />
          </CardContent>
        </Card>

        {/* Verification ratios as compact progress bars */}
        {criticalSpan && (
          <Card>
            <CardHeader className="py-1.5 px-3">
              <CardTitle className="text-sm">
                Ratios - Vano Critico V{criticalSpan.spanIndex + 1}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-2 space-y-1">
              <RatioBar label="Flex. x" value={criticalSpan.interaction.rx} />
              <RatioBar label="Flex. y" value={criticalSpan.interaction.ry} />
              <RatioBar label="Interact." value={criticalSpan.interaction.eta} />
              <RatioBar label="Corte" value={criticalSpan.Vu} limit={criticalSpan.shear.phiVn} />
              <RatioBar label="Defl. V" value={criticalSpan.deflection.ratioV} />
              <RatioBar label="Defl. H" value={criticalSpan.deflection.ratioH} />

              {/* Prominent critical values */}
              <div className="grid grid-cols-3 gap-1 mt-2 pt-1 border-t">
                <div className="text-center">
                  <div className="text-[9px] text-slate-400">M_critico</div>
                  <div className="text-xs font-bold text-blue-700">{maxMoment.toFixed(1)} kNm</div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] text-slate-400">V_critico</div>
                  <div className="text-xs font-bold text-red-700">{maxShear.toFixed(1)} kN</div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] text-slate-400">eta_max</div>
                  <div className={`text-xs font-bold ${criticalSpan.etaMax >= 1.0 ? "text-red-600" : criticalSpan.etaMax >= 0.85 ? "text-yellow-600" : "text-green-600"}`}>
                    {criticalSpan.etaMax.toFixed(3)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Beam summary view */}
      <Card>
        <CardHeader className="py-1.5 px-3">
          <CardTitle className="text-sm">Vista General de Vanos</CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-2">
          <BeamSummaryView results={spanResults} width={700} height={100} />
        </CardContent>
      </Card>

      {/* Animated beam with envelope - full width, taller */}
      <Card>
        <CardHeader className="py-1.5 px-3">
          <CardTitle className="text-sm">Envolventes y Tren de Cargas</CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-2">
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
        </CardContent>
      </Card>

      {/* Reactions + Critical span detail - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* Reactions */}
        {reactions.length > 0 && (
          <Card>
            <CardHeader className="py-1.5 px-3">
              <CardTitle className="text-sm">Reacciones en Apoyos</CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-2">
              <ReactionsBarChart reactions={reactions} width={450} height={200} />
              {/* Reactions with arrows at supports */}
              <div className="mt-2 border-t pt-1">
                <div className="flex items-end justify-around">
                  {reactions.map((r, i) => (
                    <div key={i} className="text-center">
                      <svg width={40} height={50} className="mx-auto">
                        {/* Arrow pointing up */}
                        <line x1={20} y1={45} x2={20} y2={10} stroke="#3b82f6" strokeWidth={2.5} />
                        <polygon points="20,5 14,15 26,15" fill="#3b82f6" />
                        {/* Support triangle */}
                        <polygon points="20,45 12,50 28,50" fill="#64748b" stroke="#475569" strokeWidth={0.5} />
                      </svg>
                      <div className="text-[10px] font-bold text-slate-700">N{r.nodeIndex}</div>
                      <div className="text-[9px] text-blue-700 font-mono">{r.Rmax.toFixed(1)} kN</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Numerical summary compact */}
        {criticalSpan && (
          <Card>
            <CardHeader className="py-1.5 px-3">
              <CardTitle className="text-sm">
                Detalle V{criticalSpan.spanIndex + 1} (L={criticalSpan.length.toFixed(1)}m)
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-2">
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="p-1.5 bg-slate-50 rounded">
                  <span className="text-[9px] text-slate-400">Mux</span>
                  <span className="block font-bold">{criticalSpan.Mux.toFixed(1)} kNm</span>
                </div>
                <div className="p-1.5 bg-slate-50 rounded">
                  <span className="text-[9px] text-slate-400">phiMnx</span>
                  <span className="block font-bold">{criticalSpan.flexure.phiMn.toFixed(1)} kNm</span>
                </div>
                <div className="p-1.5 bg-slate-50 rounded">
                  <span className="text-[9px] text-slate-400">Muy</span>
                  <span className="block font-bold">{criticalSpan.Muy.toFixed(1)} kNm</span>
                </div>
                <div className="p-1.5 bg-slate-50 rounded">
                  <span className="text-[9px] text-slate-400">phiMny</span>
                  <span className="block font-bold">{criticalSpan.flexureMinor.phiMn.toFixed(1)} kNm</span>
                </div>
                <div className="p-1.5 bg-slate-50 rounded">
                  <span className="text-[9px] text-slate-400">Vu</span>
                  <span className="block font-bold">{criticalSpan.Vu.toFixed(1)} kN</span>
                </div>
                <div className="p-1.5 bg-slate-50 rounded">
                  <span className="text-[9px] text-slate-400">phiVn</span>
                  <span className="block font-bold">{criticalSpan.shear.phiVn.toFixed(1)} kN</span>
                </div>
                <div className="p-1.5 bg-slate-50 rounded">
                  <span className="text-[9px] text-slate-400">delta_v / lim</span>
                  <span className="block font-bold">{criticalSpan.deflection.deltaV.toFixed(1)} / {criticalSpan.deflection.limitV.toFixed(1)} mm</span>
                </div>
                <div className="p-1.5 bg-slate-50 rounded">
                  <span className="text-[9px] text-slate-400">delta_h / lim</span>
                  <span className="block font-bold">{criticalSpan.deflection.deltaH.toFixed(1)} / {criticalSpan.deflection.limitH.toFixed(1)} mm</span>
                </div>
                <div className="p-1.5 bg-slate-50 rounded">
                  <span className="text-[9px] text-slate-400">LTB Zona</span>
                  <span className="block font-bold">Zona {criticalSpan.flexure.ltbZone} <span className="text-[9px] text-slate-400">(Lb={criticalSpan.flexure.Lb.toFixed(2)}m)</span></span>
                </div>
                <div className={`p-1.5 rounded ${criticalSpan.interaction.eta >= 1.0 ? "bg-red-50" : criticalSpan.interaction.eta >= 0.85 ? "bg-yellow-50" : "bg-green-50"}`}>
                  <span className="text-[9px] text-slate-400">eta (interaccion)</span>
                  <span className={`block font-bold text-sm ${criticalSpan.interaction.eta >= 1.0 ? "text-red-600" : criticalSpan.interaction.eta >= 0.85 ? "text-yellow-600" : "text-green-600"}`}>
                    {criticalSpan.interaction.eta.toFixed(3)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Graphs - 2 column layout */}
      {criticalSpan && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {/* LTB Curve */}
          <Card>
            <CardHeader className="py-1.5 px-3">
              <CardTitle className="text-sm">Pandeo Lateral Torsional (LTB)</CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-2">
              <LTBCurve flexure={criticalSpan.flexure} width={440} height={240} />
            </CardContent>
          </Card>

          {/* Biaxial Interaction */}
          <Card>
            <CardHeader className="py-1.5 px-3">
              <CardTitle className="text-sm">Interaccion Biaxial (H1-1b)</CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-2">
              <BiaxialInteraction check={criticalSpan.interaction} width={280} height={280} />
            </CardContent>
          </Card>

          {/* Deflection */}
          <Card>
            <CardHeader className="py-1.5 px-3">
              <CardTitle className="text-sm">Verificacion de Deflexion</CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-2">
              <DeflectionGraph
                check={criticalSpan.deflection}
                spanLength={criticalSpan.length}
                width={440}
                height={160}
              />
            </CardContent>
          </Card>

          {/* Compactness */}
          {section && section.compactness && (
            <Card>
              <CardHeader className="py-1.5 px-3">
                <CardTitle className="text-sm">Compacidad (Table B4.1b)</CardTitle>
              </CardHeader>
              <CardContent className="px-2 pb-2">
                <CompactnessGraph compactness={section.compactness} width={440} height={120} />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
