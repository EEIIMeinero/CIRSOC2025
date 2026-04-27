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
import { SvgTesteraIsometric } from "@/components/visualization/SvgTesteraIsometric";

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

// Track which axles have manually overridden Pv (keyed by "craneIndex-axleIndex")
type PvOverrides = Set<string>;

export default function AccionesPage() {
  const { cranes, setCranes, buffer, setBuffer, general } = useProjectStore();
  const [craneCount, setCraneCount] = useState(cranes.length || 1);
  const [libraryCategory, setLibraryCategory] = useState("1");
  const [libraryFilter, setLibraryFilter] = useState("");
  const [showLibrary, setShowLibrary] = useState(false);
  const [targetCraneIndex, setTargetCraneIndex] = useState(0);
  const [pvOverrides, setPvOverrides] = useState<PvOverrides>(new Set());

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
    const updatedAxles = crane.axles.map((ax, ai) => {
      const key = `${index}-${ai}`;
      if (pvOverrides.has(key)) return ax; // keep manual Pv
      return { ...ax, Pv: ax.Pw * (1 + phi) };
    });
    updateCrane(index, { cmaaClass: cmaa, phi, axles: updatedAxles });
  };

  const updateAxle = (
    craneIndex: number,
    axleIndex: number,
    data: Partial<CraneAxle>
  ) => {
    const crane = activeCranes[craneIndex];
    const key = `${craneIndex}-${axleIndex}`;
    const isManual = pvOverrides.has(key);
    const updatedAxles = crane.axles.map((ax, ai) => {
      if (ai !== axleIndex) return ax;
      const merged = { ...ax, ...data };
      // Only auto-calc Pv if not manually overridden
      if (!isManual) {
        merged.Pv = merged.Pw * (1 + crane.phi);
      }
      return merged;
    });
    updateCrane(craneIndex, { axles: updatedAxles });
  };

  const updateAxlePvManual = (
    craneIndex: number,
    axleIndex: number,
    pv: number
  ) => {
    const crane = activeCranes[craneIndex];
    const key = `${craneIndex}-${axleIndex}`;
    const newOverrides = new Set(pvOverrides);
    newOverrides.add(key);
    setPvOverrides(newOverrides);
    const updatedAxles = crane.axles.map((ax, ai) =>
      ai === axleIndex ? { ...ax, Pv: pv } : ax
    );
    updateCrane(craneIndex, { axles: updatedAxles });
  };

  const resetPvToAuto = (craneIndex: number, axleIndex: number) => {
    const crane = activeCranes[craneIndex];
    const key = `${craneIndex}-${axleIndex}`;
    const newOverrides = new Set(pvOverrides);
    newOverrides.delete(key);
    setPvOverrides(newOverrides);
    const axle = crane.axles[axleIndex];
    const autoVal = axle.Pw * (1 + crane.phi);
    const updatedAxles = crane.axles.map((ax, ai) =>
      ai === axleIndex ? { ...ax, Pv: autoVal } : ax
    );
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
    // Clean up overrides
    const newOverrides = new Set<string>();
    pvOverrides.forEach((key) => {
      const [ci, ai] = key.split("-").map(Number);
      if (ci === craneIndex) {
        if (ai < axleIndex) newOverrides.add(key);
        else if (ai > axleIndex) newOverrides.add(`${ci}-${ai - 1}`);
      } else {
        newOverrides.add(key);
      }
    });
    setPvOverrides(newOverrides);
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
    // Clear overrides for this crane
    const newOverrides = new Set<string>();
    pvOverrides.forEach((key) => {
      if (!key.startsWith(`${craneIndex}-`)) newOverrides.add(key);
    });
    setPvOverrides(newOverrides);
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
    <div className="space-y-3">
      {/* Cantidad de gruas */}
      <Card>
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-base">Cantidad de Gruas</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <div className="flex items-center gap-4">
            <Label className="text-sm">Gruas sobre la viga:</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => handleCraneCountChange(craneCount - 1)}
                disabled={craneCount <= 1}
              >
                -
              </Button>
              <span className="w-8 text-center font-semibold">
                {craneCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => handleCraneCountChange(craneCount + 1)}
                disabled={craneCount >= 3}
              >
                +
              </Button>
            </div>
            {/* Crane separation field when 2+ cranes */}
            {activeCranes.length >= 2 && (
              <div className="flex items-center gap-2 ml-6">
                <Label className="text-sm whitespace-nowrap">Sep. min entre gruas (mm):</Label>
                <Input
                  type="number"
                  className="w-24 h-8"
                  value={activeCranes[0]?.minSeparation ?? 1000}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const updated = activeCranes.map((c) => ({
                      ...c,
                      minSeparation: val,
                    }));
                    setCranes(updated);
                  }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configuracion por grua */}
      {activeCranes.map((crane, ci) => (
        <Card key={crane.id}>
          <CardHeader className="py-2 px-3">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: crane.color }}
              />
              <CardTitle className="text-base">{crane.label}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto h-7 text-xs"
                onClick={() => {
                  setTargetCraneIndex(ci);
                  setShowLibrary(!showLibrary);
                }}
              >
                Importar de biblioteca
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-2 space-y-2">
            {/* Crane config grid - 2 columns compact */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <div className="flex items-center gap-1">
                <Label className="text-xs whitespace-nowrap w-16">Etiqueta</Label>
                <Input
                  className="h-7 text-sm"
                  value={crane.label}
                  onChange={(e) => updateCrane(ci, { label: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-1">
                <Label className="text-xs whitespace-nowrap w-12">Color</Label>
                <div className="flex gap-1">
                  {CRANE_COLORS.map((color, idx) => (
                    <button
                      key={color}
                      onClick={() => updateCrane(ci, { color })}
                      className={`w-6 h-6 rounded-full border-2 transition-colors ${
                        crane.color === color
                          ? "border-slate-200 ring-1 ring-offset-1 ring-blue-500"
                          : "border-slate-600"
                      }`}
                      style={{ backgroundColor: color }}
                      title={CRANE_COLOR_LABELS[idx]}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Label className="text-xs whitespace-nowrap w-12">CMAA</Label>
                <Select
                  value={crane.cmaaClass}
                  onValueChange={(v) => updateCraneCmaa(ci, v as CmaaClass)}
                >
                  <SelectTrigger className="h-7 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["A", "B", "C", "D", "E", "F"] as CmaaClass[]).map(
                      (cls) => (
                        <SelectItem key={cls} value={cls}>
                          {cls}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-1">
                <Label className="text-xs whitespace-nowrap w-6">phi</Label>
                <Input
                  type="number"
                  step={0.01}
                  className="h-7 text-sm w-20"
                  value={crane.phi}
                  onChange={(e) => {
                    const phi = Number(e.target.value);
                    const updatedAxles = crane.axles.map((ax, ai) => {
                      const key = `${ci}-${ai}`;
                      if (pvOverrides.has(key)) return ax;
                      return { ...ax, Pv: ax.Pw * (1 + phi) };
                    });
                    updateCrane(ci, { phi, axles: updatedAxles });
                  }}
                />
              </div>
              <div className="flex items-center gap-1">
                <Label className="text-xs whitespace-nowrap w-16">Gcrane</Label>
                <Input
                  type="number"
                  className="h-7 text-sm"
                  value={crane.Gcrane}
                  onChange={(e) =>
                    updateCrane(ci, { Gcrane: Number(e.target.value) })
                  }
                />
                <span className="text-xs text-slate-400">kN</span>
              </div>
            </div>

            {/* Tabla de ejes - compact */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-xs text-blue-400">Ejes de rueda</h4>
                <Button variant="outline" size="sm" className="h-6 text-xs px-2" onClick={() => addAxle(ci)}>
                  + Eje
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-700 text-left bg-slate-800">
                      <th className="px-1 py-1 font-medium w-8">#</th>
                      <th className="px-1 py-1 font-medium">dx (mm)</th>
                      <th className="px-1 py-1 font-medium">Pw (kN)</th>
                      <th className="px-1 py-1 font-medium">Ph (kN)</th>
                      <th className="px-1 py-1 font-medium">HT (kN)</th>
                      <th className="px-1 py-1 font-medium">Pv (kN)</th>
                      <th className="px-1 py-1 w-6"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {crane.axles.map((axle, ai) => {
                      const pvKey = `${ci}-${ai}`;
                      const isManualPv = pvOverrides.has(pvKey);
                      const autoPv = axle.Pw * (1 + crane.phi);
                      return (
                        <tr key={ai} className="border-b border-slate-700 bg-slate-900">
                          <td className="px-1 py-0.5 font-medium text-slate-400">{ai + 1}</td>
                          <td className="px-1 py-0.5">
                            <Input
                              type="number"
                              className="h-6 w-20 text-xs"
                              value={axle.dx}
                              onChange={(e) =>
                                updateAxle(ci, ai, { dx: Number(e.target.value) })
                              }
                            />
                          </td>
                          <td className="px-1 py-0.5">
                            <Input
                              type="number"
                              className="h-6 w-16 text-xs"
                              value={axle.Pw}
                              onChange={(e) =>
                                updateAxle(ci, ai, { Pw: Number(e.target.value) })
                              }
                            />
                          </td>
                          <td className="px-1 py-0.5">
                            <Input
                              type="number"
                              className="h-6 w-16 text-xs"
                              value={axle.Ph}
                              onChange={(e) =>
                                updateAxle(ci, ai, { Ph: Number(e.target.value) })
                              }
                            />
                          </td>
                          <td className="px-1 py-0.5">
                            <Input
                              type="number"
                              className="h-6 w-16 text-xs"
                              value={axle.HT}
                              onChange={(e) =>
                                updateAxle(ci, ai, { HT: Number(e.target.value) })
                              }
                            />
                          </td>
                          <td className="px-1 py-0.5">
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                className={`h-6 w-16 text-xs ${isManualPv ? "border-amber-400 bg-amber-950/50" : ""}`}
                                value={Number(axle.Pv.toFixed(1))}
                                onChange={(e) =>
                                  updateAxlePvManual(ci, ai, Number(e.target.value))
                                }
                              />
                              <span
                                className={`inline-flex items-center px-1 py-0 rounded text-[9px] font-medium cursor-pointer select-none ${
                                  isManualPv
                                    ? "bg-amber-950/50 text-amber-400 hover:bg-amber-900/50"
                                    : "bg-blue-950/50 text-blue-400"
                                }`}
                                onClick={() => {
                                  if (isManualPv) resetPvToAuto(ci, ai);
                                }}
                                title={
                                  isManualPv
                                    ? `Click para restaurar auto: ${autoPv.toFixed(1)} kN`
                                    : `Pw*(1+phi) = ${autoPv.toFixed(1)} kN`
                                }
                              >
                                {isManualPv ? "manual" : "auto"}
                              </span>
                            </div>
                          </td>
                          <td className="px-1 py-0.5">
                            {crane.axles.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 text-red-400 hover:text-red-600 text-xs"
                                onClick={() => removeAxle(ci, ai)}
                              >
                                X
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Diagrama SVG Isometrico */}
            {crane.axles.length > 0 && (
              <div>
                <SvgTesteraIsometric
                  axles={crane.axles}
                  phi={crane.phi}
                  color={crane.color}
                  width={620}
                  height={340}
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Biblioteca de gruas */}
      {showLibrary && (
        <Card>
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-base">Biblioteca de Gruas</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-2 space-y-2">
            <div className="flex gap-3 items-end">
              <div>
                <Label className="text-xs">Filtrar</Label>
                <Input
                  placeholder="Codigo, aplicacion o capacidad..."
                  value={libraryFilter}
                  onChange={(e) => setLibraryFilter(e.target.value)}
                  className="w-56 h-7 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Categoria</Label>
                <Tabs value={libraryCategory} onValueChange={setLibraryCategory}>
                  <TabsList className="h-7">
                    {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
                      <TabsTrigger key={key} value={key} className="text-xs px-2 py-0.5">
                        {name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-xs">
                <thead className="sticky top-0">
                  <tr className="border-b border-slate-700 text-left bg-slate-800">
                    <th className="px-1 py-1 font-medium">Codigo</th>
                    <th className="px-1 py-1 font-medium">Q (kN)</th>
                    <th className="px-1 py-1 font-medium">Lp (m)</th>
                    <th className="px-1 py-1 font-medium">Gp (kN)</th>
                    <th className="px-1 py-1 font-medium">Gc (kN)</th>
                    <th className="px-1 py-1 font-medium">Ejes</th>
                    <th className="px-1 py-1 font-medium">aw (mm)</th>
                    <th className="px-1 py-1 font-medium">CMAA</th>
                    <th className="px-1 py-1 font-medium">Aplicacion</th>
                    <th className="px-1 py-1"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTemplates.map((t) => (
                    <tr key={t.code} className="border-b border-slate-700 bg-slate-900 hover:bg-slate-800/50">
                      <td className="px-1 py-0.5 font-medium">{t.code}</td>
                      <td className="px-1 py-0.5">{t.Q}</td>
                      <td className="px-1 py-0.5">{t.Lp}</td>
                      <td className="px-1 py-0.5">{t.Gp}</td>
                      <td className="px-1 py-0.5">{t.Gc}</td>
                      <td className="px-1 py-0.5">{t.axles}</td>
                      <td className="px-1 py-0.5">{t.aw}</td>
                      <td className="px-1 py-0.5">{t.cmaa}</td>
                      <td className="px-1 py-0.5 text-slate-400">
                        {t.application}
                      </td>
                      <td className="px-1 py-0.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs px-2"
                          onClick={() => applyTemplate(t, targetCraneIndex)}
                        >
                          Usar
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
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-base">Tope (Buffer)</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-1">
              <Label className="text-xs whitespace-nowrap">eStop (mm)</Label>
              <Input
                type="number"
                className="h-7 text-sm"
                value={buffer.eStop}
                onChange={(e) =>
                  setBuffer({ ...buffer, eStop: Number(e.target.value) })
                }
              />
            </div>
            <div className="flex items-center gap-1">
              <Label className="text-xs whitespace-nowrap">Factor ({CMAA_BUFFER_FACTOR[general.cmaaClass]})</Label>
              <Input
                type="number"
                step={0.01}
                className="h-7 text-sm"
                value={buffer.bufferFactor}
                onChange={(e) =>
                  setBuffer({ ...buffer, bufferFactor: Number(e.target.value) })
                }
              />
            </div>
            <div className="flex items-center gap-1">
              <Label className="text-xs whitespace-nowrap">Excent. (mm)</Label>
              <Input
                type="number"
                className="h-7 text-sm"
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
