import type { ConversationsExport } from './claude-export.schema';
import { computeStats } from './stats';

/**
 * Placeholder data for UI development — there's no upload flow wired up yet.
 * Deterministic (seeded), not real usage: ~9 months of synthetic activity with
 * a few busy streaks, so the heatmap and stat tiles have something to show.
 * Delete/replace once the drop-a-file flow exists.
 */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildSampleExport(): ConversationsExport {
  const rand = mulberry32(42);
  const conversations: ConversationsExport = [];
  const startMs = Date.parse('2025-11-15T00:00:00.000Z');
  const dayMs = 86_400_000;
  const totalDays = 285; // ~9.5 months, ending mid-way through the current session's "today"

  const topics = [
    'Debugging a flaky test',
    'Refactoring the export parser',
    'Planning the release notes',
    'Explaining a regex',
    'Reviewing a PR',
    'Writing SQL migrations',
    'Brainstorming feature names',
    'Fixing a CSS layout bug',
  ];

  for (let day = 0; day < totalDays; day++) {
    // Skew activity: some days idle, some very active, a couple of multi-day streaks.
    const activity = rand();
    const isActive = activity > 0.35 || (day % 47 < 6); // occasional dense streak
    if (!isActive) continue;

    const conversationsToday = 1 + Math.floor(rand() * 3);
    for (let c = 0; c < conversationsToday; c++) {
      const hour = Math.floor(rand() * 24);
      const baseMs = startMs + day * dayMs + hour * 3_600_000;
      const messageCount = 2 + Math.floor(rand() * 10);
      const topic = topics[Math.floor(rand() * topics.length)];

      const messages = Array.from({ length: messageCount }, (_, i) => {
        const ms = baseMs + i * 60_000;
        const sender: 'human' | 'assistant' = i % 2 === 0 ? 'human' : 'assistant';
        const wordCount = 8 + Math.floor(rand() * 40);
        const text = Array.from({ length: wordCount }, () => 'word').join(' ');
        return {
          uuid: `msg-${day}-${c}-${i}`,
          index: i,
          sender,
          text,
          content: [],
          created_at: new Date(ms).toISOString(),
          updated_at: new Date(ms).toISOString(),
        };
      });

      conversations.push({
        uuid: `conv-${day}-${c}`,
        name: topic,
        created_at: messages[0].created_at,
        updated_at: messages[messages.length - 1].created_at,
        chat_messages: messages,
      });
    }
  }

  return conversations;
}

export const sampleStats = computeStats(buildSampleExport());
