import Link from "next/link";

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Mis Proyectos</h1>
            <p className="text-slate-500 mt-1">Vigas carrileras guardadas</p>
          </div>
          <Link
            href="/proyecto/nuevo/1-datos-generales"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-2.5 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            + Nuevo Proyecto
          </Link>
        </div>

        {/* Project list - will be populated from DB */}
        <div className="bg-white rounded-lg border shadow-sm p-12 text-center text-slate-400">
          <p className="text-lg">No hay proyectos guardados todavía.</p>
          <p className="mt-2 text-sm">
            Creá un nuevo proyecto para comenzar el diseño de tu viga carrilera.
          </p>
        </div>
      </div>
    </main>
  );
}
