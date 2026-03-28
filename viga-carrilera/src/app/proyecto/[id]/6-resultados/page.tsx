"use client";

import { useProjectStore } from "@/store/projectStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function getStatusColor(eta: number): string {
  if (eta > 1.0) return "bg-red-500";
  if (eta >= 0.85) return "bg-yellow-500";
  return "bg-green-500";
}

function getStatusBg(eta: number): string {
  if (eta > 1.0) return "bg-red-50";
  if (eta >= 0.85) return "bg-yellow-50";
  return "bg-green-50";
}

function getStatusText(status: "ok" | "warning" | "fail"): string {
  switch (status) {
    case "ok":
      return "OK";
    case "warning":
      return "Ajustado";
    case "fail":
      return "NO VERIFICA";
  }
}

export default function ResultadosPage() {
  const { spanResults, isCalculated } = useProjectStore();

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
      {/* Resumen por vano */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Verificaciones por Vano</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left bg-muted/50">
                  <th className="p-3 font-medium">Vano</th>
                  <th className="p-3 font-medium">L (m)</th>
                  <th className="p-3 font-medium text-center">eta_flex</th>
                  <th className="p-3 font-medium text-center">eta_corte</th>
                  <th className="p-3 font-medium text-center">delta_v / lim</th>
                  <th className="p-3 font-medium text-center">delta_h / lim</th>
                  <th className="p-3 font-medium text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                {spanResults.map((result) => {
                  const etaFlex = result.interaction.eta;
                  const etaShear = result.Vu / result.shear.phiVn;
                  const ratioV = result.deflection.ratioV;
                  const ratioH = result.deflection.ratioH;
                  const maxEta = result.etaMax;

                  return (
                    <tr
                      key={result.spanIndex}
                      className={`border-b ${getStatusBg(maxEta)}`}
                    >
                      <td className="p-3 font-medium">
                        Vano {result.spanIndex + 1}
                      </td>
                      <td className="p-3">{result.length.toFixed(2)}</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div
                            className={`h-2.5 w-2.5 rounded-full ${getStatusColor(etaFlex)}`}
                          />
                          <span className="font-medium">
                            {etaFlex.toFixed(3)}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div
                            className={`h-2.5 w-2.5 rounded-full ${getStatusColor(etaShear)}`}
                          />
                          <span className="font-medium">
                            {etaShear.toFixed(3)}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div
                            className={`h-2.5 w-2.5 rounded-full ${getStatusColor(ratioV)}`}
                          />
                          <span className="font-medium">
                            {result.deflection.deltaV.toFixed(2)} /{" "}
                            {result.deflection.limitV.toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div
                            className={`h-2.5 w-2.5 rounded-full ${getStatusColor(ratioH)}`}
                          />
                          <span className="font-medium">
                            {result.deflection.deltaH.toFixed(2)} /{" "}
                            {result.deflection.limitH.toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            result.status === "ok"
                              ? "bg-green-100 text-green-800"
                              : result.status === "warning"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {getStatusText(result.status)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Vista animada de la viga (placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>Vista de la Viga</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-blue-300 bg-blue-50/50 p-12 text-center">
            <p className="text-sm text-muted-foreground">
              Vista animada de la viga con posicion del tren de cargas.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              (Proximamente)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Graficos conceptuales (placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>Diagramas de Envolventes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-dashed border-blue-300 bg-blue-50/50 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Envolvente de Momentos Mx
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                (Proximamente)
              </p>
            </div>
            <div className="rounded-lg border border-dashed border-blue-300 bg-blue-50/50 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Envolvente de Cortante Vy
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                (Proximamente)
              </p>
            </div>
            <div className="rounded-lg border border-dashed border-blue-300 bg-blue-50/50 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Deflexiones verticales
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                (Proximamente)
              </p>
            </div>
            <div className="rounded-lg border border-dashed border-blue-300 bg-blue-50/50 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Deflexiones horizontales
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                (Proximamente)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
