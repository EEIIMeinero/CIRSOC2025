import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[hsl(230,25%,8%)] p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-bold text-blue-400 tracking-tight">
          VigaCarrilera
        </h1>
        <p className="text-lg text-slate-400">
          Diseno y verificacion de vigas carrileras para naves industriales
        </p>
        <div className="text-xs text-slate-500 space-y-1">
          <p>CIRSOC 301-2018 &middot; CIRSOC 101-2025 &middot; AISC 360-22 &middot; AISC DG7-2019</p>
        </div>

        <div className="flex gap-4 justify-center pt-4">
          <Link
            href="/proyectos"
            className="inline-flex items-center justify-center rounded bg-blue-600 px-8 py-2.5 text-white text-sm font-medium hover:bg-blue-500 transition-colors"
          >
            Mis Proyectos
          </Link>
          <Link
            href="/proyecto/nuevo/1-datos-generales"
            className="inline-flex items-center justify-center rounded border border-[hsl(230,15%,30%)] bg-transparent px-8 py-2.5 text-slate-300 text-sm font-medium hover:bg-[hsl(230,15%,18%)] transition-colors"
          >
            Nuevo Proyecto
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-8 text-left">
          <div className="p-3 rounded-lg bg-[hsl(230,20%,14%)] border border-[hsl(230,15%,22%)]">
            <h3 className="font-semibold text-cyan-400 text-sm">11 Tipos de Seccion</h3>
            <p className="text-xs text-slate-500 mt-1">
              Laminados, armadas, cajon, birriel y mas
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[hsl(230,20%,14%)] border border-[hsl(230,15%,22%)]">
            <h3 className="font-semibold text-cyan-400 text-sm">Hasta 3 Gruas</h3>
            <p className="text-xs text-slate-500 mt-1">
              Simultaneas con hasta 20 ejes cada una
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[hsl(230,20%,14%)] border border-[hsl(230,15%,22%)]">
            <h3 className="font-semibold text-cyan-400 text-sm">Memoria PDF</h3>
            <p className="text-xs text-slate-500 mt-1">
              Paso a paso con referencias normativas
            </p>
          </div>
        </div>

        <p className="text-[10px] text-slate-600 pt-8">
          Version 2.0 — Marzo 2026
        </p>
      </div>
    </main>
  );
}
