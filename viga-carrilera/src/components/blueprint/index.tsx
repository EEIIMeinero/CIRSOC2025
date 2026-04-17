"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ─── SectionLabel ──────────────────────────────────────────────────────── */
export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 mb-2", className)}>
      <div className="h-px flex-1 bg-slate-700" />
      <span className="text-xs font-semibold text-blue-400 tracking-widest uppercase">
        {children}
      </span>
      <div className="h-px flex-1 bg-slate-700" />
    </div>
  );
}

/* ─── InputRow ──────────────────────────────────────────────────────────── */
export function InputRow({
  label, unit, children, labelW = "w-28",
}: {
  label: string;
  unit?: string;
  children: React.ReactNode;
  labelW?: string;
}) {
  return (
    <div className="flex items-center gap-1 mb-1">
      <label className={cn("text-xs text-slate-400 shrink-0 leading-tight", labelW)}>{label}</label>
      <div className="flex-1 relative">{children}</div>
      {unit && <span className="text-xs text-slate-500 w-12 text-right mono shrink-0">{unit}</span>}
    </div>
  );
}

/* ─── Badge ─────────────────────────────────────────────────────────────── */
export function Badge({ passes, warning, label }: { passes?: boolean; warning?: boolean; label?: string }) {
  if (warning) return <span className="badge-warn">{label ?? "ADVERTENCIA"}</span>;
  if (passes === undefined) return null;
  return passes ? (
    <span className="badge-pass">{label ?? "\u2713 CUMPLE"}</span>
  ) : (
    <span className="badge-fail">{label ?? "\u2717 NO CUMPLE"}</span>
  );
}

/* ─── DCRBar ────────────────────────────────────────────────────────────── */
export function DCRBar({ value, max = 1.0 }: { value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  const color = value > 1.0 ? "#ef4444" : value > 0.85 ? "#f59e0b" : "#22c55e";
  return (
    <div className="w-full h-2 bg-slate-800 rounded overflow-hidden mt-1">
      <div className="h-full rounded transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

/* ─── PropCard ──────────────────────────────────────────────────────────── */
export function PropCard({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="bg-slate-800/50 rounded px-2 py-1.5 flex justify-between items-center">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="mono text-xs text-slate-200">
        {value} {unit && <span className="text-slate-500">{unit}</span>}
      </span>
    </div>
  );
}

/* ─── VerifCard ─────────────────────────────────────────────────────────── */
export function VerifCard({
  title, subtitle, value, unit, capacity, capUnit, dcr, passes, warning,
}: {
  title: string;
  subtitle: string;
  value: string;
  unit: string;
  capacity?: string;
  capUnit?: string;
  dcr?: number;
  passes?: boolean;
  warning?: boolean;
}) {
  const borderClass = passes === false
    ? "border-red-900"
    : warning
    ? "border-amber-900"
    : passes === true
    ? "border-green-900"
    : "border-slate-800";

  return (
    <div className={cn("bg-slate-900 border rounded p-3", borderClass)}>
      <div className="flex justify-between items-start mb-1">
        <div>
          <div className="text-xs font-bold text-white">{title}</div>
          <div className="text-xs text-slate-500">{subtitle}</div>
        </div>
        <Badge passes={passes} warning={warning} />
      </div>
      <div className="flex items-baseline gap-1 mt-2">
        <span className="mono text-lg font-bold text-blue-300">{value}</span>
        <span className="text-xs text-slate-500">{unit}</span>
      </div>
      {capacity && (
        <div className="text-xs text-slate-500 mono mt-0.5">
          Cap: {capacity} {capUnit}
        </div>
      )}
      {dcr !== undefined && (
        <>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-slate-500">DCR</span>
            <span
              className="mono text-xs font-bold"
              style={{ color: dcr > 1 ? "#ef4444" : dcr > 0.85 ? "#f59e0b" : "#22c55e" }}
            >
              {dcr.toFixed(3)}
            </span>
          </div>
          <DCRBar value={dcr} />
        </>
      )}
    </div>
  );
}

/* ─── Panel (cards section wrapper) ─────────────────────────────────────── */
export function Panel({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-slate-900 border border-slate-800 rounded p-3", className)}>
      {title && (
        <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
