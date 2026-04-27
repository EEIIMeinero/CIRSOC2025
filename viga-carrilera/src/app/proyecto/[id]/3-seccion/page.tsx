"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useProjectStore } from "@/store/projectStore";
import {
  SectionType,
  SectionConfig,
  SectionDimensions,
  SectionProperties,
  CompactnessResult,
  RailType,
} from "@/lib/types";
import { calcSectionProps } from "@/lib/calc/sections";
import { checkCompactness } from "@/lib/calc/checks/compactness";
import {
  getProfileNames,
  type SteelProfile,
  ALL_PROFILES,
} from "@/lib/db/profiles";
import { getRailsByType, type RailProfile } from "@/lib/db/rails";
import { SvgSection } from "@/components/visualization/SvgSection";
import { CompactnessGraph } from "@/components/conceptual-graphs/CompactnessGraph";
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
  A: 0, yc: 0, Ix: 0, SxTop: 0, SxBot: 0, Zx: 0,
  Iy_eff: 0, iy_eff: 0, rts: 0, J: 0, Cw: 0, wDL: 0,
};

const defaultCompactness: CompactnessResult = {
  lambda_f: 0, lambda_pf: 0, lambda_rf: 0, flangeClass: "compact",
  lambda_w: 0, lambda_pw: 0, lambda_rw: 0, webClass: "compact",
};

export default function SeccionPage() {
  const { section, setSection, rail, setRail, general } = useProjectStore();

  const [selectedType, setSelectedType] = useState<SectionType>(
    section?.type ?? "B"
  );
  const [profileName, setProfileName] = useState(section?.profileName ?? "");
  const [profileSearch, setProfileSearch] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [dims, setDims] = useState<SectionDimensions>(section?.dims ?? defaultDims);
  const [manualProps, setManualProps] = useState<SectionProperties>(
    section?.props ?? defaultProps
  );
  const [calcProps, setCalcProps] = useState<SectionProperties>(
    section?.props ?? defaultProps
  );
  const [compactness, setCompactness] = useState<CompactnessResult>(
    section?.compactness ?? defaultCompactness
  );

  // Composite section extra fields
  const [upnProfile, setUpnProfile] = useState(section?.upnProfile ?? "");
  const [plateBf, setPlateBf] = useState(section?.plateBf ?? 200);
  const [plateTf, setPlateTf] = useState(section?.plateTf ?? 16);
  const [surgeBf, setSurgeBf] = useState(section?.surgeBf ?? 300);
  const [surgeTf, setSurgeTf] = useState(section?.surgeTf ?? 12);
  const [auxProfile, setAuxProfile] = useState(section?.auxProfile ?? "");
  const [auxSep, setAuxSep] = useState(section?.auxSep ?? 500);
  const [bInt, setBInt] = useState(section?.bInt ?? 300);
  // companionProfile for type J uses profileName directly
  const [companionSep, setCompanionSep] = useState(section?.companionSep ?? 600);

  const Fy = general.material.Fy;
  const E = general.material.E;

  // Profile names grouped by series for the dropdown
  const profileGroups = useMemo(() => getProfileNames(), []);

  // Rail profiles from database
  const railProfilesSA = useMemo(() => getRailsByType("SA"), []);
  const railProfilesSF = useMemo(() => getRailsByType("SF"), []);
  const railProfilesIRAM = useMemo(() => getRailsByType("IRAM"), []);

  // Filtered profiles for search
  const filteredProfiles = useMemo(() => {
    if (!profileSearch.trim()) return ALL_PROFILES;
    const q = profileSearch.trim().toUpperCase();
    return ALL_PROFILES.filter((p) =>
      p.name.toUpperCase().includes(q)
    );
  }, [profileSearch]);

  // Compute section properties whenever dims change
  const computeProps = useCallback(
    (type: SectionType, currentDims: SectionDimensions): SectionProperties => {
      if (type === "K") return manualProps;
      try {
        const config: SectionConfig = {
          type,
          dims: currentDims,
          props: defaultProps,
          compactness: defaultCompactness,
          upnProfile: upnProfile || undefined,
          plateBf,
          plateTf,
          surgeBf,
          surgeTf,
          auxProfile: auxProfile || undefined,
          auxSep,
          bInt,
          companionProfile: profileName || undefined,
          companionSep,
        };
        return calcSectionProps(config);
      } catch {
        return defaultProps;
      }
    },
    [manualProps, upnProfile, plateBf, plateTf, surgeBf, surgeTf, auxProfile, auxSep, bInt, profileName, companionSep]
  );

  // Recalculate on dims / type change
  useEffect(() => {
    if (selectedType === "K") {
      setCalcProps(manualProps);
      return;
    }
    if (selectedType === "A" && profileName) {
      return;
    }
    if (["B", "C", "D", "E", "F", "G", "H", "I", "J"].includes(selectedType)) {
      const props = computeProps(selectedType, dims);
      setCalcProps(props);
    }
  }, [dims, selectedType, computeProps, manualProps, profileName, surgeBf, surgeTf, auxSep, bInt, companionSep]);

  // Recalculate compactness whenever dims change
  useEffect(() => {
    if (selectedType === "K") return;
    if (dims.bfs > 0 && dims.tfs > 0 && dims.h > 0 && dims.tw > 0) {
      const result = checkCompactness(dims, Fy, E);
      setCompactness(result);
    }
  }, [dims, Fy, E, selectedType]);

  // Update manualProps -> calcProps for type K
  useEffect(() => {
    if (selectedType === "K") {
      setCalcProps(manualProps);
    }
  }, [manualProps, selectedType]);

  const handleTypeSelect = (type: SectionType) => {
    setSelectedType(type);
    if (type === "A") {
      setProfileName("");
      setProfileSearch("");
    }
  };

  const handleProfileSelect = (profile: SteelProfile) => {
    setProfileName(profile.name);
    setProfileSearch("");
    setShowProfileDropdown(false);

    // Auto-fill dimensions from profile
    const newDims: SectionDimensions = {
      bfs: profile.bf,
      tfs: profile.tf,
      bfi: profile.bf,
      tfi: profile.tf,
      tw: profile.tw,
      h: profile.h,
      d: profile.d,
    };
    setDims(newDims);

    // Auto-fill section properties from profile database
    // Use calcSectionProps for consistency (it handles rts, iy_eff etc.)
    const config: SectionConfig = {
      type: "A",
      dims: newDims,
      props: defaultProps,
      compactness: defaultCompactness,
      profileName: profile.name,
    };
    const props = calcSectionProps(config);
    setCalcProps(props);

    // Compactness
    const comp = checkCompactness(newDims, Fy, E);
    setCompactness(comp);
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
      props: calcProps,
      compactness: compactness,
      profileName: ["A", "D", "E", "F", "G", "J"].includes(selectedType) ? profileName : undefined,
      upnProfile: selectedType === "D" ? upnProfile : undefined,
      plateBf: selectedType === "E" ? plateBf : undefined,
      plateTf: selectedType === "E" ? plateTf : undefined,
      surgeBf: ["F", "G"].includes(selectedType) ? surgeBf : undefined,
      surgeTf: ["F", "G"].includes(selectedType) ? surgeTf : undefined,
      auxProfile: selectedType === "G" ? auxProfile : undefined,
      auxSep: selectedType === "G" ? auxSep : undefined,
      bInt: ["H", "I"].includes(selectedType) ? bInt : undefined,
      companionProfile: selectedType === "J" ? profileName : undefined,
      companionSep: selectedType === "J" ? companionSep : undefined,
    };
    setSection(config);
  };

  const handleRailSelect = (railProfile: RailProfile) => {
    setRail({
      ...rail,
      designation: railProfile.name,
      hr: railProfile.hr,
      br: railProfile.br,
      tw_r: railProfile.tw_r,
    });
  };

  const hasValidProps = calcProps.A > 0;
  const hasValidDims = dims.d > 0 && dims.bfs > 0 && dims.tw > 0;

  return (
    <div className="space-y-6">
      {/* Tipo de seccion */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-blue-400">Tipo de Seccion Transversal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {SECTION_TYPES.map((st) => (
              <div
                key={st.type}
                onClick={() => handleTypeSelect(st.type)}
                className={`cursor-pointer rounded-lg border-2 p-3 transition-colors ${
                  selectedType === st.type
                    ? "border-blue-500 bg-blue-950/50"
                    : "border-slate-700 hover:border-blue-300"
                }`}
              >
                <div className="font-semibold text-sm text-slate-200">{st.label}</div>
                <div className="text-xs text-slate-400 mt-1">
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
                <Label htmlFor="profileSearch">Seleccionar perfil laminado</Label>
                <div className="relative">
                  <Input
                    id="profileSearch"
                    value={profileName || profileSearch}
                    onChange={(e) => {
                      setProfileSearch(e.target.value);
                      setProfileName("");
                      setShowProfileDropdown(true);
                    }}
                    onFocus={() => setShowProfileDropdown(true)}
                    placeholder="Buscar perfil... (ej: IPE 400, HEB 300, W36x150)"
                    autoComplete="off"
                  />
                  {showProfileDropdown && (
                    <div className="absolute z-50 w-full mt-1 max-h-80 overflow-y-auto bg-slate-800 border border-slate-700 rounded-lg shadow-lg">
                      {Object.entries(profileGroups).map(([series, _names]) => {
                        const filtered = filteredProfiles.filter(
                          (p) => p.series === series
                        );
                        if (filtered.length === 0) return null;
                        return (
                          <div key={series}>
                            <div className="px-3 py-1.5 text-xs font-bold text-slate-400 bg-slate-900 sticky top-0">
                              {series}
                            </div>
                            {filtered.map((p) => (
                              <div
                                key={p.name}
                                onClick={() => handleProfileSelect(p)}
                                className={`px-3 py-2 text-sm cursor-pointer hover:bg-slate-700 transition-colors ${
                                  profileName === p.name ? "bg-blue-950 font-semibold text-blue-300" : ""
                                }`}
                              >
                                <span className="font-medium">{p.name}</span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  d={p.d} bf={p.bf} tf={p.tf} tw={p.tw} — {p.weight} kg/m
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                      {filteredProfiles.length === 0 && (
                        <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                          No se encontraron perfiles
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* Click outside to close */}
                {showProfileDropdown && (
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProfileDropdown(false)}
                  />
                )}
              </div>

              {profileName && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="text-sm">
                    <span className="text-muted-foreground">d = </span>
                    <span className="font-semibold">{dims.d} mm</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">bf = </span>
                    <span className="font-semibold">{dims.bfs} mm</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">tf = </span>
                    <span className="font-semibold">{dims.tfs} mm</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">tw = </span>
                    <span className="font-semibold">{dims.tw} mm</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">h = </span>
                    <span className="font-semibold">{dims.h} mm</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Peso = </span>
                    <span className="font-semibold">{(calcProps.wDL / 9.81 * 1000).toFixed(1)} kg/m</span>
                  </div>
                </div>
              )}
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
                    const newDims = { ...dims, bfs: v, bfi: v };
                    newDims.d = newDims.tfs + newDims.h + newDims.tfi;
                    setDims(newDims);
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
                    const newDims = { ...dims, tfs: v, tfi: v };
                    newDims.d = newDims.tfs + newDims.h + newDims.tfi;
                    setDims(newDims);
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
                  <Label>rts (mm)</Label>
                  <Input
                    type="number"
                    value={manualProps.rts}
                    onChange={(e) =>
                      setManualProps({ ...manualProps, rts: Number(e.target.value) })
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
              {/* Dimensions for visualization in K mode */}
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground mb-3">
                  Dimensiones para visualizacion (opcional):
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>d (mm)</Label>
                    <Input
                      type="number"
                      value={dims.d}
                      onChange={(e) => updateDim("d", Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>bfs (mm)</Label>
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
                    <Label>tf (mm)</Label>
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
                    <Label>tw (mm)</Label>
                    <Input
                      type="number"
                      value={dims.tw}
                      onChange={(e) => updateDim("tw", Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Type D: Rolled I + UPN channel */}
          {selectedType === "D" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Perfil I laminado con canal UPN soldado sobre ala superior.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Perfil base (I)</Label>
                  <div className="relative">
                    <Input
                      value={profileName || profileSearch}
                      onChange={(e) => { setProfileSearch(e.target.value); setProfileName(""); setShowProfileDropdown(true); }}
                      onFocus={() => setShowProfileDropdown(true)}
                      placeholder="Buscar perfil base..."
                    />
                    {showProfileDropdown && (
                      <div className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto bg-slate-800 border border-slate-700 rounded-lg shadow-lg">
                        {filteredProfiles.map((p) => (
                          <div key={p.name} onClick={() => handleProfileSelect(p)} className="px-3 py-1.5 text-sm cursor-pointer hover:bg-blue-50">
                            {p.name} <span className="text-xs text-muted-foreground">d={p.d} bf={p.bf}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Canal UPN (designacion)</Label>
                  <Input value={upnProfile} onChange={(e) => setUpnProfile(e.target.value)} placeholder="Ej: UPN 200" />
                </div>
              </div>
              {profileName && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <DimInput label="h - Altura alma (mm)" value={dims.h} onChange={(v) => updateDim("h", v)} />
                  <DimInput label="tw - Espesor alma (mm)" value={dims.tw} onChange={(v) => updateDim("tw", v)} />
                  <DimInput label="bfs - Ancho ala sup (mm)" value={dims.bfs} onChange={(v) => updateDim("bfs", v)} />
                  <DimInput label="tfs - Espesor ala sup (mm)" value={dims.tfs} onChange={(v) => updateDim("tfs", v)} />
                  <DimInput label="bfi - Ancho ala inf (mm)" value={dims.bfi} onChange={(v) => updateDim("bfi", v)} />
                  <DimInput label="tfi - Espesor ala inf (mm)" value={dims.tfi} onChange={(v) => updateDim("tfi", v)} />
                </div>
              )}
            </div>
          )}

          {/* Type E: Rolled I + cover plate */}
          {selectedType === "E" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Perfil I laminado con chapa PL soldada sobre ala superior.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label>Perfil base (I)</Label>
                  <div className="relative">
                    <Input
                      value={profileName || profileSearch}
                      onChange={(e) => { setProfileSearch(e.target.value); setProfileName(""); setShowProfileDropdown(true); }}
                      onFocus={() => setShowProfileDropdown(true)}
                      placeholder="Buscar perfil base..."
                    />
                    {showProfileDropdown && (
                      <div className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto bg-slate-800 border border-slate-700 rounded-lg shadow-lg">
                        {filteredProfiles.map((p) => (
                          <div key={p.name} onClick={() => handleProfileSelect(p)} className="px-3 py-1.5 text-sm cursor-pointer hover:bg-blue-50">
                            {p.name} <span className="text-xs text-muted-foreground">d={p.d} bf={p.bf}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <DimInput label="Ancho chapa PL (mm)" value={plateBf} onChange={setPlateBf} />
                <DimInput label="Espesor chapa PL (mm)" value={plateTf} onChange={setPlateTf} />
              </div>
              {profileName && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <DimInput label="h - Altura alma (mm)" value={dims.h} onChange={(v) => updateDim("h", v)} />
                  <DimInput label="tw - Espesor alma (mm)" value={dims.tw} onChange={(v) => updateDim("tw", v)} />
                  <DimInput label="bfs - Ancho ala sup (mm)" value={dims.bfs} onChange={(v) => updateDim("bfs", v)} />
                  <DimInput label="tfs - Espesor ala sup (mm)" value={dims.tfs} onChange={(v) => updateDim("tfs", v)} />
                </div>
              )}
            </div>
          )}

          {/* Type F: Rolled I + surge plate */}
          {selectedType === "F" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Perfil I con chapa horizontal (surge plate) soldada lateral al ala superior.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label>Perfil base (I)</Label>
                  <div className="relative">
                    <Input
                      value={profileName || profileSearch}
                      onChange={(e) => { setProfileSearch(e.target.value); setProfileName(""); setShowProfileDropdown(true); }}
                      onFocus={() => setShowProfileDropdown(true)}
                      placeholder="Buscar perfil base..."
                    />
                    {showProfileDropdown && (
                      <div className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto bg-slate-800 border border-slate-700 rounded-lg shadow-lg">
                        {filteredProfiles.map((p) => (
                          <div key={p.name} onClick={() => handleProfileSelect(p)} className="px-3 py-1.5 text-sm cursor-pointer hover:bg-blue-50">
                            {p.name} <span className="text-xs text-muted-foreground">d={p.d} bf={p.bf}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <DimInput label="Ancho surge plate (mm)" value={surgeBf} onChange={setSurgeBf} />
                <DimInput label="Espesor surge plate (mm)" value={surgeTf} onChange={setSurgeTf} />
              </div>
              {profileName && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <DimInput label="h - Altura alma (mm)" value={dims.h} onChange={(v) => updateDim("h", v)} />
                  <DimInput label="tw (mm)" value={dims.tw} onChange={(v) => updateDim("tw", v)} />
                </div>
              )}
            </div>
          )}

          {/* Type G: Main + surge plate + auxiliary beam */}
          {selectedType === "G" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Viga principal + chapa horizontal (surge plate) + viga auxiliar lateral.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Perfil principal (I)</Label>
                  <div className="relative">
                    <Input
                      value={profileName || profileSearch}
                      onChange={(e) => { setProfileSearch(e.target.value); setProfileName(""); setShowProfileDropdown(true); }}
                      onFocus={() => setShowProfileDropdown(true)}
                      placeholder="Buscar perfil principal..."
                    />
                    {showProfileDropdown && (
                      <div className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto bg-slate-800 border border-slate-700 rounded-lg shadow-lg">
                        {filteredProfiles.map((p) => (
                          <div key={p.name} onClick={() => handleProfileSelect(p)} className="px-3 py-1.5 text-sm cursor-pointer hover:bg-blue-50">
                            {p.name} <span className="text-xs text-muted-foreground">d={p.d} bf={p.bf}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Perfil auxiliar</Label>
                  <Input value={auxProfile} onChange={(e) => setAuxProfile(e.target.value)} placeholder="Ej: IPE 200" />
                </div>
                <DimInput label="Separacion entre vigas (mm)" value={auxSep} onChange={setAuxSep} />
                <DimInput label="Ancho surge plate (mm)" value={surgeBf} onChange={setSurgeBf} />
                <DimInput label="Espesor surge plate (mm)" value={surgeTf} onChange={setSurgeTf} />
              </div>
              {profileName && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <DimInput label="h - Altura alma (mm)" value={dims.h} onChange={(v) => updateDim("h", v)} />
                  <DimInput label="tw (mm)" value={dims.tw} onChange={(v) => updateDim("tw", v)} />
                  <DimInput label="bfs (mm)" value={dims.bfs} onChange={(v) => updateDim("bfs", v)} />
                  <DimInput label="tfs (mm)" value={dims.tfs} onChange={(v) => updateDim("tfs", v)} />
                </div>
              )}
            </div>
          )}

          {/* Type H: Simple box section */}
          {selectedType === "H" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Seccion cajon soldada con dos almas, dos alas.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <DimInput label="h - Altura alma (mm)" value={dims.h} onChange={(v) => updateDim("h", v)} />
                <DimInput label="tw - Espesor alma (mm)" value={dims.tw} onChange={(v) => updateDim("tw", v)} />
                <DimInput label="bfs - Ancho ala sup (mm)" value={dims.bfs} onChange={(v) => { setDims({...dims, bfs: v, bfi: v}); }} />
                <DimInput label="tfs - Espesor ala sup (mm)" value={dims.tfs} onChange={(v) => { setDims({...dims, tfs: v, tfi: v}); }} />
                <DimInput label="bInt - Ancho interior (mm)" value={bInt} onChange={setBInt} />
                <div className="space-y-2">
                  <Label>d - Altura total (mm)</Label>
                  <Input type="number" value={dims.tfs + dims.h + dims.tfi} disabled className="bg-muted" />
                </div>
              </div>
            </div>
          )}

          {/* Type I: Box with lattice */}
          {selectedType === "I" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Seccion cajon con celosia lateral (alma tipo Vierendeel o Warren).</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <DimInput label="h - Altura alma (mm)" value={dims.h} onChange={(v) => updateDim("h", v)} />
                <DimInput label="tw - Espesor equiv. alma (mm)" value={dims.tw} onChange={(v) => updateDim("tw", v)} />
                <DimInput label="bfs - Ancho ala sup (mm)" value={dims.bfs} onChange={(v) => { setDims({...dims, bfs: v, bfi: v}); }} />
                <DimInput label="tfs - Espesor ala (mm)" value={dims.tfs} onChange={(v) => { setDims({...dims, tfs: v, tfi: v}); }} />
                <DimInput label="bInt - Ancho interior (mm)" value={bInt} onChange={setBInt} />
                <div className="space-y-2">
                  <Label>d - Altura total (mm)</Label>
                  <Input type="number" value={dims.tfs + dims.h + dims.tfi} disabled className="bg-muted" />
                </div>
              </div>
            </div>
          )}

          {/* Type J: Twin beam system */}
          {selectedType === "J" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Sistema birriel — dos vigas paralelas vinculadas por arriostramientos.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label>Perfil de cada viga</Label>
                  <div className="relative">
                    <Input
                      value={profileName || profileSearch}
                      onChange={(e) => { setProfileSearch(e.target.value); setProfileName(""); setShowProfileDropdown(true); }}
                      onFocus={() => setShowProfileDropdown(true)}
                      placeholder="Buscar perfil..."
                    />
                    {showProfileDropdown && (
                      <div className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto bg-slate-800 border border-slate-700 rounded-lg shadow-lg">
                        {filteredProfiles.map((p) => (
                          <div key={p.name} onClick={() => handleProfileSelect(p)} className="px-3 py-1.5 text-sm cursor-pointer hover:bg-blue-50">
                            {p.name} <span className="text-xs text-muted-foreground">d={p.d} bf={p.bf}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <DimInput label="Separacion entre ejes (mm)" value={companionSep} onChange={setCompanionSep} />
              </div>
              {profileName && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="text-sm"><span className="text-muted-foreground">d = </span><span className="font-semibold">{dims.d} mm</span></div>
                  <div className="text-sm"><span className="text-muted-foreground">bf = </span><span className="font-semibold">{dims.bfs} mm</span></div>
                  <div className="text-sm"><span className="text-muted-foreground">tf = </span><span className="font-semibold">{dims.tfs} mm</span></div>
                  <div className="text-sm"><span className="text-muted-foreground">tw = </span><span className="font-semibold">{dims.tw} mm</span></div>
                </div>
              )}
            </div>
          )}

          <Button onClick={handleApplySection} className="mt-4">
            Aplicar seccion
          </Button>

          {section && (
            <span className="ml-3 text-sm text-green-600 font-medium">
              Seccion aplicada: Tipo {section.type}
              {section.profileName ? ` — ${section.profileName}` : ""}
            </span>
          )}
        </CardContent>
      </Card>

      {/* Visualization + Properties side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Section visualization */}
        {hasValidDims && (
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Seccion Transversal</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <SvgSection
                dims={dims}
                props={hasValidProps ? calcProps : undefined}
                railConfig={rail.type !== "none" && rail.hr > 0 ? { hr: rail.hr, br: rail.br } : undefined}
                sectionType={selectedType}
                width={280}
                height={360}
              />
            </CardContent>
          </Card>
        )}

        {/* Properties table */}
        <Card className={hasValidDims ? "lg:col-span-2" : "lg:col-span-3"}>
          <CardHeader>
            <CardTitle>Propiedades de la Seccion</CardTitle>
          </CardHeader>
          <CardContent>
            {hasValidProps ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <PropCell label="A" value={calcProps.A.toFixed(2)} unit="cm2" />
                <PropCell label="yc" value={calcProps.yc.toFixed(1)} unit="mm" />
                <PropCell label="Ix" value={calcProps.Ix.toFixed(0)} unit="cm4" />
                <PropCell label="Sx+" value={calcProps.SxTop.toFixed(1)} unit="cm3" />
                <PropCell label="Sx-" value={calcProps.SxBot.toFixed(1)} unit="cm3" />
                <PropCell label="Zx" value={calcProps.Zx.toFixed(1)} unit="cm3" />
                <PropCell label="Iy_eff" value={calcProps.Iy_eff.toFixed(0)} unit="cm4" />
                <PropCell label="J" value={calcProps.J.toFixed(2)} unit="cm4" />
                <PropCell label="Cw" value={calcProps.Cw.toFixed(0)} unit="cm6" />
                <PropCell label="rts" value={calcProps.rts.toFixed(1)} unit="mm" />
                <PropCell label="wDL" value={calcProps.wDL.toFixed(3)} unit="kN/m" />
                <PropCell label="iy_eff" value={(calcProps.iy_eff ?? 0).toFixed(1)} unit="mm" />
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-6">
                {selectedType === "A"
                  ? "Seleccione un perfil de la base de datos para ver las propiedades."
                  : selectedType === "K"
                  ? "Ingrese las propiedades manualmente arriba."
                  : "Ingrese las dimensiones para calcular las propiedades en tiempo real."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Compactness check */}
      {selectedType !== "K" && hasValidDims && dims.tfs > 0 && dims.tw > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Clasificacion de Compacidad — CIRSOC 301 Tabla B4.1b</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="font-semibold">Ala (Flange)</div>
                <div>
                  <span className="text-muted-foreground">lambda_f = </span>
                  {compactness.lambda_f.toFixed(2)}
                  <span className="text-muted-foreground"> | lambda_pf = </span>
                  {compactness.lambda_pf.toFixed(2)}
                  <span className="text-muted-foreground"> | lambda_rf = </span>
                  {compactness.lambda_rf.toFixed(2)}
                </div>
                <div>
                  Clasificacion:{" "}
                  <span
                    className={`font-bold ${
                      compactness.flangeClass === "compact"
                        ? "text-green-600"
                        : compactness.flangeClass === "noncompact"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {compactness.flangeClass === "compact"
                      ? "COMPACTA"
                      : compactness.flangeClass === "noncompact"
                      ? "NO COMPACTA"
                      : "ESBELTA"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-semibold">Alma (Web)</div>
                <div>
                  <span className="text-muted-foreground">lambda_w = </span>
                  {compactness.lambda_w.toFixed(2)}
                  <span className="text-muted-foreground"> | lambda_pw = </span>
                  {compactness.lambda_pw.toFixed(2)}
                  <span className="text-muted-foreground"> | lambda_rw = </span>
                  {compactness.lambda_rw.toFixed(2)}
                </div>
                <div>
                  Clasificacion:{" "}
                  <span
                    className={`font-bold ${
                      compactness.webClass === "compact"
                        ? "text-green-600"
                        : compactness.webClass === "noncompact"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {compactness.webClass === "compact"
                      ? "COMPACTA"
                      : compactness.webClass === "noncompact"
                      ? "NO COMPACTA"
                      : "ESBELTA"}
                  </span>
                </div>
              </div>
            </div>
            <CompactnessGraph compactness={compactness} width={500} height={140} />
          </CardContent>
        </Card>
      )}

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

            {/* Designation selector from database */}
            {rail.type === "SA" && (
              <div className="space-y-2">
                <Label>Designacion SA</Label>
                <Select value={rail.designation ?? ""} onValueChange={(v) => {
                  const rp = railProfilesSA.find((r) => r.name === v);
                  if (rp) handleRailSelect(rp);
                }}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    {railProfilesSA.map((r) => (
                      <SelectItem key={r.name} value={r.name}>{r.name} — {r.hr}×{r.br}mm, {r.weight} kg/m</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {rail.type === "SF" && (
              <div className="space-y-2">
                <Label>Designacion SF</Label>
                <Select value={rail.designation ?? ""} onValueChange={(v) => {
                  const rp = railProfilesSF.find((r) => r.name === v);
                  if (rp) handleRailSelect(rp);
                }}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    {railProfilesSF.map((r) => (
                      <SelectItem key={r.name} value={r.name}>{r.name} — {r.hr}×{r.br}mm, {r.weight} kg/m</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {rail.type === "IRAM" && (
              <div className="space-y-2">
                <Label>Designacion IRAM</Label>
                <Select value={rail.designation ?? ""} onValueChange={(v) => {
                  const rp = railProfilesIRAM.find((r) => r.name === v);
                  if (rp) handleRailSelect(rp);
                }}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    {railProfilesIRAM.map((r) => (
                      <SelectItem key={r.name} value={r.name}>{r.name} — h={r.hr} br={r.br} base={r.bbase}mm, {r.weight} kg/m</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Conexion</Label>
              <Select
                value={rail.connection}
                onValueChange={(v) => setRail({ ...rail, connection: v as "continuous" | "discontinuous" })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="continuous">Continuo</SelectItem>
                  <SelectItem value="discontinuous">Discontinuo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Rail dimensions — always shown when type != none */}
          {rail.type !== "none" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="space-y-2">
                <Label>Altura hr (mm)</Label>
                <Input type="number" value={rail.hr} onChange={(e) => setRail({ ...rail, hr: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Ancho cabeza br (mm)</Label>
                <Input type="number" value={rail.br} onChange={(e) => setRail({ ...rail, br: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Espesor alma tw_r (mm)</Label>
                <Input type="number" value={rail.tw_r} onChange={(e) => setRail({ ...rail, tw_r: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Excentricidad (mm)</Label>
                <Input type="number" value={rail.eccentricity} onChange={(e) => setRail({ ...rail, eccentricity: Number(e.target.value) })} />
              </div>
            </div>
          )}

          {/* Splice params for discontinuous */}
          {rail.connection === "discontinuous" && rail.type !== "none" && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label>Ancho junta splice (mm)</Label>
                <Input type="number" value={rail.spliceB ?? 0} onChange={(e) => setRail({ ...rail, spliceB: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Espesor junta splice (mm)</Label>
                <Input type="number" value={rail.spliceT ?? 0} onChange={(e) => setRail({ ...rail, spliceT: Number(e.target.value) })} />
              </div>
            </div>
          )}

          {/* Summary of selected rail */}
          {rail.type !== "none" && rail.hr > 0 && (
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 text-sm grid grid-cols-2 md:grid-cols-4 gap-2">
              <div><span className="text-muted-foreground">hr = </span><span className="font-semibold">{rail.hr} mm</span></div>
              <div><span className="text-muted-foreground">br = </span><span className="font-semibold">{rail.br} mm</span></div>
              <div><span className="text-muted-foreground">tw_r = </span><span className="font-semibold">{rail.tw_r} mm</span></div>
              <div><span className="text-muted-foreground">e = </span><span className="font-semibold">{rail.eccentricity} mm</span></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/** Small helper component for displaying a property cell */
function PropCell({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-muted-foreground text-xs">{label} ({unit})</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

/** Dimension input helper */
function DimInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}
