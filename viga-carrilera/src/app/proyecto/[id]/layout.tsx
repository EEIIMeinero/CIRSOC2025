"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { cn } from "@/lib/utils";

const STEPS = [
  { num: 1, path: "1-datos-generales", label: "Datos Generales" },
  { num: 2, path: "2-geometria", label: "Geometría" },
  { num: 3, path: "3-seccion", label: "Sección" },
  { num: 4, path: "4-acciones", label: "Acciones" },
  { num: 5, path: "5-calculo", label: "Cálculo" },
  { num: 6, path: "6-resultados", label: "Resultados" },
  { num: 7, path: "7-memoria", label: "Memoria" },
];

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const projectId = params.id as string;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <Link href="/" className="text-lg font-bold text-blue-300 hover:text-blue-200">
            VigaCarrilera
          </Link>
          <p className="text-xs text-slate-400 mt-1">v2.0 — CIRSOC/AISC</p>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {STEPS.map((step) => {
            const href = `/proyecto/${projectId}/${step.path}`;
            const isActive = pathname?.includes(step.path);
            return (
              <Link
                key={step.num}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-blue-600 text-white font-medium"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                    isActive
                      ? "bg-white text-blue-600"
                      : "bg-slate-700 text-slate-300"
                  )}
                >
                  {step.num}
                </span>
                {step.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <Link
            href="/proyectos"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            ← Volver a Proyectos
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50 overflow-auto">
        <div className="max-w-6xl mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
