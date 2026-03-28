// ============================================================================
// VIGACARRILERA — Geometry helpers
// Utility functions for multi-span beam geometry.
// Units: lengths in m.
// ============================================================================

import type { Span } from "@/lib/types";

/**
 * Total length of all spans.
 *
 * @param spans Array of span definitions.
 * @returns Total length (m).
 */
export function totalLength(spans: Span[]): number {
  return spans.reduce((sum, s) => sum + s.length, 0);
}

/**
 * Cumulative positions of support nodes (including start at 0).
 *
 * For N spans there are N+1 nodes:
 *   [0, L1, L1+L2, ..., L_total]
 *
 * @param spans Array of span definitions.
 * @returns Array of node positions (m), length = spans.length + 1.
 */
export function nodePositions(spans: Span[]): number[] {
  const nodes: number[] = [0];
  let cumulative = 0;
  for (const span of spans) {
    cumulative += span.length;
    nodes.push(cumulative);
  }
  return nodes;
}

/**
 * Determine which span contains a given position along the beam.
 *
 * @param x     Position along the beam (m).
 * @param spans Array of span definitions.
 * @returns Index of the span containing x, or -1 if x is outside the beam.
 */
export function spanContaining(x: number, spans: Span[]): number {
  const nodes = nodePositions(spans);

  for (let i = 0; i < spans.length; i++) {
    if (x >= nodes[i] && x <= nodes[i + 1]) {
      return i;
    }
  }

  return -1; // outside beam
}
