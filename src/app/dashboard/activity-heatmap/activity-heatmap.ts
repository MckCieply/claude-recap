import { Component, computed, input } from '@angular/core';
import type { SourceActivity } from '../../data/multi-source-stats';
import { blendHexOklch } from './oklch-blend';

/** One colored source's own ramp level + resolved color for a single day. */
interface SourceDayColor {
  slot: 0 | 1 | 2;
  level: 1 | 2 | 3;
  color: string;
}

interface DayCell {
  date: string; // YYYY-MM-DD
  count: number; // combined total across every source (colored + neutral) that day
  /**
   * CSS `data-level` (0-3). Only carries the exact ramp meaning today's single-source CSS path
   * expects (0 = no activity, 1-3 = the `--heat-N` vars) when 0 or exactly 1 colored source
   * touched the day — see `background` below for the 2/3-source overlap cases, which override
   * the CSS path entirely via inline style.
   */
  level: 0 | 1 | 2 | 3;
  /**
   * Explicit fill override. `null` means "let the existing `[data-level]` CSS rule render it" —
   * this is what keeps the single-source (`sources().length === 1`) path pixel-identical to the
   * original component, since that case never sets this.
   */
  background: string | null;
  /** Corner marker color for the 3-colored-source case; `null` otherwise. */
  marker: string | null;
  tooltip: string;
}

interface Week {
  days: DayCell[];
  /** Set on the week containing a month's first day — independent of which weekday that falls on. */
  monthLabel?: string;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MS_PER_DAY = 86_400_000;

/**
 * The 3 validated per-source ramps from DESIGN_DIRECTION.md's "Data visualization — categorical
 * palette" table. Hardcoded as specified — these are already validated (CVD separation +
 * monotone-lightness ordinal checks) by the dataviz skill's palette validator; not re-derived
 * here. Slot 0 is identical to the original single-hue `--heat-1/2/3` ramp, which is what makes
 * the single-source backward-compat path exact.
 */
const RAMP: Record<0 | 1 | 2, Record<1 | 2 | 3, string>> = {
  0: { 1: '#3e4685', 2: '#4e58ab', 3: '#5e6ad2' },
  1: { 1: '#883c1e', 2: '#b14a22', 3: '#d95926' },
  2: { 1: '#15654a', 2: '#17825d', 3: '#199e70' },
};

/** Neutral fallback fill for a day touched only by a colorSlot-undefined (4th+) source — see
 * `buildDayCell` below for why. Reuses an existing locked token rather than inventing a new hex.
 */
const NEUTRAL_FILL = 'var(--hairline-tertiary)';

function levelFor(count: number, max: number): 0 | 1 | 2 | 3 {
  if (count === 0 || max === 0) return 0;
  if (count <= max / 3) return 1;
  if (count <= (2 * max) / 3) return 2;
  return 3;
}

function toDateKey(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

function cellLabel(date: string, count: number, breakdown?: { label: string; count: number }[]): string {
  const base = `${count === 1 ? '1 message' : `${count} messages`} on ${date}`;
  if (!breakdown || breakdown.length === 0) return base;
  return `${base} (${breakdown.map((b) => `${b.label}: ${b.count}`).join(', ')})`;
}

@Component({
  selector: 'app-activity-heatmap',
  imports: [],
  templateUrl: './activity-heatmap.html',
  styleUrl: './activity-heatmap.scss',
  host: { class: 'activity-heatmap' },
})
export class ActivityHeatmap {
  readonly sources = input.required<SourceActivity[]>();

  protected readonly weeks = computed<Week[]>(() => {
    const srcs = this.sources();
    const allKeys = srcs.flatMap((s) => Array.from(s.dailyActivity.keys()));
    if (allKeys.length === 0) return [];

    allKeys.sort();
    const firstMs = Date.parse(`${allKeys[0]}T00:00:00Z`);
    const lastMs = Date.parse(`${allKeys[allKeys.length - 1]}T00:00:00Z`);

    // Per-source max, not global — each source's own ramp level is computed against its own
    // activity range (DESIGN_DIRECTION.md: "each one's own ramp level ... using that source's
    // own max"). For the single-source case this is identical to the original global max.
    const sourceMaxes = srcs.map((s) => {
      const values = Array.from(s.dailyActivity.values());
      return values.length ? Math.max(...values) : 0;
    });

    // Always show a full Jan-Dec calendar year, not just the days you were actually active — a
    // short burst of activity still reads in year-long context instead of a cropped strip, and
    // the grid lines up with a real calendar rather than a rolling "365 days back from today"
    // window. Baseline is the current calendar year; still extends further when real data falls
    // outside it (earlier history or, for a stale export, activity later than today's year would
    // suggest) — never truncating genuine history to fit.
    const currentYear = new Date().getUTCFullYear();
    const yearStartMs = Date.parse(`${currentYear}-01-01T00:00:00Z`);
    const yearEndMs = Date.parse(`${currentYear}-12-31T00:00:00Z`);
    const windowStart = Math.min(firstMs, yearStartMs);
    const windowEnd = Math.max(lastMs, yearEndMs);

    // Columns still align to real calendar weeks (Sunday-Saturday) so month boundaries land
    // cleanly, but the edge columns are trimmed to the exact window below rather than padded
    // with days outside it — Jan 1 starts its column partway down instead of pulling in days
    // from the prior December, and Dec 31 ends its column early instead of spilling into January.
    const gridStart = windowStart - new Date(windowStart).getUTCDay() * MS_PER_DAY;
    const gridEnd = windowEnd + (6 - new Date(windowEnd).getUTCDay()) * MS_PER_DAY;

    const weeks: Week[] = [];
    const seenMonths = new Set<string>();
    for (let weekStart = gridStart; weekStart <= gridEnd; weekStart += 7 * MS_PER_DAY) {
      const days: DayCell[] = [];
      let monthLabel: string | undefined;
      for (let d = 0; d < 7; d++) {
        const ms = weekStart + d * MS_PER_DAY;
        if (ms < windowStart || ms > windowEnd) continue;
        const date = toDateKey(ms);
        const monthKey = date.slice(0, 7);
        if (!monthLabel && !seenMonths.has(monthKey)) {
          monthLabel = MONTH_NAMES[new Date(ms).getUTCMonth()];
          seenMonths.add(monthKey);
        }
        days.push(buildDayCell(date, srcs, sourceMaxes));
      }
      weeks.push({ days, monthLabel });
    }
    return weeks;
  });

  /** Legend swatch color for a source — its own top-ramp color, or the neutral fallback fill. */
  protected swatchFor(source: SourceActivity): string {
    return source.colorSlot === undefined ? NEUTRAL_FILL : RAMP[source.colorSlot][3];
  }
}

function buildDayCell(date: string, srcs: SourceActivity[], sourceMaxes: number[]): DayCell {
  let combinedCount = 0;
  const colored: SourceDayColor[] = [];
  const breakdown: { label: string; count: number }[] = [];
  const showBreakdown = srcs.length > 1;

  srcs.forEach((source, i) => {
    const count = source.dailyActivity.get(date) ?? 0;
    combinedCount += count;
    if (showBreakdown) breakdown.push({ label: source.label, count });
    if (count <= 0 || source.colorSlot === undefined) return;
    const level = levelFor(count, sourceMaxes[i]);
    if (level === 0) return;
    colored.push({ slot: source.colorSlot, level, color: RAMP[source.colorSlot][level] });
  });

  const totalTouched = combinedCount > 0;
  const level: DayCell['level'] = !totalTouched ? 0 : colored.length === 1 ? colored[0].level : 1;

  let background: string | null = null;
  let marker: string | null = null;

  if (totalTouched) {
    if (colored.length === 0) {
      // Day touched only by a colorSlot-undefined (4th+) source. DESIGN_DIRECTION.md leaves this
      // case genuinely open ("fold into a neutral 'combined' bucket?") — folding it into a flat
      // neutral fill keeps the day visibly "touched" (not silently dropped) without inventing an
      // unvalidated 4th identity hue.
      background = NEUTRAL_FILL;
    } else if (colored.length === 1) {
      // Slot 0's ramp is identical to the original `--heat-1/2/3` vars, so leaving `background`
      // null here lets the existing CSS `[data-level]` path render it — exact single-source
      // parity. Any other slot needs its own color, which the CSS path doesn't know about.
      background = colored[0].slot === 0 ? null : colored[0].color;
    } else {
      const sorted = [...colored].sort((a, b) => b.level - a.level || a.slot - b.slot);
      const [first, second, third] = sorted;
      const mid = blendHexOklch(first.color, second.color);
      background = `linear-gradient(135deg, ${first.color} 0%, ${mid} 50%, ${second.color} 100%)`;
      if (third) {
        // 3-colored-source overlap: DESIGN_DIRECTION.md explicitly calls this "not yet
        // specified" and lists two candidates. Picked the simpler one — two dominant sources
        // stay on the diagonal gradient above, third gets a small corner marker in its own
        // top-ramp color (always level 3, for identifiability rather than that day's magnitude).
        marker = RAMP[third.slot][3];
      }
    }
  }

  return {
    date,
    count: combinedCount,
    level,
    background,
    marker,
    tooltip: cellLabel(date, combinedCount, showBreakdown ? breakdown : undefined),
  };
}
