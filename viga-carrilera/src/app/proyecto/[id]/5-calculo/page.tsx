"use client";

import { useProjectStore } from "@/store/projectStore";
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
  const { settings, setSettings, isCalculated } = useProjectStore();

  const handleCalcular = () => {
    // Placeholder: el calculo real se implementara con el engine
    alert(
      "Calculo iniciado. La implementacion del engine de analisis esta pendiente."
    );
  };

  return (
    <div className="space-y-6">
      {/* Parametros de analisis */}
      <Card>
        <CardHeader>
          <CardTitle>Parametros de Analisis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Paso del tren (mm)</Label>
              <Input
                type="number"
                value={settings.stepMm}
                onChange={(e) =>
                  setSettings({ stepMm: Number(e.target.value) })
                }
              />
              <p className="text-xs text-muted-foreground">
                Menor valor = mayor precision, mayor tiempo de calculo
              </p>
            </div>
            <div className="space-y-2">
              <Label>Posiciones de envolvente</Label>
              <Input
                type="number"
                value={settings.envelopePositions}
                onChange={(e) =>
                  setSettings({ envelopePositions: Number(e.target.value) })
                }
              />
              <p className="text-xs text-muted-foreground">Minimo 140</p>
            </div>
            <div className="space-y-2">
              <Label>Puntos del diagrama por vano</Label>
              <Input
                type="number"
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
        <CardHeader>
          <CardTitle>Pandeo Lateral Torsional (LTB)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cb - Factor de momento no uniforme</Label>
              <Select
                value={String(settings.Cb)}
                onValueChange={(v) =>
                  setSettings({ Cb: v === "auto" ? "auto" : Number(v) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1.0 (conservador)</SelectItem>
                  <SelectItem value="auto">
                    Auto (calculo segun AISC F1)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Lb - Longitud no arriostrada</Label>
              <Select
                value={String(settings.Lb)}
                onValueChange={(v) =>
                  setSettings({ Lb: v === "auto" ? "auto" : Number(v) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto (longitud del vano)</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
              {settings.Lb !== "auto" && (
                <Input
                  type="number"
                  step={0.1}
                  placeholder="Lb (m)"
                  value={typeof settings.Lb === "number" ? settings.Lb : ""}
                  onChange={(e) =>
                    setSettings({ Lb: Number(e.target.value) })
                  }
                  className="mt-2"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Limites de deflexion */}
      <Card>
        <CardHeader>
          <CardTitle>Limites de Deflexion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Deflexion vertical</Label>
              <Select
                value={String(settings.deflLimitV)}
                onValueChange={(v) =>
                  setSettings({ deflLimitV: Number(v) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="600">L/600 (recomendado CMAA A-D)</SelectItem>
                  <SelectItem value="800">L/800 (gruas pesadas E-F)</SelectItem>
                  <SelectItem value="1000">L/1000 (muy exigente)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Deflexion horizontal</Label>
              <Select
                value={String(settings.deflLimitH)}
                onValueChange={(v) =>
                  setSettings({ deflLimitH: Number(v) })
                }
              >
                <SelectTrigger>
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
        <CardHeader>
          <CardTitle>Fatiga</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableFatigue}
              onChange={(e) =>
                setSettings({ enableFatigue: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm">
              Habilitar verificacion por fatiga (AISC Apendice 3 / CIRSOC 301 Apendice F)
            </span>
          </label>
          {settings.enableFatigue && (
            <p className="text-xs text-muted-foreground mt-2">
              Se verificaran los puntos criticos de tension segun categorias de
              detalle y rango de tensiones admisibles.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Combinaciones de carga */}
      <Card>
        <CardHeader>
          <CardTitle>Combinaciones de Carga (LRFD)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left bg-muted/50">
                  <th className="p-2 font-medium">ID</th>
                  <th className="p-2 font-medium">Nombre</th>
                  <th className="p-2 font-medium">gamma_D</th>
                  <th className="p-2 font-medium">gamma_L</th>
                  <th className="p-2 font-medium">gamma_W</th>
                </tr>
              </thead>
              <tbody>
                {settings.combinations.map((combo, idx) => (
                  <tr key={combo.id} className="border-b">
                    <td className="p-2 font-medium">{combo.id}</td>
                    <td className="p-2">{combo.name}</td>
                    <td className="p-2">
                      <Input
                        type="number"
                        step={0.1}
                        className="w-20"
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
                    <td className="p-2">
                      <Input
                        type="number"
                        step={0.1}
                        className="w-20"
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
                    <td className="p-2">
                      <Input
                        type="number"
                        step={0.1}
                        className="w-20"
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

      {/* Boton de calculo */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              {isCalculated ? (
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-green-700 font-medium">
                    Calculo realizado
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span className="text-yellow-700 font-medium">
                    Calculo pendiente
                  </span>
                </div>
              )}
            </div>
            <Button
              size="lg"
              onClick={handleCalcular}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              Calcular
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
