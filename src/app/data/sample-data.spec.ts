import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseConversationsExport } from './parse-export';
import { computeStats } from './stats';

/**
 * Regression check for the bundled demo dataset (public/sample-data/conversations.json,
 * served as a static asset and loaded by the landing screen's "Try it with sample data"
 * button) — catches the fixture drifting from the export schema it's meant to exercise.
 */
const here = dirname(fileURLToPath(import.meta.url));
const samplePath = resolve(here, '../../../public/sample-data/conversations.json');

describe('sample-data/conversations.json', () => {
  it('validates against the export schema and yields a non-trivial dashboard', () => {
    const raw = readFileSync(samplePath, 'utf-8');
    const data: unknown = JSON.parse(raw);
    const result = parseConversationsExport(data);

    expect(result.kind).toBe('success');
    if (result.kind !== 'success') return;

    expect(result.conversations.length).toBeGreaterThan(50);

    const stats = computeStats(result.conversations);
    expect(stats.totalMessages).toBeGreaterThan(500);
    expect(stats.longestStreakDays).toBeGreaterThan(14);
    expect(stats.longestConversation?.messageCount).toBeGreaterThan(50);
  });
});
