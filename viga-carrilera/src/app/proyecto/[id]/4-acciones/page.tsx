"use client";

import { useState } from "react";
import { useProjectStore } from "@/store/projectStore";
import { CmaaClass, CraneConfig, CraneAxle } from "@/lib/types";
import {
  CRANE_TEMPLATES,
  CraneTemplateData,
  getCranesByCategory,
  CATEGORY_NAMES,
  CMAA_PHI,
  CMAA_BUFFER_FACTOR,
} from "@/lib/db/cranes";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SvgTestera } from "@/components/visualization/SvgTestera";

const CRANE_COLORS = ["#3b82f6", "#ef4444", "#22c55e"];
const CRANE_COLOR_LABELS = ["Azul", "Rojo", "Verde"];

function makeDefaultCrane(index: number): CraneConfig {
  const cmaa: CmaaClass = "C";
  return {
    id: `crane-${index}`,
    label: `Grua ${index + 1}`,
    color: CRANE_COLORS[index % 3],
    cmaaClass: cmaa,
    phi: CMAA_PHI[cmaa],
    Gcrane: 200,
    axles: [
      { index: 0, dx: 0, Pw: 80, Ph: 8, HT: 5, Pv: 80 * (1 + CMAA_PHI[cmaa]) },
      { index: 1, dx: 2200, Pw: 80, Ph: 8, HT: 5, Pv: 80 * (1 + CMAA_PHI[cmaa]) },
    ],
    minSeparation: 1000,
  };
}

export default function AccionesPage() {
  const { cranes, setCranes, buffer, setBuffer, general } = useProjectStore();
  const [craneCount, setCraneCount] = useState(cranes.length || 1);
  const [libraryCategory, setLibraryCategory] = useState("1");
  const [libraryFilter, setLibraryFilter] = useState("");
  const [showLibrary, setShowLibrary] = useState(false);
  const [targetCraneIndex, setTargetCraneIndex] = useState(0);

  // Initialize cranes if empty
  const activeCranes: CraneConfig[] =
    cranes.length > 0
      ? cranes
      : Array.from({ length: craneCount }, (_, i) => makeDefaultCrane(i));

  const handleCraneCountChange = (count: number) => {
    const clamped = Math.max(1, Math.min(3, count));
    setCraneCount(clamped);
    const newCranes = Array.from({ length: clamped }, (_, i) =>
      i < activeCranes.length ? activeCranes[i] : makeDefaultCrane(i)
    );
    setCranes(newCranes);
  };

  const updateCrane = (index: number, data: Partial<CraneConfig>) => {
    const updated = activeCranes.map((c, i) =>
      i === index ? { ...c, ...data } : c
    );
    setCranes(updated);
  };

  const updateCraneCmaa = (index: number, cmaa: CmaaClass) => {
    const crane = activeCranes[index];
    const phi = CMAA_PHI[cmaa];
    const updatedAxles = crane.axles.map((ax) => ({
      ...ax,
      Pv: ax.Pw * (1 + phi),
    }));
    updateCrane(index, { cmaaClass: cmaa, phi, axles: updatedAxles });
  };

  const updateAxle = (
    craneIndex: number,
    axleIndex: number,
    data: Partial<CraneAxle>
  ) => {
    const crane = activeCranes[craneIndex];
    const updatedAxles = crane.axles.map((ax, ai) => {
      if (ai !== axleIndex) return ax;
      const merged = { ...ax, ...data };
      merged.Pv = merged.Pw * (1 + crane.phi);
      return merged;
    });
    updateCrane(craneIndex, { axles: updatedAxles });
  };

  const addAxle = (craneIndex: number) => {
    const crane = activeCranes[craneIndex];
    const lastDx =
      crane.axles.length > 0
        ? crane.axles[crane.axles.length - 1].dx + 1500
        : 0;
    const newAxle: CraneAxle = {
      index: crane.axles.length,
      dx: lastDx,
      Pw: 50,
      Ph: 5,
      HT: 3,
      Pv: 50 * (1 + crane.phi),
    };
    updateCrane(craneIndex, {
      axles: [...crane.axles, newAxle],
    });
  };

  const removeAxle = (craneIndex: number, axleIndex: number) => {
    const crane = activeCranes[craneIndex];
    if (crane.axles.length <= 1) return;
    const filtered = crane.axles
      .filter((_, i) => i !== axleIndex)
      .map((ax, i) => ({ ...ax, index: i }));
    updateCrane(craneIndex, { axles: filtered });
  };

  const applyTemplate = (template: CraneTemplateData, craneIndex: number) => {
    const cmaa = template.cmaa as CmaaClass;
    const phi = CMAA_PHI[cmaa];
    const Pw = ((template.Q + template.Gc) / template.axles) * 0.5;
    const Ph = Pw * 0.2;
    const HT = Pw * 0.1;
    const axles: CraneAxle[] = [];
    const spacing = template.aw / (template.axles > 2 ? template.axles - 1 : 1);
    for (let i = 0; i < template.axles; i++) {
      axles.push({
        index: i,
        dx: Math.round(i * spacing),
        Pw: Math.round(Pw * 10) / 10,
        Ph: Math.round(Ph * 10) / 10,
        HT: Math.round(HT * 10) / 10,
        Pv: Math.round(Pw * (1 + phi) * 10) / 10,
      });
    }
    updateCrane(craneIndex, {
      label: `${template.code} (Q=${template.Q} kN)`,
      cmaaClass: cmaa,
      phi,
      Gcrane: template.Gp,
      axles,
    });
    setShowLibrary(false);
  };

  const filteredTemplates = libraryFilter
    ? CRANE_TEMPLATES.filter(
        (t) =>
          t.code.toLowerCase().includes(libraryFilter.toLowerCase()) ||
          t.application.toLowerCase().includes(libraryFilter.toLowerCase()) ||
          t.Q.toString().includes(libraryFilter)
      )
    : getCranesByCategory(Number(libraryCategory));

  return (
    <div className="space-y-6">
      {/* Cantidad de gruas */}
      <Card>
        <CardHeader>
          <CardTitle>Cantidad de Gruas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label>Gruas sobre la viga:</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCraneCountChange(craneCount - 1)}
                disabled={craneCount <= 1}
              >
                -
              </Button>
              <span className="w-10 text-center font-semibold text-lg">
                {craneCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCraneCountChange(craneCount + 1)}
                disabled={craneCount >= 3}
              >
                +
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuracion por grua */}
      {activeCranes.map((crane, ci) => (
        <Card key={crane.id}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: crane.color }}
              />
              <CardTitle className="text-lg">{crane.label}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Etiqueta</Label>
                <Input
                  value={crane.label}
                  onChange={(e) => updateCrane(ci, { label: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  {CRANE_COLORS.map((color, idx) => (
                    <button
                      key={color}
                      onClick={() => updateCrane(ci, { color })}
                      className={`w-8 h-8 rounded-full border-2 transition-colors ${
                        crane.color === color
                          ? "border-gray-900 ring-2 ring-offset-2 ring-blue-500"
                          : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                      title={CRANE_COLOR_LABELS[idx]}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Clase CMAA</Label>
                <Select
                  value={crane.cmaaClass}
                  onValueChange={(v) => updateCraneCmaa(ci, v as CmaaClass)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["A", "B", "C", "D", "E", "F"] as CmaaClass[]).map(
                      (cls) => (
                        <SelectItem key={cls} value={cls}>
                          Clase {cls}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>phi (factor dinamico)</Label>
                <Input
                  type="number"
                  step={0.01}
                  value={crane.phi}
                  onChange={(e) => {
                    const phi = Number(e.target.value);
                    const updatedAxles = crane.axles.map((ax) => ({
                      ...ax,
                      Pv: ax.Pw * (1 + phi),
                    }));
                    updateCrane(ci, { phi, axles: updatedAxles });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Gcrane - Peso del puente (kN)</Label>
                <Input
                  type="number"
                  value={crane.Gcrane}
                  onChange={(e) =>
                    updateCrane(ci, { Gcrane: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            {/* Biblioteca */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTargetCraneIndex(ci);
                  setShowLibrary(!showLibrary);
                }}
              >
                Importar de biblioteca
              </Button>
            </div>

            {/* Tabla de ejes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">Ejes de rueda</h4>
                <Button variant="outline" size="sm" onClick={() => addAxle(ci)}>
                  + Agregar eje
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-2 font-medium">Eje #</th>
                      <th className="p-2 font-medium">dx (mm)</th>
                      <th className="p-2 font-medium">Pw (kN)</th>
                      <th className="p-2 font-medium">Ph (kN)</th>
                      <th className="p-2 font-medium">HT (kN)</th>
                      <th className="p-2 font-medium">Pv (kN)</th>
                      <th className="p-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {crane.axles.map((axle, ai) => (
                      <tr key={ai} className="border-b">
                        <td className="p-2 font-medium">{ai + 1}</td>
                        <td className="p-2">
                          <Input
                            type="number"
                            className="w-24"
                            value={axle.dx}
                            onChange={(e) =>
                              updateAxle(ci, ai, { dx: Number(e.target.value) })
                            }
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            className="w-20"
                            value={axle.Pw}
                            onChange={(e) =>
                              updateAxle(ci, ai, { Pw: Number(e.target.value) })
                            }
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            className="w-20"
                            value={axle.Ph}
                            onChange={(e) =>
                              updateAxle(ci, ai, { Ph: Number(e.target.value) })
                            }
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            className="w-20"
                            value={axle.HT}
                            onChange={(e) =>
                              updateAxle(ci, ai, { HT: Number(e.target.value) })
                            }
                          />
                        </td>
                        <td className="p-2">
                          <span className="font-medium text-blue-600">
                            {axle.Pv.toFixed(1)}
                          </span>
                        </td>
                        <td className="p-2">
                          {crane.axles.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => removeAxle(ci, ai)}
                            >
                              X
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Diagrama SVG de Testera */}
            {crane.axles.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-sm mb-2">Diagrama de Testera</h4>
                <SvgTestera
                  axles={crane.axles}
                  phi={crane.phi}
                  color={crane.color}
                  width={600}
                  height={280}
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Biblioteca de gruas */}
      {showLibrary && (
        <Card>
          <CardHeader>
            <CardTitle>Biblioteca de Gruas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="space-y-2">
                <Label>Filtrar por texto</Label>
                <Input
                  placeholder="Codigo, aplicacion o capacidad..."
                  value={libraryFilter}
                  onChange={(e) => setLibraryFilter(e.target.value)}
                  className="w-64"
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Tabs value={libraryCategory} onValueChange={setLibraryCategory}>
                  <TabsList>
                    {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
                      <TabsTrigger key={key} value={key}>
                        {name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left bg-muted/50">
                    <th className="p-2 font-medium">Codigo</th>
                    <th className="p-2 font-medium">Q (kN)</th>
                    <th className="p-2 font-medium">Lp (m)</th>
                    <th className="p-2 font-medium">Gp (kN)</th>
                    <th className="p-2 font-medium">Gc (kN)</th>
                    <th className="p-2 font-medium">Ejes</th>
                    <th className="p-2 font-medium">aw (mm)</th>
                    <th className="p-2 font-medium">CMAA</th>
                    <th className="p-2 font-medium">Aplicacion</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTemplates.map((t) => (
                    <tr key={t.code} className="border-b hover:bg-muted/30">
                      <td className="p-2 font-medium">{t.code}</td>
                      <td className="p-2">{t.Q}</td>
                      <td className="p-2">{t.Lp}</td>
                      <td className="p-2">{t.Gp}</td>
                      <td className="p-2">{t.Gc}</td>
                      <td className="p-2">{t.axles}</td>
                      <td className="p-2">{t.aw}</td>
                      <td className="p-2">{t.cmaa}</td>
                      <td className="p-2 text-muted-foreground">
                        {t.application}
                      </td>
                      <td className="p-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => applyTemplate(t, targetCraneIndex)}
                        >
                          Usar esta grua
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Buffer / Tope */}
      <Card>
        <CardHeader>
          <CardTitle>Configuracion de Tope (Buffer)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>eStop - Distancia al tope (mm)</Label>
              <Input
                type="number"
                value={buffer.eStop}
                onChange={(e) =>
                  setBuffer({ ...buffer, eStop: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Factor de tope (auto segun clase: {CMAA_BUFFER_FACTOR[general.cmaaClass]})</Label>
              <Input
                type="number"
                step={0.01}
                value={buffer.bufferFactor}
                onChange={(e) =>
                  setBuffer({ ...buffer, bufferFactor: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Excentricidad del tope (mm)</Label>
              <Input
                type="number"
                value={buffer.eccentricity}
                onChange={(e) =>
                  setBuffer({
                    ...buffer,
                    eccentricity: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
