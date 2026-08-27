import { describe, expect, it } from 'vitest';
import type { ConversationsExport } from './claude-export.schema';
import { computeStats } from './stats';
import { computeMultiSourceStats, type LabeledExport } from './multi-source-stats';

// Synthetic fixtures — not real export data. One conversation, one message, per export.
function singleMessageExport(id: string, dateIso: string, text: string): ConversationsExport {
  return [
    {
      uuid: `conv-${id}`,
      name: `Conversation ${id}`,
      created_at: dateIso,
      updated_at: dateIso,
      chat_messages: [
        {
          uuid: `msg-${id}`,
          index: 0,
          sender: 'human',
          text,
          content: [],
          created_at: dateIso,
          updated_at: dateIso,
        },
      ],
    },
  ];
}

describe('computeMultiSourceStats', () => {
  it('returns zeroed stats and no sources for an empty export list, without throwing', () => {
    const result = computeMultiSourceStats([]);

    expect(result.sources).toEqual([]);
    expect(result.stats.totalConversations).toBe(0);
    expect(result.stats.totalMessages).toBe(0);
    expect(result.stats.totalWords).toBe(0);
    expect(result.stats.firstActiveDate).toBeUndefined();
    expect(result.stats.longestStreakDays).toBe(0);
    expect(result.stats.dailyActivity.size).toBe(0);
  });

  it('is behaviorally identical to calling computeStats directly for a single source', () => {
    const conversations = singleMessageExport('a', '2024-01-01T10:00:00.000Z', 'hello world');
    const exports: LabeledExport[] = [{ label: 'Personal', conversations }];

    const result = computeMultiSourceStats(exports);
    const direct = computeStats(conversations);

    expect(result.stats).toEqual(direct);
    expect(result.sources).toHaveLength(1);
    expect(result.sources[0].label).toBe('Personal');
    expect(result.sources[0].colorSlot).toBe(0);
    expect(result.sources[0].dailyActivity).toEqual(direct.dailyActivity);
  });

  it('combines totals across two sources and assigns colorSlot 0 and 1', () => {
    const personal = singleMessageExport('a', '2024-01-01T10:00:00.000Z', 'hello world'); // 2 words
    const work = singleMessageExport('b', '2024-01-02T10:00:00.000Z', 'one two three'); // 3 words

    const result = computeMultiSourceStats([
      { label: 'Personal', conversations: personal },
      { label: 'Work', conversations: work },
    ]);

    expect(result.stats.totalConversations).toBe(2);
    expect(result.stats.totalMessages).toBe(2);
    expect(result.stats.totalWords).toBe(5);
    expect(result.stats.dailyActivity.get('2024-01-01')).toBe(1);
    expect(result.stats.dailyActivity.get('2024-01-02')).toBe(1);

    expect(result.sources.map((s) => s.colorSlot)).toEqual([0, 1]);
    expect(result.sources[0].dailyActivity.get('2024-01-01')).toBe(1);
    expect(result.sources[0].dailyActivity.has('2024-01-02')).toBe(false);
    expect(result.sources[1].dailyActivity.get('2024-01-02')).toBe(1);
  });

  it('combines totals across three sources and assigns colorSlot 0, 1, 2', () => {
    const exports: LabeledExport[] = ['a', 'b', 'c'].map((id, i) => ({
      label: `Source ${id}`,
      conversations: singleMessageExport(id, `2024-01-0${i + 1}T10:00:00.000Z`, 'word'),
    }));

    const result = computeMultiSourceStats(exports);

    expect(result.stats.totalConversations).toBe(3);
    expect(result.stats.totalMessages).toBe(3);
    expect(result.sources.map((s) => s.colorSlot)).toEqual([0, 1, 2]);
  });

  it('folds a 4th+ source fully into the combined stats, with its own dailyActivity, but no colorSlot', () => {
    const exports: LabeledExport[] = ['a', 'b', 'c', 'd', 'e'].map((id, i) => ({
      label: `Source ${id}`,
      conversations: singleMessageExport(id, `2024-01-0${i + 1}T10:00:00.000Z`, 'word'),
    }));

    const result = computeMultiSourceStats(exports);

    expect(result.sources).toHaveLength(5);
    expect(result.sources.map((s) => s.colorSlot)).toEqual([0, 1, 2, undefined, undefined]);

    // The 4th and 5th sources are still fully counted in the combined totals...
    expect(result.stats.totalConversations).toBe(5);
    expect(result.stats.totalMessages).toBe(5);
    expect(result.stats.dailyActivity.get('2024-01-04')).toBe(1);
    expect(result.stats.dailyActivity.get('2024-01-05')).toBe(1);

    // ...and still get their own per-source dailyActivity entry, despite colorSlot being undefined.
    expect(result.sources[3].dailyActivity.get('2024-01-04')).toBe(1);
    expect(result.sources[4].dailyActivity.get('2024-01-05')).toBe(1);
  });

  it('does not use labels as keys, so duplicate labels are preserved independently', () => {
    const first = singleMessageExport('a', '2024-01-01T10:00:00.000Z', 'one');
    const second = singleMessageExport('b', '2024-01-02T10:00:00.000Z', 'two three');

    const result = computeMultiSourceStats([
      { label: 'Export', conversations: first },
      { label: 'Export', conversations: second },
    ]);

    expect(result.sources).toHaveLength(2);
    expect(result.sources[0].label).toBe('Export');
    expect(result.sources[1].label).toBe('Export');
    expect(result.sources[0].colorSlot).toBe(0);
    expect(result.sources[1].colorSlot).toBe(1);
    expect(result.sources[0].dailyActivity.get('2024-01-01')).toBe(1);
    expect(result.sources[1].dailyActivity.get('2024-01-02')).toBe(1);
    expect(result.stats.totalConversations).toBe(2);
    expect(result.stats.totalWords).toBe(3); // "one"(1) + "two three"(2)
  });
});
