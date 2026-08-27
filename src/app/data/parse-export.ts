import { ConversationsExportSchema, type ConversationsExport } from './claude-export.schema';

export type ParseExportResult =
  | { kind: 'success'; conversations: ConversationsExport }
  | { kind: 'error'; message: string };

/**
 * Validates and normalizes an already-JSON.parsed `conversations.json`.
 * Never throws — callers render `message` directly, it's not meant to be developer-only.
 */
export function parseConversationsExport(data: unknown): ParseExportResult {
  const result = ConversationsExportSchema.safeParse(data);

  if (result.success) {
    return { kind: 'success', conversations: result.data };
  }

  if (!Array.isArray(data)) {
    return {
      kind: 'error',
      message:
        "This doesn't look like conversations.json — expected a JSON array of conversations at the top level.",
    };
  }

  return {
    kind: 'error',
    message: `conversations.json didn't match the expected format (${result.error.issues.length} issue(s)). It may be from a newer/older export version than this tool expects.`,
  };
}
