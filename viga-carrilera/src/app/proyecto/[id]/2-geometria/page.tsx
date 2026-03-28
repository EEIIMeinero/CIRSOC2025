"use client";

import { useProjectStore } from "@/store/projectStore";
import { SupportType } from "@/lib/types";
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

const SUPPORT_TYPES: { value: SupportType; label: string }[] = [
  { value: "pinned", label: "Articulado simple" },
  { value: "roller", label: "Movil" },
  { value: "fixed", label: "Empotrado" },
  { value: "warping", label: "Restriccion de alabeo" },
  { value: "lat-top", label: "Lateral ala superior" },
  { value: "lat-bot", label: "Lateral ala inferior" },
  { value: "custom", label: "Definido por usuario" },
];

const STIFFENER_OPTIONS = [
  { value: "none", label: "Sin rigidizador" },
  { value: "rigid", label: "Rigidizador rigido" },
  { value: "non-rigid", label: "Rigidizador no rigido" },
];

export default function GeometriaPage() {
  const {
    spans,
    supports,
    addSpan,
    removeSpan,
    updateSpanLength,
    updateSupport,
  } = useProjectStore();

  const totalLength = spans.reduce((sum, s) => sum + s.length, 0);

  const svgWidth = 800;
  const svgHeight = 120;
  const margin = 40;
  const beamY = 50;
  const usableWidth = svgWidth - 2 * margin;

  return (
    <div className="space-y-6">
      {/* Cantidad de Vanos */}
      <Card>
        <CardHeader>
          <CardTitle>Configuracion de Vanos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Label>Cantidad de vanos:</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (spans.length > 1) removeSpan(spans.length - 1);
                }}
                disabled={spans.length <= 1}
              >
                -
              </Button>
              <span className="w-10 text-center font-semibold text-lg">
                {spans.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={addSpan}
                disabled={spans.length >= 10}
              >
                +
              </Button>
            </div>
            <div className="ml-auto text-sm text-muted-foreground">
              Longitud total:{" "}
              <span className="font-semibold text-foreground">
                {totalLength.toFixed(2)} m
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {spans.map((span) => (
              <div
                key={span.index}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <span className="font-medium text-sm w-24">
                  Vano {span.index + 1}
                </span>
                <Label className="text-sm">L (m):</Label>
                <Input
                  type="number"
                  step={0.1}
                  min={0.5}
                  className="w-28"
                  value={span.length}
                  onChange={(e) =>
                    updateSpanLength(span.index, Number(e.target.value))
                  }
                />
                {spans.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 ml-auto"
                    onClick={() => removeSpan(span.index)}
                  >
                    Eliminar
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Apoyos */}
      <Card>
        <CardHeader>
          <CardTitle>Condiciones de Apoyo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2 font-medium">Nodo</th>
                  <th className="p-2 font-medium">Tipo de apoyo</th>
                  <th className="p-2 font-medium">Long. apoyo (mm)</th>
                  <th className="p-2 font-medium">Rigidizador</th>
                  <th className="p-2 font-medium">Articulacion</th>
                </tr>
              </thead>
              <tbody>
                {supports.map((sup) => (
                  <tr key={sup.nodeIndex} className="border-b">
                    <td className="p-2 font-medium">N{sup.nodeIndex}</td>
                    <td className="p-2">
                      <Select
                        value={sup.type}
                        onValueChange={(v) =>
                          updateSupport(sup.nodeIndex, {
                            type: v as SupportType,
                          })
                        }
                      >
                        <SelectTrigger className="w-52">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SUPPORT_TYPES.map((st) => (
                            <SelectItem key={st.value} value={st.value}>
                              {st.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        className="w-24"
                        value={sup.bearingLength}
                        onChange={(e) =>
                          updateSupport(sup.nodeIndex, {
                            bearingLength: Number(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td className="p-2">
                      <Select
                        value={sup.stiffener}
                        onValueChange={(v) =>
                          updateSupport(sup.nodeIndex, {
                            stiffener: v as "none" | "rigid" | "non-rigid",
                          })
                        }
                      >
                        <SelectTrigger className="w-44">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STIFFENER_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sup.hasHinge}
                          onChange={(e) =>
                            updateSupport(sup.nodeIndex, {
                              hasHinge: e.target.checked,
                            })
                          }
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <span className="text-xs">M = 0</span>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Vinculación entre vanos */}
      {spans.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Vinculación entre Vanos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Defina cómo se vinculan los vanos consecutivos en cada apoyo interior.
              En el modelo actual (Fase 1) cada vano se analiza como viga simplemente apoyada (SS).
              Los apoyos con articulación (M=0) garantizan discontinuidad de momento.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-2 font-medium">Apoyo</th>
                    <th className="p-2 font-medium">Vano Izq.</th>
                    <th className="p-2 font-medium">Vano Der.</th>
                    <th className="p-2 font-medium">Vinculación</th>
                    <th className="p-2 font-medium">Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {supports.slice(1, -1).map((sup) => (
                    <tr key={sup.nodeIndex} className="border-b">
                      <td className="p-2 font-medium">N{sup.nodeIndex}</td>
                      <td className="p-2">V{sup.nodeIndex}</td>
                      <td className="p-2">V{sup.nodeIndex + 1}</td>
                      <td className="p-2">
                        <Select
                          value={sup.hasHinge ? "articulated" : "continuous"}
                          onValueChange={(v) =>
                            updateSupport(sup.nodeIndex, {
                              hasHinge: v === "articulated",
                            })
                          }
                        >
                          <SelectTrigger className="w-44">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="articulated">Articulada (M=0)</SelectItem>
                            <SelectItem value="continuous">Continua</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2 text-xs text-muted-foreground">
                        {sup.hasHinge
                          ? "Momento nulo en el apoyo — vanos independientes"
                          : "Continuidad de momento — Fase 2 (FEM continuo)"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 p-3 rounded-md bg-amber-50 border border-amber-200 text-sm text-amber-800">
              <strong>Nota Fase 1:</strong> Actualmente todos los vanos se analizan como vigas
              simplemente apoyadas (articuladas en cada extremo). La vinculación &quot;Continua&quot;
              se implementará en la Fase 2 con análisis FEM 1D.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visualizacion SVG */}
      <Card>
        <CardHeader>
          <CardTitle>Vista esquematica</CardTitle>
        </CardHeader>
        <CardContent>
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full border rounded-lg bg-white"
          >
            {/* Beam line */}
            <line
              x1={margin}
              y1={beamY}
              x2={svgWidth - margin}
              y2={beamY}
              stroke="#1e40af"
              strokeWidth={4}
            />

            {/* Spans and supports */}
            {spans.map((span, i) => {
              const x1 =
                margin +
                (spans.slice(0, i).reduce((s, sp) => s + sp.length, 0) /
                  totalLength) *
                  usableWidth;
              const x2 =
                margin +
                (spans.slice(0, i + 1).reduce((s, sp) => s + sp.length, 0) /
                  totalLength) *
                  usableWidth;
              const midX = (x1 + x2) / 2;

              return (
                <g key={i}>
                  <text
                    x={midX}
                    y={beamY - 12}
                    textAnchor="middle"
                    className="text-xs fill-blue-600"
                    fontSize={11}
                  >
                    {span.length.toFixed(1)} m
                  </text>
                  <line
                    x1={x1 + 4}
                    y1={beamY - 8}
                    x2={x2 - 4}
                    y2={beamY - 8}
                    stroke="#93c5fd"
                    strokeWidth={1}
                  />
                </g>
              );
            })}

            {/* Supports */}
            {supports.map((sup) => {
              const xPos =
                margin +
                (spans
                  .slice(0, sup.nodeIndex)
                  .reduce((s, sp) => s + sp.length, 0) /
                  totalLength) *
                  usableWidth;
              const triH = 16;

              if (sup.type === "fixed") {
                return (
                  <g key={sup.nodeIndex}>
                    <line
                      x1={xPos}
                      y1={beamY}
                      x2={xPos}
                      y2={beamY + triH + 4}
                      stroke="#374151"
                      strokeWidth={2}
                    />
                    {[0, 4, 8, 12].map((dy) => (
                      <line
                        key={dy}
                        x1={xPos - 6}
                        y1={beamY + triH + dy}
                        x2={xPos + 6}
                        y2={beamY + triH + dy}
                        stroke="#374151"
                        strokeWidth={1}
                      />
                    ))}
                    <text
                      x={xPos}
                      y={beamY + triH + 24}
                      textAnchor="middle"
                      fontSize={9}
                      className="fill-gray-500"
                    >
                      N{sup.nodeIndex}
                    </text>
                  </g>
                );
              }

              const isRoller = sup.type === "roller";
              return (
                <g key={sup.nodeIndex}>
                  <polygon
                    points={`${xPos},${beamY} ${xPos - 8},${beamY + triH} ${xPos + 8},${beamY + triH}`}
                    fill="none"
                    stroke="#374151"
                    strokeWidth={1.5}
                  />
                  {isRoller && (
                    <circle
                      cx={xPos}
                      cy={beamY + triH + 4}
                      r={3}
                      fill="none"
                      stroke="#374151"
                      strokeWidth={1.5}
                    />
                  )}
                  <text
                    x={xPos}
                    y={beamY + triH + (isRoller ? 20 : 16)}
                    textAnchor="middle"
                    fontSize={9}
                    className="fill-gray-500"
                  >
                    N{sup.nodeIndex}
                  </text>
                </g>
              );
            })}
          </svg>
        </CardContent>
      </Card>
    </div>
  );
}
