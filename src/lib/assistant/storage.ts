export interface AssistantMessage { role: 'user' | 'assistant'; content: string; timestamp: string; tags: string[] }
export interface AssistantSession { id: string; title: string; messages: AssistantMessage[]; summary?: string; updatedAt: string }

const DB_NAME = 'gypsy-ai-local';
const STORE = 'assistantChats';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('ancestry')) db.createObjectStore('ancestry');
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function loadAssistantSessions(): Promise<AssistantSession[]> {
  const db = await openDb();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get('sessions');
    req.onsuccess = () => resolve(req.result ?? []);
    req.onerror = () => reject(req.error);
  });
}

export async function saveAssistantSessions(sessions: AssistantSession[]) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(sessions, 'sessions');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function sessionsToMarkdown(session: AssistantSession) {
  return `# ${session.title}\n\n${session.messages.map((m) => `## ${m.role}\n${m.content}`).join('\n\n')}`;
}
