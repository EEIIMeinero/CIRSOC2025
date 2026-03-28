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
    // Convert to mm for the AnimatedBeam component
    return pattern.map((p) => ({
      dx: p.dx * 1000, // m -> mm
      Pv: p.Pv,
      Ph: p.Ph,
    }));
  }, [cranes]);

  // Flatten all envelopes into a single array for the animated beam
  // (the AnimatedBeam expects a single continuous array with x adjusted per span)
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
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Resultados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <svg
                  className="h-8 w-8 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Sin resultados disponibles
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Ejecute el calculo primero desde el Modulo 5 —
                Configuracion del Calculo. Asegurese de haber completado los
                datos de geometria, seccion y acciones.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary card with table and global result */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Verificaciones por Vano</CardTitle>
        </CardHeader>
        <CardContent>
          <SummaryCard results={spanResults} />
        </CardContent>
      </Card>

      {/* Visual beam summary (colored spans) */}
      <Card>
        <CardHeader>
          <CardTitle>Vista General de Vanos</CardTitle>
        </CardHeader>
        <CardContent>
          <BeamSummaryView results={spanResults} width={700} height={150} />
        </CardContent>
      </Card>

      {/* Animated beam with envelope overlay */}
      <Card>
        <CardHeader>
          <CardTitle>Vista de la Viga — Envolventes y Tren de Cargas</CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatedBeam
            spans={spans}
            supports={supports}
            envelopes={flatEnvelopes}
            axlePattern={axlePattern}
            trainPosition={trainPosition}
            onPositionChange={setTrainPosition}
            width={900}
            height={500}
          />
        </CardContent>
      </Card>

      {/* Reactions bar chart */}
      {reactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Reacciones en Apoyos</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactionsBarChart reactions={reactions} width={600} height={280} />
          </CardContent>
        </Card>
      )}

      {/* Critical span detail */}
      {criticalSpan && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>
                Vano Critico — V{criticalSpan.spanIndex + 1} (L = {criticalSpan.length.toFixed(1)} m)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LTB Curve */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">
                    Curva de Pandeo Lateral Torsional (LTB)
                  </h3>
                  <LTBCurve flexure={criticalSpan.flexure} width={450} height={280} />
                </div>

                {/* Biaxial Interaction */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">
                    Interaccion Biaxial (H1-1b)
                  </h3>
                  <BiaxialInteraction check={criticalSpan.interaction} width={300} height={300} />
                </div>

                {/* Deflection */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">
                    Verificacion de Deflexion
                  </h3>
                  <DeflectionGraph
                    check={criticalSpan.deflection}
                    spanLength={criticalSpan.length}
                    width={450}
                    height={180}
                  />
                </div>

                {/* Compactness */}
                {section && section.compactness && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">
                      Clasificacion por Compacidad (Table B4.1b)
                    </h3>
                    <CompactnessGraph compactness={section.compactness} width={450} height={140} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Detailed numerical summary for critical span */}
          <Card>
            <CardHeader>
              <CardTitle>Detalle Numerico — Vano Critico V{criticalSpan.spanIndex + 1}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Mux (kNm)</p>
                  <p className="text-lg font-bold">{criticalSpan.Mux.toFixed(1)}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">phiMnx (kNm)</p>
                  <p className="text-lg font-bold">{criticalSpan.flexure.phiMn.toFixed(1)}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Muy (kNm)</p>
                  <p className="text-lg font-bold">{criticalSpan.Muy.toFixed(1)}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">phiMny (kNm)</p>
                  <p className="text-lg font-bold">{criticalSpan.flexureMinor.phiMn.toFixed(1)}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Vu (kN)</p>
                  <p className="text-lg font-bold">{criticalSpan.Vu.toFixed(1)}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">phiVn (kN)</p>
                  <p className="text-lg font-bold">{criticalSpan.shear.phiVn.toFixed(1)}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">eta (interaccion)</p>
                  <p className={`text-lg font-bold ${criticalSpan.interaction.eta >= 1.0 ? "text-red-600" : criticalSpan.interaction.eta >= 0.85 ? "text-yellow-600" : "text-green-600"}`}>
                    {criticalSpan.interaction.eta.toFixed(3)}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">LTB Zona</p>
                  <p className="text-lg font-bold">
                    Zona {criticalSpan.flexure.ltbZone}
                    <span className="text-xs text-slate-400 ml-1">
                      (Lb={criticalSpan.flexure.Lb.toFixed(2)}m)
                    </span>
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">delta_v (mm)</p>
                  <p className="text-lg font-bold">
                    {criticalSpan.deflection.deltaV.toFixed(1)}
                    <span className="text-xs text-slate-400 ml-1">
                      / {criticalSpan.deflection.limitV.toFixed(1)}
                    </span>
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">delta_h (mm)</p>
                  <p className="text-lg font-bold">
                    {criticalSpan.deflection.deltaH.toFixed(1)}
                    <span className="text-xs text-slate-400 ml-1">
                      / {criticalSpan.deflection.limitH.toFixed(1)}
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
