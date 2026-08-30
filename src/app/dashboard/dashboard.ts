import { Component, computed, input } from '@angular/core';
import type { DashboardStats } from '../data/stats';
import type { SourceActivity } from '../data/multi-source-stats';
import { ExportControls } from '../export/export-controls';
import { ActivityHeatmap } from './activity-heatmap/activity-heatmap';
import { StatTile } from './stat-tile/stat-tile';

function formatNumber(n: number): string {
  if (n >= 10_000) return `${(n / 1000).toFixed(1)}K`;
  // No hardcoded locale — respects the viewer's own locale (grouping, digits)
  // instead of forcing en-US formatting on everyone.
  return n.toLocaleString();
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

@Component({
  selector: 'app-dashboard',
  imports: [StatTile, ActivityHeatmap, ExportControls],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  // role="main": this is the app's sole content region (no nav/landing chrome
  // wraps it today), so it should read as the main landmark for AT users.
  host: { class: 'dashboard', role: 'main' },
})
export class Dashboard {
  readonly stats = input.required<DashboardStats>();
  readonly sources = input.required<SourceActivity[]>();

  protected readonly timeline = computed(() => {
    const s = this.stats();
    return {
      firstActiveDate: s.firstActiveDate ? formatDate(s.firstActiveDate) : '—',
      daysActive: formatNumber(s.daysActive),
    };
  });

  protected readonly counts = computed(() => {
    const s = this.stats();
    return {
      totalConversations: formatNumber(s.totalConversations),
      totalMessages: formatNumber(s.totalMessages),
      totalWords: formatNumber(s.totalWords),
      approxTokenEstimate: formatNumber(s.approxTokenEstimate),
    };
  });

  protected readonly patterns = computed(() => {
    const s = this.stats();
    return {
      busiestDay: s.busiestDayOfWeek?.day ?? '—',
      busiestDayHint: s.busiestDayOfWeek ? `${formatNumber(s.busiestDayOfWeek.messageCount)} messages` : undefined,
      busiestHour: s.busiestHour ? `${String(s.busiestHour.hour).padStart(2, '0')}:00 UTC` : '—',
      busiestHourHint: s.busiestHour ? `${formatNumber(s.busiestHour.messageCount)} messages` : undefined,
      longestStreakDays: formatNumber(s.longestStreakDays),
    };
  });

  protected readonly highlights = computed(() => {
    const s = this.stats();
    return {
      longestConversation: s.longestConversation?.name ?? '—',
      longestConversationHint: s.longestConversation
        ? `${formatNumber(s.longestConversation.messageCount)} messages`
        : undefined,
      mostActiveMonth: s.mostActiveMonth
        ? new Date(`${s.mostActiveMonth.month}-01T00:00:00Z`).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            timeZone: 'UTC',
          })
        : '—',
      mostActiveYear: s.mostActiveYear?.year ?? '—',
    };
  });
}
