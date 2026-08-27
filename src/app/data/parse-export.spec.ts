import { describe, expect, it } from 'vitest';
import { parseConversationsExport } from './parse-export';

const validConversation = {
  uuid: 'conv-1',
  name: 'Test',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  chat_messages: [
    {
      uuid: 'msg-1',
      sender: 'human',
      text: 'hi',
      content: [],
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    },
  ],
};

describe('parseConversationsExport', () => {
  it('accepts a valid conversations.json array', () => {
    const result = parseConversationsExport([validConversation]);
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.conversations).toHaveLength(1);
      expect(result.conversations[0].uuid).toBe('conv-1');
    }
  });

  it('tolerates unknown extra fields (export format drift)', () => {
    const result = parseConversationsExport([
      { ...validConversation, some_future_field: { nested: true } },
    ]);
    expect(result.kind).toBe('success');
  });

  it('rejects non-array input with a friendly message', () => {
    const result = parseConversationsExport({ not: 'an array' });
    expect(result.kind).toBe('error');
    if (result.kind === 'error') {
      expect(result.message).toMatch(/conversations\.json/i);
    }
  });

  it('rejects an array of malformed conversations', () => {
    const result = parseConversationsExport([{ uuid: 'conv-1' }]); // missing required fields
    expect(result.kind).toBe('error');
  });

  it('replaces unrecognized content-item types with an empty text block instead of failing', () => {
    const result = parseConversationsExport([
      {
        ...validConversation,
        chat_messages: [
          {
            ...validConversation.chat_messages[0],
            content: [{ type: 'some_future_type', weird_field: 123 }],
          },
        ],
      },
    ]);
    expect(result.kind).toBe('success');
  });
});
