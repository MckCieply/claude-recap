import type { ConversationItem, ConversationMessage, ConversationsExport } from './claude-export.schema';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export interface DashboardStats {
  /** ISO date (UTC, YYYY-MM-DD) of the earliest message. Undefined if there are no messages. */
  firstActiveDate?: string;
  /** Whole days between first and last message, inclusive. */
  daysActive: number;
  totalConversations: number;
  totalMessages: number;
  totalWords: number;
  /** Rough heuristic (words * 1.3), not Claude's real tokenizer — see README limitations. */
  approxTokenEstimate: number;
  /** date (UTC, YYYY-MM-DD) -> message count, for the activity heatmap. */
  dailyActivity: Map<string, number>;
  busiestDayOfWeek?: { day: (typeof DAY_NAMES)[number]; messageCount: number };
  /** UTC hour 0-23. */
  busiestHour?: { hour: number; messageCount: number };
  longestStreakDays: number;
  longestConversation?: { uuid: string; name: string; messageCount: number };
  mostActiveMonth?: { month: string; messageCount: number }; // "YYYY-MM"
  mostActiveYear?: { year: string; messageCount: number };
}

function messageWordCount(message: ConversationMessage): number {
  const parts: string[] = [];
  if (message.text) parts.push(message.text);
  for (const item of message.content) {
    if (item.type === 'text') parts.push(item.text);
    else if (item.type === 'thinking') parts.push(item.thinking);
  }
  const joined = parts.join(' ').trim();
  return joined.length === 0 ? 0 : joined.split(/\s+/).length;
}

function utcDateKey(iso: string): string {
  return iso.slice(0, 10); // ISO timestamps from the export are already UTC ("...T..+00:00")
}

function utcMonthKey(iso: string): string {
  return iso.slice(0, 7);
}

function utcYearKey(iso: string): string {
  return iso.slice(0, 4);
}

function longestConsecutiveStreak(dateKeys: Iterable<string>): number {
  const days = Array.from(new Set(dateKeys))
    .map((key) => Date.parse(`${key}T00:00:00Z`))
    .sort((a, b) => a - b);

  let longest = days.length > 0 ? 1 : 0;
  let current = longest;
  const oneDayMs = 24 * 60 * 60 * 1000;

  for (let i = 1; i < days.length; i++) {
    current = days[i] - days[i - 1] === oneDayMs ? current + 1 : 1;
    longest = Math.max(longest, current);
  }

  return longest;
}

function maxByCount<K>(counts: Map<K, number>): { key: K; count: number } | undefined {
  let best: { key: K; count: number } | undefined;
  for (const [key, count] of counts) {
    if (!best || count > best.count) best = { key, count };
  }
  return best;
}

export function computeStats(conversations: ConversationsExport): DashboardStats {
  const dailyActivity = new Map<string, number>();
  const hourCounts = new Map<number, number>();
  const dayOfWeekCounts = new Map<number, number>();
  const monthCounts = new Map<string, number>();
  const yearCounts = new Map<string, number>();

  let totalMessages = 0;
  let totalWords = 0;
  let firstActiveIso: string | undefined;
  let lastActiveIso: string | undefined;
  let longestConversation: DashboardStats['longestConversation'];

  for (const conversation of conversations) {
    if (
      !longestConversation ||
      conversation.chat_messages.length > longestConversation.messageCount
    ) {
      longestConversation = {
        uuid: conversation.uuid,
        name: conversation.name,
        messageCount: conversation.chat_messages.length,
      };
    }

    for (const message of conversation.chat_messages) {
      totalMessages++;
      totalWords += messageWordCount(message);

      const iso = message.created_at;
      if (!firstActiveIso || iso < firstActiveIso) firstActiveIso = iso;
      if (!lastActiveIso || iso > lastActiveIso) lastActiveIso = iso;

      const dateKey = utcDateKey(iso);
      dailyActivity.set(dateKey, (dailyActivity.get(dateKey) ?? 0) + 1);

      const date = new Date(iso);
      hourCounts.set(date.getUTCHours(), (hourCounts.get(date.getUTCHours()) ?? 0) + 1);
      dayOfWeekCounts.set(date.getUTCDay(), (dayOfWeekCounts.get(date.getUTCDay()) ?? 0) + 1);

      const monthKey = utcMonthKey(iso);
      monthCounts.set(monthKey, (monthCounts.get(monthKey) ?? 0) + 1);
      const yearKey = utcYearKey(iso);
      yearCounts.set(yearKey, (yearCounts.get(yearKey) ?? 0) + 1);
    }
  }

  const daysActive =
    firstActiveIso && lastActiveIso
      ? Math.floor((Date.parse(utcDateKey(lastActiveIso)) - Date.parse(utcDateKey(firstActiveIso))) / 86_400_000) + 1
      : 0;

  const busiestDay = maxByCount(dayOfWeekCounts);
  const busiestHour = maxByCount(hourCounts);
  const bestMonth = maxByCount(monthCounts);
  const bestYear = maxByCount(yearCounts);

  return {
    firstActiveDate: firstActiveIso ? utcDateKey(firstActiveIso) : undefined,
    daysActive,
    totalConversations: conversations.length,
    totalMessages,
    totalWords,
    approxTokenEstimate: Math.round(totalWords * 1.3),
    dailyActivity,
    busiestDayOfWeek: busiestDay
      ? { day: DAY_NAMES[busiestDay.key], messageCount: busiestDay.count }
      : undefined,
    busiestHour: busiestHour ? { hour: busiestHour.key, messageCount: busiestHour.count } : undefined,
    longestStreakDays: longestConsecutiveStreak(dailyActivity.keys()),
    longestConversation,
    mostActiveMonth: bestMonth ? { month: bestMonth.key, messageCount: bestMonth.count } : undefined,
    mostActiveYear: bestYear ? { year: bestYear.key, messageCount: bestYear.count } : undefined,
  };
}

export type { ConversationItem };
