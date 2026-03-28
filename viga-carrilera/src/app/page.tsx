import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-5xl font-bold text-blue-900 tracking-tight">
          VigaCarrilera
        </h1>
        <p className="text-xl text-slate-600">
          Diseño y verificación de vigas carrileras para naves industriales
        </p>
        <div className="text-sm text-slate-500 space-y-1">
          <p>CIRSOC 301-2018 &middot; CIRSOC 101-2025 &middot; AISC 360-22 &middot; AISC DG7-2019</p>
        </div>

        <div className="flex gap-4 justify-center pt-4">
          <Link
            href="/proyectos"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-8 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Mis Proyectos
          </Link>
          <Link
            href="/proyecto/nuevo/1-datos-generales"
            className="inline-flex items-center justify-center rounded-md border border-blue-300 bg-white px-8 py-3 text-blue-700 font-medium hover:bg-blue-50 transition-colors"
          >
            Nuevo Proyecto
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-8 text-left">
          <div className="p-4 rounded-lg bg-white/70 border">
            <h3 className="font-semibold text-blue-800">11 Tipos de Sección</h3>
            <p className="text-sm text-slate-500 mt-1">
              Laminados, armadas, cajón, birriel y más
            </p>
          </div>
          <div className="p-4 rounded-lg bg-white/70 border">
            <h3 className="font-semibold text-blue-800">Hasta 3 Grúas</h3>
            <p className="text-sm text-slate-500 mt-1">
              Simultáneas con hasta 20 ejes cada una
            </p>
          </div>
          <div className="p-4 rounded-lg bg-white/70 border">
            <h3 className="font-semibold text-blue-800">Memoria PDF</h3>
            <p className="text-sm text-slate-500 mt-1">
              Paso a paso con referencias normativas
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-400 pt-8">
          Versión 2.0 — Marzo 2026
        </p>
      </div>
    </main>
  );
}
