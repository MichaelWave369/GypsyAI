import { dbGet, dbSet } from '@/lib/local/db';

export interface AssistantMessage { role: 'user' | 'assistant'; content: string; timestamp: string; tags: string[] }
export interface AssistantSession { id: string; title: string; messages: AssistantMessage[]; summary?: string; updatedAt: string }

export async function loadAssistantSessions(): Promise<AssistantSession[]> {
  return (await dbGet('assistantChats')) ?? [];
}

export async function saveAssistantSessions(sessions: AssistantSession[]) {
  await dbSet('assistantChats', sessions);
}

export function sessionsToMarkdown(session: AssistantSession) {
  return `# ${session.title}\n\n${session.messages.map((m) => `## ${m.role}\n${m.content}`).join('\n\n')}`;
}
