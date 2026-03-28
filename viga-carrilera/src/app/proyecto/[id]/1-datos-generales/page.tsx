"use client";

import { useState } from "react";
import { useProjectStore } from "@/store/projectStore";
import { Material, MaterialGroup, CmaaClass, CraneType } from "@/lib/types";
import { getMaterialsByGroup } from "@/lib/db/materials";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CMAA_DESCRIPTIONS: Record<CmaaClass, string> = {
  A: "Clase A — Servicio poco frecuente (talleres, salas de máquinas)",
  B: "Clase B — Servicio liviano (depósitos, montaje liviano)",
  C: "Clase C — Servicio moderado (fabricación, plantas generales)",
  D: "Clase D — Servicio pesado (fundiciones, uso frecuente)",
  E: "Clase E — Servicio severo (acerías, laminadoras)",
  F: "Clase F — Servicio continuo severo (colada continua, gran industria)",
};

export default function DatosGeneralesPage() {
  const { general, setGeneral } = useProjectStore();
  const [materialTab, setMaterialTab] = useState<string>(general.material.group);
  const [customFy, setCustomFy] = useState(250);
  const [customFu, setCustomFu] = useState(400);
  const [customE, setCustomE] = useState(200000);
  const [customG, setCustomG] = useState(77000);

  const handleSelectMaterial = (mat: Material) => {
    setGeneral({ material: mat });
  };

  const handleApplyCustomMaterial = () => {
    const custom: Material = {
      id: "custom-manual",
      group: "CUSTOM",
      name: "Material personalizado",
      designation: "CUSTOM",
      Fy: customFy,
      Fu: customFu,
      E: customE,
      G: customG,
      gamma: 78.5,
      norm: "Definido por el usuario",
    };
    setGeneral({ material: custom });
  };

  const renderMaterialCards = (group: MaterialGroup) => {
    const mats = getMaterialsByGroup(group);
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {mats.map((mat) => (
          <div
            key={mat.id}
            onClick={() => handleSelectMaterial(mat)}
            className={`cursor-pointer rounded-lg border-2 p-3 transition-colors ${
              general.material.id === mat.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
            }`}
          >
            <div className="font-semibold text-sm">{mat.name}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Fy = {mat.Fy} MPa | Fu = {mat.Fu} MPa
            </div>
            <div className="text-xs text-muted-foreground">{mat.norm}</div>
            {mat.notes && (
              <div className="text-xs text-muted-foreground italic mt-0.5">
                {mat.notes}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Identificacion del Proyecto */}
      <Card>
        <CardHeader>
          <CardTitle>Identificacion del Proyecto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Nombre del proyecto</Label>
              <Input
                id="projectName"
                value={general.projectName}
                onChange={(e) => setGeneral({ projectName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expediente">Expediente</Label>
              <Input
                id="expediente"
                value={general.expediente ?? ""}
                onChange={(e) => setGeneral({ expediente: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="engineer">Profesional responsable</Label>
              <Input
                id="engineer"
                value={general.engineer ?? ""}
                onChange={(e) => setGeneral({ engineer: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license">Matricula</Label>
              <Input
                id="license"
                value={general.license ?? ""}
                onChange={(e) => setGeneral({ license: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <Input
                id="company"
                value={general.company ?? ""}
                onChange={(e) => setGeneral({ company: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={general.date}
                onChange={(e) => setGeneral({ date: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="comments">Comentarios</Label>
            <textarea
              id="comments"
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={general.comments ?? ""}
              onChange={(e) => setGeneral({ comments: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Seleccion de Material */}
      <Card>
        <CardHeader>
          <CardTitle>Material</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={materialTab} onValueChange={setMaterialTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="AR">Argentina</TabsTrigger>
              <TabsTrigger value="US">USA</TabsTrigger>
              <TabsTrigger value="EU">Europa</TabsTrigger>
              <TabsTrigger value="CUSTOM">Manual</TabsTrigger>
            </TabsList>
            <TabsContent value="AR" className="mt-4">
              {renderMaterialCards("AR")}
            </TabsContent>
            <TabsContent value="US" className="mt-4">
              {renderMaterialCards("US")}
            </TabsContent>
            <TabsContent value="EU" className="mt-4">
              {renderMaterialCards("EU")}
            </TabsContent>
            <TabsContent value="CUSTOM" className="mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customFy">Fy (MPa)</Label>
                  <Input
                    id="customFy"
                    type="number"
                    value={customFy}
                    onChange={(e) => setCustomFy(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customFu">Fu (MPa)</Label>
                  <Input
                    id="customFu"
                    type="number"
                    value={customFu}
                    onChange={(e) => setCustomFu(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customE">E (MPa)</Label>
                  <Input
                    id="customE"
                    type="number"
                    value={customE}
                    onChange={(e) => setCustomE(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customG">G (MPa)</Label>
                  <Input
                    id="customG"
                    type="number"
                    value={customG}
                    onChange={(e) => setCustomG(Number(e.target.value))}
                  />
                </div>
              </div>
              <Button className="mt-4" onClick={handleApplyCustomMaterial}>
                Aplicar material personalizado
              </Button>
            </TabsContent>
          </Tabs>

          {/* Propiedades del material seleccionado */}
          <div className="rounded-lg border bg-blue-50 p-4 mt-4">
            <h4 className="font-semibold text-sm mb-2">
              Material seleccionado: {general.material.name}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Fy:</span>{" "}
                <span className="font-medium">{general.material.Fy} MPa</span>
              </div>
              <div>
                <span className="text-muted-foreground">Fu:</span>{" "}
                <span className="font-medium">{general.material.Fu} MPa</span>
              </div>
              <div>
                <span className="text-muted-foreground">E:</span>{" "}
                <span className="font-medium">{general.material.E} MPa</span>
              </div>
              <div>
                <span className="text-muted-foreground">G:</span>{" "}
                <span className="font-medium">{general.material.G} MPa</span>
              </div>
              <div>
                <span className="text-muted-foreground">gamma:</span>{" "}
                <span className="font-medium">
                  {general.material.gamma} kN/m3
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tipo de grua y Clase CMAA */}
      <Card>
        <CardHeader>
          <CardTitle>Tipo de Grua y Clasificacion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Tipo de grua</Label>
              <Select
                value={general.craneType}
                onValueChange={(v) => setGeneral({ craneType: v as CraneType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top-running">
                    Puente grua superior (top-running)
                  </SelectItem>
                  <SelectItem value="underhung">
                    Grua suspendida (underhung)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Clase CMAA</Label>
              <Select
                value={general.cmaaClass}
                onValueChange={(v) =>
                  setGeneral({ cmaaClass: v as CmaaClass })
                }
              >
                <SelectTrigger>
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
          </div>
          <div className="rounded-lg border p-3 bg-muted/50 text-sm">
            {CMAA_DESCRIPTIONS[general.cmaaClass]}
          </div>
        </CardContent>
      </Card>

      {/* Normativa */}
      <Card>
        <CardHeader>
          <CardTitle>Normativa Aplicable</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 p-3 rounded-lg border">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="font-medium">CIRSOC 301-2018</span>
              <span className="text-muted-foreground">
                — Estructuras de acero
              </span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg border">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="font-medium">CIRSOC 101-2025</span>
              <span className="text-muted-foreground">
                — Cargas y combinaciones
              </span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg border">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="font-medium">AISC 360-22</span>
              <span className="text-muted-foreground">
                — Specification for Structural Steel Buildings
              </span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg border">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="font-medium">AISC DG7-2019</span>
              <span className="text-muted-foreground">
                — Industrial Buildings &amp; Crane Runway Girders
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
