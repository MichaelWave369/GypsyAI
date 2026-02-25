import { describe, expect, it } from 'vitest';
import { sessionsToMarkdown } from '@/lib/assistant/storage';

describe('assistant export round-trip helpers', () => {
  it('renders markdown from chat session', () => {
    const s = { id: '1', title: 't', updatedAt: 'now', messages: [{ role: 'user', content: 'hi', timestamp: 'now', tags: [] }, { role: 'assistant', content: 'hello', timestamp: 'now', tags: [] }] };
    const md = sessionsToMarkdown(s as any);
    expect(md).toContain('# t');
    expect(md).toContain('## assistant');
  });
});
