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
    <div className="min-h-screen flex bg-[hsl(230,25%,8%)]">
      {/* Sidebar */}
      <aside className="w-56 bg-[hsl(230,20%,12%)] text-white flex flex-col border-r border-[hsl(230,15%,20%)]">
        <div className="px-4 py-3 border-b border-[hsl(230,15%,20%)]">
          <Link href="/" className="text-base font-bold text-blue-400 hover:text-blue-300 flex items-center gap-2">
            <span className="text-lg">⊞</span> VigaCarrilera
          </Link>
          <p className="text-[10px] text-slate-500 mt-0.5">CIRSOC 301-2018 · AISC 360-22</p>
        </div>

        <nav className="flex-1 p-1.5 space-y-0.5">
          {STEPS.map((step) => {
            const href = `/proyecto/${projectId}/${step.path}`;
            const isActive = pathname?.includes(step.path);
            return (
              <Link
                key={step.num}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-2 rounded text-xs transition-colors",
                  isActive
                    ? "bg-blue-600/20 text-blue-400 font-medium border-l-2 border-blue-400"
                    : "text-slate-400 hover:bg-[hsl(230,15%,18%)] hover:text-slate-200 border-l-2 border-transparent"
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold",
                    isActive
                      ? "bg-blue-500 text-white"
                      : "bg-[hsl(230,15%,22%)] text-slate-500"
                  )}
                >
                  {step.num}
                </span>
                {step.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-2 border-t border-[hsl(230,15%,20%)]">
          <Link
            href="/proyectos"
            className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            ← Volver
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar — project summary */}
        <header className="h-10 bg-[hsl(230,20%,12%)] border-b border-[hsl(230,15%,20%)] flex items-center px-4 gap-3 shrink-0">
          <span className="text-xs text-slate-300 font-medium truncate">
            {general.projectName}
          </span>
          <span className="text-[10px] text-slate-500">|</span>
          <span className="text-[10px] text-slate-500">
            {general.material.name} · Fy={general.material.Fy}MPa
          </span>
          {section && (
            <>
              <span className="text-[10px] text-slate-500">|</span>
              <span className="text-[10px] text-cyan-400">
                Tipo {section.type}{section.profileName ? ` — ${section.profileName}` : ""}
              </span>
            </>
          )}
          <div className="flex-1" />
          {isCalculated && spanResults.length > 0 && (
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded",
              globalPass ? "bg-emerald-500/20 text-emerald-400" :
              globalFail ? "bg-red-500/20 text-red-400" :
              "bg-amber-500/20 text-amber-400"
            )}>
              {globalPass ? "VERIFICA" : globalFail ? "NO VERIFICA" : "AJUSTADO"}
            </span>
          )}
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
