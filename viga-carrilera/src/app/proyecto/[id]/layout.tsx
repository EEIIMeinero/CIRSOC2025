"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useProjectStore } from "@/store/projectStore";
import { cn } from "@/lib/utils";

const STEPS = [
  { num: 1, path: "1-datos-generales", label: "Datos Generales", icon: "D" },
  { num: 2, path: "2-geometria", label: "Geometria", icon: "G" },
  { num: 3, path: "3-seccion", label: "Seccion", icon: "S" },
  { num: 4, path: "4-acciones", label: "Acciones", icon: "A" },
  { num: 5, path: "5-calculo", label: "Calculo", icon: "C" },
  { num: 6, path: "6-resultados", label: "Resultados", icon: "R" },
  { num: 7, path: "7-memoria", label: "Memoria", icon: "M" },
];

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const projectId = params.id as string;
  const { general, section, isCalculated, spanResults } = useProjectStore();

  const globalPass = isCalculated && spanResults.length > 0 && spanResults.every((r) => r.status !== "fail");
  const globalFail = isCalculated && spanResults.length > 0 && spanResults.some((r) => r.status === "fail");

  return (
    <div className="h-screen flex bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-slate-900 text-white flex flex-col border-r border-slate-800 shrink-0">
        <div className="px-3 py-3 border-b border-slate-800 bg-slate-950">
          <div className="text-xs text-blue-400 font-semibold tracking-wider uppercase">
            CIRSOC 301-2018 / AISC 360
          </div>
          <Link href="/" className="text-sm font-bold text-white mt-0.5 block hover:text-blue-300">
            VigaCarrilera
          </Link>
          <p className="text-[10px] text-slate-500 mono mt-0.5">v2.0 · Naves industriales</p>
        </div>

        <nav className="flex-1 p-1.5 space-y-0.5 overflow-y-auto">
          {STEPS.map((step) => {
            const href = `/proyecto/${projectId}/${step.path}`;
            const isActive = pathname?.includes(step.path);
            return (
              <Link
                key={step.num}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs transition-colors",
                  isActive
                    ? "bg-blue-600/20 text-blue-300 font-medium border-l-2 border-blue-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-l-2 border-transparent"
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold mono",
                    isActive ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-500"
                  )}
                >
                  {step.num}
                </span>
                {step.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-2 border-t border-slate-800 bg-slate-950">
          <Link href="/proyectos" className="text-xs text-slate-500 hover:text-slate-300 transition-colors mono">
            ← Volver a Proyectos
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar — project summary */}
        <header className="h-9 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-3 shrink-0">
          <span className="text-xs text-slate-200 font-semibold truncate">
            {general.projectName}
          </span>
          <span className="text-[10px] text-slate-600">|</span>
          <span className="text-[10px] text-slate-500 mono">
            {general.material.name} Fy={general.material.Fy}MPa
          </span>
          {section && (
            <>
              <span className="text-[10px] text-slate-600">|</span>
              <span className="text-[10px] text-blue-400 mono">
                Tipo {section.type}{section.profileName ? ` ${section.profileName}` : ""}
              </span>
            </>
          )}
          <div className="flex-1" />
          {isCalculated && spanResults.length > 0 && (
            <span className={cn(
              globalPass ? "badge-pass" : globalFail ? "badge-fail" : "badge-warn"
            )}>
              {globalPass ? "\u2713 VERIFICA" : globalFail ? "\u2717 NO VERIFICA" : "AJUSTADO"}
            </span>
          )}
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-auto bg-grid">
          <div className="p-4">{children}</div>
        </main>
      </div>
    </div>
  );
}
