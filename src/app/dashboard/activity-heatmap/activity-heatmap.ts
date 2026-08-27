import { Component, computed, input } from '@angular/core';

interface DayCell {
  date: string; // YYYY-MM-DD
  count: number;
  level: 0 | 1 | 2 | 3;
}

interface Week {
  days: DayCell[];
  /** Set on the week containing a month's first day — independent of which weekday that falls on. */
  monthLabel?: string;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MS_PER_DAY = 86_400_000;

function levelFor(count: number, max: number): DayCell['level'] {
  if (count === 0 || max === 0) return 0;
  if (count <= max / 3) return 1;
  if (count <= (2 * max) / 3) return 2;
  return 3;
}

function toDateKey(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

@Component({
  selector: 'app-activity-heatmap',
  imports: [],
  templateUrl: './activity-heatmap.html',
  styleUrl: './activity-heatmap.scss',
  host: { class: 'activity-heatmap' },
})
export class ActivityHeatmap {
  readonly dailyActivity = input.required<Map<string, number>>();

  protected readonly weeks = computed<Week[]>(() => {
    const activity = this.dailyActivity();
    if (activity.size === 0) return [];

    const keys = Array.from(activity.keys()).sort();
    const firstMs = Date.parse(`${keys[0]}T00:00:00Z`);
    const lastMs = Date.parse(`${keys[keys.length - 1]}T00:00:00Z`);
    const max = Math.max(...activity.values());

    // Pad to full weeks: Sunday on/before first, Saturday on/after last (UTC).
    const gridStart = firstMs - new Date(firstMs).getUTCDay() * MS_PER_DAY;
    const gridEnd = lastMs + (6 - new Date(lastMs).getUTCDay()) * MS_PER_DAY;

    const weeks: Week[] = [];
    const seenMonths = new Set<string>();
    for (let weekStart = gridStart; weekStart <= gridEnd; weekStart += 7 * MS_PER_DAY) {
      const days: DayCell[] = [];
      let monthLabel: string | undefined;
      for (let d = 0; d < 7; d++) {
        const ms = weekStart + d * MS_PER_DAY;
        const date = toDateKey(ms);
        const count = activity.get(date) ?? 0;
        const monthKey = date.slice(0, 7);
        if (!monthLabel && !seenMonths.has(monthKey)) {
          monthLabel = MONTH_NAMES[new Date(ms).getUTCMonth()];
          seenMonths.add(monthKey);
        }
        days.push({ date, count, level: levelFor(count, max) });
      }
      weeks.push({ days, monthLabel });
    }
    return weeks;
  });

  protected cellLabel(cell: DayCell): string {
    const count = cell.count === 1 ? '1 message' : `${cell.count} messages`;
    return `${count} on ${cell.date}`;
  }
}
