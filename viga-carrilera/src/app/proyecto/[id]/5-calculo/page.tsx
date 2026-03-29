"use client";

import { useState } from "react";
import { useProjectStore } from "@/store/projectStore";
import { runAnalysis, suggestResize, type ResizeSuggestion } from "@/lib/calc/engine";
import type { ProjectData } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CalculoPage() {
  const store = useProjectStore();
  const { settings, setSettings, isCalculated } = store;
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<ResizeSuggestion | null>(null);
  const [applyingResize, setApplyingResize] = useState(false);

  const handleCalcular = () => {
    setError(null);
    setSuccessMsg(null);
    setSuggestion(null);

    // Validate that a section has been defined
    if (!store.section) {
      setError("Defina la seccion transversal primero (Modulo 3).");
      return;
    }

    // Validate section properties
    if (!store.section.props || store.section.props.Ix === 0 || store.section.props.Zx === 0) {
      setError("Las propiedades de la seccion son invalidas. Revise el Modulo 3.");
      return;
    }

    // Validate spans
    if (store.spans.length === 0 || store.spans.some((s) => s.length <= 0)) {
      setError("Defina al menos un vano con longitud positiva (Modulo 2).");
      return;
    }

    // Build ProjectData from the store
    const project: ProjectData = {
      general: store.general,
      spans: store.spans,
      supports: store.supports,
      stiffeners: store.stiffeners,
      section: store.section,
      rail: store.rail,
      cranes: store.cranes,
      buffer: store.buffer,
      settings: store.settings,
    };

    try {
      const results = runAnalysis(project);

      if (results.spanResults.length === 0) {
        setError("El calculo no produjo resultados. Verifique los datos de entrada.");
        return;
      }

      store.setResults({
        spanResults: results.spanResults,
        reactions: results.reactions,
        envelopes: results.envelopes,
      });

      const allPass = results.spanResults.every((r) => r.status !== "fail");
      const maxEta = Math.max(...results.spanResults.map((r) => r.etaMax));
      setSuccessMsg(
        allPass
          ? `Calculo completado. Todos los vanos verifican (eta_max = ${maxEta.toFixed(3)}).`
          : `Calculo completado. Algunos vanos NO verifican (eta_max = ${maxEta.toFixed(3)}). Revise los resultados.`
      );

      // Auto-suggest resize
      const resizeSuggestion = suggestResize(project, maxEta);
      if (resizeSuggestion) {
        setSuggestion(resizeSuggestion);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido durante el calculo.";
      setError(`Error en el calculo: ${msg}`);
    }
  };

  const handleApplySuggestion = () => {
    if (!suggestion) return;
    setApplyingResize(true);
    store.setSection(suggestion.section);
    setSuggestion(null);
    // Re-run calculation with new section
    setTimeout(() => {
      setApplyingResize(false);
      handleCalcular();
    }, 50);
  };

  return (
    <div className="space-y-3">
      {/* Parametros de analisis */}
      <Card>
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-base">Parametros de Analisis</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-1">
              <Label className="text-xs whitespace-nowrap">Paso (mm)</Label>
              <Input
                type="number"
                className="h-7 text-sm"
                value={settings.stepMm}
                onChange={(e) =>
                  setSettings({ stepMm: Number(e.target.value) })
                }
              />
            </div>
            <div className="flex items-center gap-1">
              <Label className="text-xs whitespace-nowrap">Pos. env.</Label>
              <Input
                type="number"
                className="h-7 text-sm"
                value={settings.envelopePositions}
                onChange={(e) =>
                  setSettings({ envelopePositions: Number(e.target.value) })
                }
              />
            </div>
            <div className="flex items-center gap-1">
              <Label className="text-xs whitespace-nowrap">Pts/vano</Label>
              <Input
                type="number"
                className="h-7 text-sm"
                value={settings.diagramPoints}
                onChange={(e) =>
                  setSettings({ diagramPoints: Number(e.target.value) })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuracion LTB */}
      <Card>
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-base">Pandeo Lateral Torsional (LTB)</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1">
              <Label className="text-xs whitespace-nowrap">Cb</Label>
              <Select
                value={String(settings.Cb)}
                onValueChange={(v) =>
                  setSettings({ Cb: v === "auto" ? "auto" : Number(v) })
                }
              >
                <SelectTrigger className="h-7 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1.0 (conservador)</SelectItem>
                  <SelectItem value="auto">Auto (AISC F1)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Label className="text-xs whitespace-nowrap">Lb</Label>
                <Select
                  value={String(settings.Lb)}
                  onValueChange={(v) =>
                    setSettings({ Lb: v === "auto" ? "auto" : Number(v) })
                  }
                >
                  <SelectTrigger className="h-7 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto (long. vano)</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {settings.Lb !== "auto" && (
                <Input
                  type="number"
                  step={0.1}
                  placeholder="Lb (m)"
                  className="h-7 text-sm"
                  value={typeof settings.Lb === "number" ? settings.Lb : ""}
                  onChange={(e) =>
                    setSettings({ Lb: Number(e.target.value) })
                  }
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Limites de deflexion */}
      <Card>
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-base">Limites de Deflexion</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1">
              <Label className="text-xs whitespace-nowrap">Vertical</Label>
              <Select
                value={String(settings.deflLimitV)}
                onValueChange={(v) =>
                  setSettings({ deflLimitV: Number(v) })
                }
              >
                <SelectTrigger className="h-7 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="600">L/600 (CMAA A-D)</SelectItem>
                  <SelectItem value="800">L/800 (E-F)</SelectItem>
                  <SelectItem value="1000">L/1000</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1">
              <Label className="text-xs whitespace-nowrap">Horizontal</Label>
              <Select
                value={String(settings.deflLimitH)}
                onValueChange={(v) =>
                  setSettings({ deflLimitH: Number(v) })
                }
              >
                <SelectTrigger className="h-7 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="400">L/400 (estandar)</SelectItem>
                  <SelectItem value="600">L/600 (exigente)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fatiga */}
      <Card>
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-base">Fatiga</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableFatigue}
              onChange={(e) =>
                setSettings({ enableFatigue: e.target.checked })
              }
              className="h-3.5 w-3.5 rounded border-gray-300"
            />
            <span className="text-xs">
              Habilitar verificacion por fatiga (AISC Apendice 3 / CIRSOC 301 Apendice F)
            </span>
          </label>
        </CardContent>
      </Card>

      {/* Combinaciones de carga */}
      <Card>
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-base">Combinaciones de Carga (LRFD)</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-left bg-muted/50">
                  <th className="px-1 py-1 font-medium">ID</th>
                  <th className="px-1 py-1 font-medium">Nombre</th>
                  <th className="px-1 py-1 font-medium">gamma_D</th>
                  <th className="px-1 py-1 font-medium">gamma_L</th>
                  <th className="px-1 py-1 font-medium">gamma_W</th>
                </tr>
              </thead>
              <tbody>
                {settings.combinations.map((combo, idx) => (
                  <tr key={combo.id} className="border-b">
                    <td className="px-1 py-0.5 font-medium">{combo.id}</td>
                    <td className="px-1 py-0.5">{combo.name}</td>
                    <td className="px-1 py-0.5">
                      <Input
                        type="number"
                        step={0.1}
                        className="h-6 w-16 text-xs"
                        value={combo.gammaD}
                        onChange={(e) => {
                          const updated = [...settings.combinations];
                          updated[idx] = {
                            ...updated[idx],
                            gammaD: Number(e.target.value),
                          };
                          setSettings({ combinations: updated });
                        }}
                      />
                    </td>
                    <td className="px-1 py-0.5">
                      <Input
                        type="number"
                        step={0.1}
                        className="h-6 w-16 text-xs"
                        value={combo.gammaL}
                        onChange={(e) => {
                          const updated = [...settings.combinations];
                          updated[idx] = {
                            ...updated[idx],
                            gammaL: Number(e.target.value),
                          };
                          setSettings({ combinations: updated });
                        }}
                      />
                    </td>
                    <td className="px-1 py-0.5">
                      <Input
                        type="number"
                        step={0.1}
                        className="h-6 w-16 text-xs"
                        value={combo.gammaW}
                        onChange={(e) => {
                          const updated = [...settings.combinations];
                          updated[idx] = {
                            ...updated[idx],
                            gammaW: Number(e.target.value),
                          };
                          setSettings({ combinations: updated });
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Boton de calculo, mensajes y sugerencias */}
      <Card>
        <CardContent className="pt-3 px-3 pb-3">
          {error && (
            <div className="mb-2 p-2 rounded bg-red-50 border border-red-200 text-red-800 text-xs">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-2 p-2 rounded bg-green-50 border border-green-200 text-green-800 text-xs">
              {successMsg}
            </div>
          )}

          {/* Resize suggestion */}
          {suggestion && (
            <div className={`mb-2 p-2 rounded border text-xs ${
              suggestion.reason === "undersize"
                ? "bg-red-50 border-red-300 text-red-900"
                : "bg-amber-50 border-amber-300 text-amber-900"
            }`}>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="font-bold">
                    {suggestion.reason === "undersize" ? "Seccion insuficiente" : "Seccion sobredimensionada"}
                  </span>
                  <p className="mt-0.5">{suggestion.message}</p>
                </div>
                <Button
                  size="sm"
                  className={`h-7 text-xs px-3 whitespace-nowrap ${
                    suggestion.reason === "undersize"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-amber-600 hover:bg-amber-700 text-white"
                  }`}
                  onClick={handleApplySuggestion}
                  disabled={applyingResize}
                >
                  {applyingResize ? "Aplicando..." : `Aplicar sugerencia: ${suggestion.profileName}`}
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              {isCalculated ? (
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  <span className="text-green-700 font-medium">Calculo realizado</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                  <span className="text-yellow-700 font-medium">Calculo pendiente</span>
                </div>
              )}
            </div>
            <Button
              onClick={handleCalcular}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-8 text-sm"
            >
              Calcular
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
