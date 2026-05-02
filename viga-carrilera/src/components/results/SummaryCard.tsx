"use client";

import { SpanResult } from "@/lib/types";

interface SummaryCardProps {
  results: SpanResult[];
}

function statusColor(eta: number): string {
  if (eta >= 1.0) return "bg-red-100 text-red-800";
  if (eta >= 0.85) return "bg-yellow-100 text-yellow-800";
  return "bg-green-100 text-green-800";
}

function statusIcon(status: string): string {
  if (status === "fail") return "✗";
  if (status === "warning") return "⚠";
  return "✓";
}

export function SummaryCard({ results }: SummaryCardProps) {
  if (results.length === 0) return null;

  const maxEta = Math.max(...results.map((r) => r.etaMax));
  const criticalIdx = results.findIndex((r) => r.etaMax === maxEta);
  const globalPass = results.every((r) => r.status !== "fail");

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100 text-slate-700">
              <th className="px-3 py-2 text-left">Vano</th>
              <th className="px-3 py-2 text-right">L (m)</th>
              <th className="px-3 py-2 text-right">η_flex</th>
              <th className="px-3 py-2 text-right">η_corte</th>
              <th className="px-3 py-2 text-right">δv/lím</th>
              <th className="px-3 py-2 text-right">δh/lím</th>
              <th className="px-3 py-2 text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => {
              const isCritical = i === criticalIdx;
              const isLast = i === results.length - 1;
              return (
                <tr
                  key={i}
                  className={`border-b ${isCritical ? "bg-amber-50" : ""}`}
                >
                  <td className="px-3 py-2 font-medium">
                    V{r.spanIndex + 1}
                    {isCritical && <span className="text-amber-600">*</span>}
                    {isLast && <span className="text-slate-400 ml-1">PG</span>}
                  </td>
                  <td className="px-3 py-2 text-right">{r.length.toFixed(1)}</td>
                  <td className="px-3 py-2 text-right">
                    <span className={`px-2 py-0.5 rounded text-xs font-mono ${statusColor(r.interaction.eta)}`}>
                      {r.interaction.eta.toFixed(3)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span className={`px-2 py-0.5 rounded text-xs font-mono ${statusColor(r.Vu / r.shear.phiVn)}`}>
                      {(r.Vu / r.shear.phiVn).toFixed(3)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs">
                    {r.deflection.deltaV.toFixed(1)}/{r.deflection.limitV.toFixed(1)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs">
                    {r.deflection.deltaH.toFixed(1)}/{r.deflection.limitH.toFixed(1)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                      r.status === "fail" ? "bg-red-500 text-white" :
                      r.status === "warning" ? "bg-yellow-400 text-yellow-900" :
                      "bg-green-500 text-white"
                    }`}>
                      {statusIcon(r.status)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={`p-4 rounded-lg text-center font-bold text-lg ${
        globalPass ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}>
        RESULTADO GLOBAL: {globalPass ? "✓ VERIFICA" : "✗ NO VERIFICA"}
      </div>

      <p className="text-xs text-slate-400">
        * = vano crítico (mayor η) &nbsp;&nbsp; PG = paragolpe
      </p>
    </div>
  );
}
