import { Component, computed, input } from '@angular/core';
import type { DashboardStats } from '../data/stats';
import { ActivityHeatmap } from './activity-heatmap/activity-heatmap';
import { StatTile } from './stat-tile/stat-tile';

function formatNumber(n: number): string {
  if (n >= 10_000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString('en-US');
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

@Component({
  selector: 'app-dashboard',
  imports: [StatTile, ActivityHeatmap],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  host: { class: 'dashboard' },
})
export class Dashboard {
  readonly stats = input.required<DashboardStats>();

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
        ? new Date(`${s.mostActiveMonth.month}-01T00:00:00Z`).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            timeZone: 'UTC',
          })
        : '—',
      mostActiveYear: s.mostActiveYear?.year ?? '—',
    };
  });

  protected readonly dailyActivity = computed(() => this.stats().dailyActivity);
}
