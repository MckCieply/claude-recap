import { describe, expect, it } from 'vitest';
import type { ConversationsExport } from './claude-export.schema';
import { computeStats } from './stats';

// Synthetic fixture — not real export data. Spans Mon 2024-01-01 through Wed 2024-01-03 (UTC).
const fixture: ConversationsExport = [
  {
    uuid: 'conv-a',
    name: 'Conversation A',
    created_at: '2024-01-01T10:00:00.000Z',
    updated_at: '2024-01-01T10:05:00.000Z',
    chat_messages: [
      {
        uuid: 'msg-a1',
        index: 0,
        sender: 'human',
        text: 'hello world',
        content: [],
        created_at: '2024-01-01T10:00:00.000Z',
        updated_at: '2024-01-01T10:00:00.000Z',
      },
      {
        uuid: 'msg-a2',
        index: 1,
        sender: 'assistant',
        content: [{ type: 'text', text: 'hi there friend' }],
        created_at: '2024-01-01T10:05:00.000Z',
        updated_at: '2024-01-01T10:05:00.000Z',
      },
    ],
  },
  {
    uuid: 'conv-b',
    name: 'Conversation B',
    created_at: '2024-01-02T09:00:00.000Z',
    updated_at: '2024-01-03T09:00:00.000Z',
    chat_messages: [
      {
        uuid: 'msg-b1',
        index: 0,
        sender: 'human',
        text: 'one two three four',
        content: [],
        created_at: '2024-01-02T09:00:00.000Z',
        updated_at: '2024-01-02T09:00:00.000Z',
      },
      {
        uuid: 'msg-b2',
        index: 1,
        sender: 'assistant',
        content: [{ type: 'text', text: 'five six' }],
        created_at: '2024-01-02T09:01:00.000Z',
        updated_at: '2024-01-02T09:01:00.000Z',
      },
      {
        uuid: 'msg-b3',
        index: 2,
        sender: 'human',
        text: 'seven',
        content: [],
        created_at: '2024-01-03T09:00:00.000Z',
        updated_at: '2024-01-03T09:00:00.000Z',
      },
    ],
  },
];

describe('computeStats', () => {
  const stats = computeStats(fixture);

  it('counts conversations and messages', () => {
    expect(stats.totalConversations).toBe(2);
    expect(stats.totalMessages).toBe(5);
  });

  it('counts words across text and content blocks', () => {
    // "hello world"(2) + "hi there friend"(3) + "one two three four"(4) + "five six"(2) + "seven"(1)
    expect(stats.totalWords).toBe(12);
    expect(stats.approxTokenEstimate).toBe(16); // round(12 * 1.3)
  });

  it('buckets daily activity for the heatmap', () => {
    expect(stats.dailyActivity.get('2024-01-01')).toBe(2);
    expect(stats.dailyActivity.get('2024-01-02')).toBe(2);
    expect(stats.dailyActivity.get('2024-01-03')).toBe(1);
  });

  it('computes days active as an inclusive span', () => {
    expect(stats.firstActiveDate).toBe('2024-01-01');
    expect(stats.daysActive).toBe(3);
  });

  it('finds the longest consecutive-day streak', () => {
    expect(stats.longestStreakDays).toBe(3);
  });

  it('finds the busiest hour (UTC)', () => {
    expect(stats.busiestHour).toEqual({ hour: 9, messageCount: 3 });
  });

  it('finds the busiest day of week (UTC)', () => {
    expect(stats.busiestDayOfWeek).toEqual({ day: 'Monday', messageCount: 2 });
  });

  it('identifies the longest conversation by message count', () => {
    expect(stats.longestConversation).toEqual({
      uuid: 'conv-b',
      name: 'Conversation B',
      messageCount: 3,
    });
  });

  it('identifies the most active month and year', () => {
    expect(stats.mostActiveMonth).toEqual({ month: '2024-01', messageCount: 5 });
    expect(stats.mostActiveYear).toEqual({ year: '2024', messageCount: 5 });
  });
});

describe('computeStats on empty input', () => {
  it('returns zeroed stats without throwing', () => {
    const stats = computeStats([]);
    expect(stats.totalConversations).toBe(0);
    expect(stats.totalMessages).toBe(0);
    expect(stats.firstActiveDate).toBeUndefined();
    expect(stats.longestStreakDays).toBe(0);
  });
});
