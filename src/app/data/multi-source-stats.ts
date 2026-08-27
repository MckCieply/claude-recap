import { computeStats, type DashboardStats } from './stats';
import type { ConversationsExport } from './claude-export.schema';

export interface LabeledExport {
  label: string;
  conversations: ConversationsExport;
}

export interface SourceActivity {
  label: string;
  /** Index into the locked categorical palette (DESIGN_DIRECTION.md); undefined past the 3-source cap. */
  colorSlot: 0 | 1 | 2 | undefined;
  dailyActivity: Map<string, number>;
}

export interface MultiSourceStats {
  /** Combined stats across every source, same shape DashboardStats always had. */
  stats: DashboardStats;
  sources: SourceActivity[];
}

/**
 * Only the first 3 sources get a distinct identity color — DESIGN_DIRECTION.md's categorical
 * palette is validated (CVD separation) for exactly 3 hues, capped deliberately rather than
 * generating more on the fly. A 4th+ source still fully participates in the combined `stats`
 * and still gets its own `dailyActivity` entry in `sources`; it's only the color assignment
 * that stops. See README's "Distinct per-file colors are capped at 3 imports" limitation note.
 */
function colorSlotForIndex(index: number): 0 | 1 | 2 | undefined {
  return index === 0 || index === 1 || index === 2 ? index : undefined;
}

export function computeMultiSourceStats(exports: LabeledExport[]): MultiSourceStats {
  // `flatMap`/`map` over an empty `exports` array fall straight through to `computeStats([])`
  // and an empty `sources` list — no special-casing needed for the empty-import state.
  const combined = exports.flatMap((source) => source.conversations);
  const stats = computeStats(combined);
  const sources = exports.map((source, index) => ({
    label: source.label,
    colorSlot: colorSlotForIndex(index),
    // Independent per-source `computeStats` call so each source's heatmap reflects only its
    // own days — deliberately not derived from `combined`/`stats` above.
    dailyActivity: computeStats(source.conversations).dailyActivity,
  }));
  return { stats, sources };
}
