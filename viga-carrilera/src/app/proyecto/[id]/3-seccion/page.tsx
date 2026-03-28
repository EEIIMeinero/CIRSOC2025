"use client";

import { useState } from "react";
import { useProjectStore } from "@/store/projectStore";
import {
  SectionType,
  SectionConfig,
  SectionDimensions,
  SectionProperties,
  CompactnessResult,
  RailType,
} from "@/lib/types";
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

const SECTION_TYPES: { type: SectionType; label: string; desc: string }[] = [
  { type: "A", label: "Tipo A", desc: "Laminado simple (W/IPE/HEB)" },
  { type: "B", label: "Tipo B", desc: "Armada simetrica" },
  { type: "C", label: "Tipo C", desc: "Armada asimetrica (monosimetrica)" },
  { type: "D", label: "Tipo D", desc: "Laminado + canal UPN" },
  { type: "E", label: "Tipo E", desc: "Laminado + chapa PL" },
  { type: "F", label: "Tipo F", desc: "Laminado + surge plate horizontal" },
  { type: "G", label: "Tipo G", desc: "Viga principal + surge plate + viga auxiliar" },
  { type: "H", label: "Tipo H", desc: "Seccion cajon simple" },
  { type: "I", label: "Tipo I", desc: "Seccion cajon con celosia" },
  { type: "J", label: "Tipo J", desc: "Sistema birriel" },
  { type: "K", label: "Tipo K", desc: "Seccion existente (entrada manual)" },
];

const defaultDims: SectionDimensions = {
  bfs: 200,
  tfs: 16,
  bfi: 200,
  tfi: 16,
  tw: 10,
  h: 468,
  d: 500,
};

const defaultProps: SectionProperties = {
  A: 0,
  yc: 0,
  Ix: 0,
  SxTop: 0,
  SxBot: 0,
  Zx: 0,
  Iy_eff: 0,
  iy_eff: 0,
  rts: 0,
  J: 0,
  Cw: 0,
  wDL: 0,
};

const defaultCompactness: CompactnessResult = {
  lambda_f: 0,
  lambda_pf: 0,
  lambda_rf: 0,
  flangeClass: "compact",
  lambda_w: 0,
  lambda_pw: 0,
  lambda_rw: 0,
  webClass: "compact",
};

export default function SeccionPage() {
  const { section, setSection, rail, setRail } = useProjectStore();

  const [selectedType, setSelectedType] = useState<SectionType>(
    section?.type ?? "B"
  );
  const [profileName, setProfileName] = useState(section?.profileName ?? "W460x74");
  const [dims, setDims] = useState<SectionDimensions>(section?.dims ?? defaultDims);
  const [manualProps, setManualProps] = useState<SectionProperties>(
    section?.props ?? defaultProps
  );

  const handleTypeSelect = (type: SectionType) => {
    setSelectedType(type);
  };

  const updateDim = (key: keyof SectionDimensions, value: number) => {
    const newDims = { ...dims, [key]: value };
    if (key !== "d") {
      newDims.d = newDims.tfs + newDims.h + newDims.tfi;
    }
    setDims(newDims);
  };

  const handleApplySection = () => {
    const config: SectionConfig = {
      type: selectedType,
      dims: dims,
      props: selectedType === "K" ? manualProps : defaultProps,
      compactness: defaultCompactness,
      profileName: selectedType === "A" ? profileName : undefined,
    };
    setSection(config);
  };

  const currentProps = section?.props ?? defaultProps;

  return (
    <div className="space-y-6">
      {/* Tipo de seccion */}
      <Card>
        <CardHeader>
          <CardTitle>Tipo de Seccion Transversal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {SECTION_TYPES.map((st) => (
              <div
                key={st.type}
                onClick={() => handleTypeSelect(st.type)}
                className={`cursor-pointer rounded-lg border-2 p-3 transition-colors ${
                  selectedType === st.type
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="font-semibold text-sm">{st.label}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {st.desc}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dimensiones segun tipo */}
      <Card>
        <CardHeader>
          <CardTitle>
            Dimensiones — {SECTION_TYPES.find((s) => s.type === selectedType)?.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedType === "A" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profileName">Designacion del perfil</Label>
                <Input
                  id="profileName"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Ej: W460x74, IPE400, HEB300"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Ingrese la designacion del perfil laminado. Las propiedades se
                obtendran de la base de datos de perfiles o se pueden ingresar
                manualmente a continuacion.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>d - Altura total (mm)</Label>
                  <Input
                    type="number"
                    value={dims.d}
                    onChange={(e) => updateDim("d", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>bf - Ancho ala (mm)</Label>
                  <Input
                    type="number"
                    value={dims.bfs}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setDims({ ...dims, bfs: v, bfi: v });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>tf - Espesor ala (mm)</Label>
                  <Input
                    type="number"
                    value={dims.tfs}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setDims({ ...dims, tfs: v, tfi: v });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>tw - Espesor alma (mm)</Label>
                  <Input
                    type="number"
                    value={dims.tw}
                    onChange={(e) => updateDim("tw", Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}

          {selectedType === "B" && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>hw - Altura alma (mm)</Label>
                <Input
                  type="number"
                  value={dims.h}
                  onChange={(e) => updateDim("h", Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>tw - Espesor alma (mm)</Label>
                <Input
                  type="number"
                  value={dims.tw}
                  onChange={(e) => updateDim("tw", Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>bf - Ancho ala (mm)</Label>
                <Input
                  type="number"
                  value={dims.bfs}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setDims({ ...dims, bfs: v, bfi: v });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>tf - Espesor ala (mm)</Label>
                <Input
                  type="number"
                  value={dims.tfs}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setDims({ ...dims, tfs: v, tfi: v });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>d - Altura total (mm)</Label>
                <Input
                  type="number"
                  value={dims.tfs + dims.h + dims.tfi}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
          )}

          {selectedType === "C" && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>h - Altura alma (mm)</Label>
                <Input
                  type="number"
                  value={dims.h}
                  onChange={(e) => updateDim("h", Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>tw - Espesor alma (mm)</Label>
                <Input
                  type="number"
                  value={dims.tw}
                  onChange={(e) => updateDim("tw", Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>bfs - Ancho ala superior (mm)</Label>
                <Input
                  type="number"
                  value={dims.bfs}
                  onChange={(e) => updateDim("bfs", Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>tfs - Espesor ala superior (mm)</Label>
                <Input
                  type="number"
                  value={dims.tfs}
                  onChange={(e) => updateDim("tfs", Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>bfi - Ancho ala inferior (mm)</Label>
                <Input
                  type="number"
                  value={dims.bfi}
                  onChange={(e) => updateDim("bfi", Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>tfi - Espesor ala inferior (mm)</Label>
                <Input
                  type="number"
                  value={dims.tfi}
                  onChange={(e) => updateDim("tfi", Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>d - Altura total (mm)</Label>
                <Input
                  type="number"
                  value={dims.tfs + dims.h + dims.tfi}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
          )}

          {selectedType === "K" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Ingrese manualmente todas las propiedades de la seccion.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>A - Area (cm2)</Label>
                  <Input
                    type="number"
                    value={manualProps.A}
                    onChange={(e) =>
                      setManualProps({ ...manualProps, A: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>yc - Centroide desde base (mm)</Label>
                  <Input
                    type="number"
                    value={manualProps.yc}
                    onChange={(e) =>
                      setManualProps({ ...manualProps, yc: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ix - Inercia eje fuerte (cm4)</Label>
                  <Input
                    type="number"
                    value={manualProps.Ix}
                    onChange={(e) =>
                      setManualProps({ ...manualProps, Ix: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sx+ - Modulo elastico sup (cm3)</Label>
                  <Input
                    type="number"
                    value={manualProps.SxTop}
                    onChange={(e) =>
                      setManualProps({ ...manualProps, SxTop: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sx- - Modulo elastico inf (cm3)</Label>
                  <Input
                    type="number"
                    value={manualProps.SxBot}
                    onChange={(e) =>
                      setManualProps({ ...manualProps, SxBot: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Zx - Modulo plastico (cm3)</Label>
                  <Input
                    type="number"
                    value={manualProps.Zx}
                    onChange={(e) =>
                      setManualProps({ ...manualProps, Zx: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Iy_eff - Inercia efectiva (cm4)</Label>
                  <Input
                    type="number"
                    value={manualProps.Iy_eff}
                    onChange={(e) =>
                      setManualProps({ ...manualProps, Iy_eff: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>J - Torsion St. Venant (cm4)</Label>
                  <Input
                    type="number"
                    value={manualProps.J}
                    onChange={(e) =>
                      setManualProps({ ...manualProps, J: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cw - Constante alabeo (cm6)</Label>
                  <Input
                    type="number"
                    value={manualProps.Cw}
                    onChange={(e) =>
                      setManualProps({ ...manualProps, Cw: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>wDL - Peso propio (kN/m)</Label>
                  <Input
                    type="number"
                    step={0.01}
                    value={manualProps.wDL}
                    onChange={(e) =>
                      setManualProps({ ...manualProps, wDL: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {!["A", "B", "C", "K"].includes(selectedType) && (
            <div className="rounded-lg border border-dashed border-blue-300 bg-blue-50/50 p-6 text-center text-sm text-muted-foreground">
              La configuracion detallada para el Tipo {selectedType} estara
              disponible proximamente. Por ahora, puede utilizar los Tipos A, B,
              C o K.
            </div>
          )}

          <Button onClick={handleApplySection} className="mt-4">
            Aplicar seccion
          </Button>
        </CardContent>
      </Card>

      {/* Propiedades calculadas */}
      <Card>
        <CardHeader>
          <CardTitle>Propiedades de la Seccion</CardTitle>
        </CardHeader>
        <CardContent>
          {section ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="rounded-lg border p-3">
                <div className="text-muted-foreground text-xs">A (cm2)</div>
                <div className="font-semibold">{currentProps.A.toFixed(2)}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-muted-foreground text-xs">yc (mm)</div>
                <div className="font-semibold">{currentProps.yc.toFixed(1)}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-muted-foreground text-xs">Ix (cm4)</div>
                <div className="font-semibold">{currentProps.Ix.toFixed(0)}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-muted-foreground text-xs">Sx+ (cm3)</div>
                <div className="font-semibold">{currentProps.SxTop.toFixed(1)}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-muted-foreground text-xs">Sx- (cm3)</div>
                <div className="font-semibold">{currentProps.SxBot.toFixed(1)}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-muted-foreground text-xs">Zx (cm3)</div>
                <div className="font-semibold">{currentProps.Zx.toFixed(1)}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-muted-foreground text-xs">Iy_eff (cm4)</div>
                <div className="font-semibold">{currentProps.Iy_eff.toFixed(0)}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-muted-foreground text-xs">J (cm4)</div>
                <div className="font-semibold">{currentProps.J.toFixed(2)}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-muted-foreground text-xs">Cw (cm6)</div>
                <div className="font-semibold">{currentProps.Cw.toFixed(0)}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-muted-foreground text-xs">wDL (kN/m)</div>
                <div className="font-semibold">{currentProps.wDL.toFixed(3)}</div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-6">
              Configure y aplique una seccion para ver las propiedades calculadas.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Carril */}
      <Card>
        <CardHeader>
          <CardTitle>Configuracion del Carril</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tipo de carril</Label>
              <Select
                value={rail.type}
                onValueChange={(v) => setRail({ ...rail, type: v as RailType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin carril</SelectItem>
                  <SelectItem value="SA">Carril SA (ASCE)</SelectItem>
                  <SelectItem value="SF">Carril SF (cuadrado)</SelectItem>
                  <SelectItem value="IRAM">Carril IRAM</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Excentricidad (mm)</Label>
              <Input
                type="number"
                value={rail.eccentricity}
                onChange={(e) =>
                  setRail({ ...rail, eccentricity: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Conexion</Label>
              <Select
                value={rail.connection}
                onValueChange={(v) =>
                  setRail({
                    ...rail,
                    connection: v as "continuous" | "discontinuous",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="continuous">Continuo</SelectItem>
                  <SelectItem value="discontinuous">Discontinuo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {rail.type === "custom" && (
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="space-y-2">
                <Label>Altura hr (mm)</Label>
                <Input
                  type="number"
                  value={rail.hr}
                  onChange={(e) =>
                    setRail({ ...rail, hr: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Ancho cabeza br (mm)</Label>
                <Input
                  type="number"
                  value={rail.br}
                  onChange={(e) =>
                    setRail({ ...rail, br: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Espesor alma tw_r (mm)</Label>
                <Input
                  type="number"
                  value={rail.tw_r}
                  onChange={(e) =>
                    setRail({ ...rail, tw_r: Number(e.target.value) })
                  }
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
