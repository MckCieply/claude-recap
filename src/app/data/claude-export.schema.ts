/**
 * Runtime schema for the official Claude.ai data export's `conversations.json`.
 *
 * The export format isn't publicly documented and has drifted across versions, so this
 * validates defensively (optional fields, `.passthrough()` for unknown ones) rather than
 * assuming a fixed shape. Adapted from the MIT-licensed schema in
 * https://github.com/osteele/claude-chat-viewer (src/schemas/chat.ts), trimmed to the
 * bulk `conversations.json` array shape only (that project also handles a single-conversation
 * export shape we don't need here).
 */
import { z } from 'zod';

const AttachmentSchema = z
  .object({
    id: z.string().optional(),
    file_name: z.string().optional(),
    file_size: z.number().optional(),
    file_type: z.string().optional(),
    extracted_content: z.string().optional(),
    created_at: z.string().optional(),
  })
  .passthrough();

const ToolUseSchema = z
  .object({
    type: z.literal('tool_use'),
    name: z.string(),
  })
  .passthrough();

const ToolResultSchema = z
  .object({
    type: z.literal('tool_result'),
    name: z.string(),
    is_error: z.boolean().optional(),
  })
  .passthrough();

const KNOWN_CONTENT_TYPES = ['text', 'thinking', 'voice_note', 'tool_use', 'tool_result'] as const;

const KnownContentItemSchema = z.union([
  z
    .object({
      type: z.literal('text'),
      text: z.string(),
    })
    .passthrough(),
  z
    .object({
      type: z.literal('thinking'),
      thinking: z.string(),
    })
    .passthrough(),
  z
    .object({
      type: z.literal('voice_note'),
      text: z.string(),
    })
    .passthrough(),
  ToolUseSchema,
  ToolResultSchema,
]);

/** Unknown content-item types (export format drift) fall back to an empty text block instead of failing validation. */
const ContentItemSchema = z.preprocess((value) => {
  if (
    value &&
    typeof value === 'object' &&
    'type' in value &&
    typeof (value as { type: unknown }).type === 'string' &&
    !KNOWN_CONTENT_TYPES.includes((value as { type: string }).type as (typeof KNOWN_CONTENT_TYPES)[number])
  ) {
    return { type: 'text' as const, text: '' };
  }
  return value;
}, KnownContentItemSchema);

const ConversationMessageSchema = z
  .object({
    uuid: z.string(),
    text: z.string().optional(),
    content: z.array(ContentItemSchema),
    sender: z.enum(['human', 'assistant']),
    created_at: z.string(),
    updated_at: z.string(),
    attachments: z.array(AttachmentSchema).optional(),
    index: z.number().default(0),
  })
  .passthrough();

export const ConversationItemSchema = z
  .object({
    uuid: z.string(),
    name: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    chat_messages: z.array(ConversationMessageSchema),
    model: z.string().optional(),
  })
  .passthrough();

export const ConversationsExportSchema = z.array(ConversationItemSchema);

export type ConversationMessage = z.infer<typeof ConversationMessageSchema>;
export type ConversationItem = z.infer<typeof ConversationItemSchema>;
export type ConversationsExport = z.infer<typeof ConversationsExportSchema>;
