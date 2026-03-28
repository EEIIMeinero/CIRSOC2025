"use client";

import { useProjectStore } from "@/store/projectStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MEMORIA_SECTIONS = [
  { id: "datos", title: "Datos Generales", desc: "Proyecto, material, normativa, tipo de grua y clase CMAA" },
  { id: "geometria", title: "Geometria", desc: "Vanos, apoyos, longitudes y condiciones de borde" },
  { id: "seccion", title: "Seccion Transversal", desc: "Tipo, dimensiones, propiedades, clasificacion de compacidad" },
  { id: "cargas", title: "Cargas", desc: "Gruas, ejes de rueda, cargas por rueda, factores dinamicos, tope" },
  { id: "combinaciones", title: "Combinaciones de Carga", desc: "Combinaciones LRFD aplicadas (U1 a U5)" },
  { id: "verificaciones", title: "Verificaciones de Resistencia", desc: "Flexion mayor, flexion menor, corte, interaccion biaxial, LTB" },
  { id: "deflexiones", title: "Deflexiones", desc: "Deflexion vertical y horizontal vs. limites admisibles" },
  { id: "reacciones", title: "Reacciones en Apoyos", desc: "Reacciones maximas, minimas e instantaneas por nodo" },
  { id: "resumen", title: "Resumen", desc: "Tabla resumen con semaforo por vano y dictamen final" },
];

export default function MemoriaPage() {
  const { isCalculated, general, spans, section, cranes, spanResults } =
    useProjectStore();

  const handleGenerarPDF = () => {
    alert(
      "La generacion de PDF se implementara proximamente. Se generara un documento con todas las secciones de la memoria de calculo."
    );
  };

  const handleExportarExcel = () => {
    alert(
      "La exportacion a Excel se implementara proximamente. Se generara una planilla con los datos de entrada y resultados."
    );
  };

  if (!isCalculated || spanResults.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Memoria de Calculo</CardTitle>
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Sin resultados para generar la memoria
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Ejecute el calculo primero desde el Modulo 5. Una vez
                obtenidos los resultados, podra generar la memoria de calculo
                completa en formato PDF o exportar los datos a Excel.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado del proyecto */}
      <Card>
        <CardHeader>
          <CardTitle>Memoria de Calculo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-blue-50 p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Proyecto:</span>{" "}
                <span className="font-medium">{general.projectName}</span>
              </div>
              {general.expediente && (
                <div>
                  <span className="text-muted-foreground">Expediente:</span>{" "}
                  <span className="font-medium">{general.expediente}</span>
                </div>
              )}
              {general.engineer && (
                <div>
                  <span className="text-muted-foreground">Profesional:</span>{" "}
                  <span className="font-medium">{general.engineer}</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Material:</span>{" "}
                <span className="font-medium">{general.material.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Vanos:</span>{" "}
                <span className="font-medium">{spans.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Seccion:</span>{" "}
                <span className="font-medium">
                  {section ? `Tipo ${section.type}` : "—"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Gruas:</span>{" "}
                <span className="font-medium">{cranes.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Fecha:</span>{" "}
                <span className="font-medium">{general.date}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indice de secciones */}
      <Card>
        <CardHeader>
          <CardTitle>Contenido de la Memoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {MEMORIA_SECTIONS.map((sec, idx) => (
              <div
                key={sec.id}
                className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/30 transition-colors"
              >
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex-shrink-0">
                  {idx + 1}
                </span>
                <div>
                  <div className="font-semibold text-sm">{sec.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {sec.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vista previa resumen */}
      <Card>
        <CardHeader>
          <CardTitle>Vista Previa — Resumen de Verificaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left bg-muted/50">
                  <th className="p-2 font-medium">Vano</th>
                  <th className="p-2 font-medium">L (m)</th>
                  <th className="p-2 font-medium text-center">eta_max</th>
                  <th className="p-2 font-medium text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                {spanResults.map((r) => (
                  <tr key={r.spanIndex} className="border-b">
                    <td className="p-2 font-medium">
                      Vano {r.spanIndex + 1}
                    </td>
                    <td className="p-2">{r.length.toFixed(2)}</td>
                    <td className="p-2 text-center">
                      <span className="font-medium">
                        {r.etaMax.toFixed(3)}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          r.status === "ok"
                            ? "bg-green-100 text-green-800"
                            : r.status === "warning"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {r.status === "ok"
                          ? "OK"
                          : r.status === "warning"
                          ? "Ajustado"
                          : "NO VERIFICA"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Botones de exportacion */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              onClick={handleGenerarPDF}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              Generar PDF
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleExportarExcel}
              className="px-8"
            >
              Exportar Excel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
