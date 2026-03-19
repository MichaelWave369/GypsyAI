import { AncestryData } from '@/lib/ancestry/types';
import { AssistantSession } from '@/lib/assistant/storage';
import { TiekatGravityHistoryEntry } from '@/lib/tiekat/schema';
import type { TiekatOracleArtifact } from '@/lib/tiekat/oracleArtifact';
import { BirthProfile, GeneKeysSession, TarotSession } from '@/lib/local/storage';

export const DB_NAME = 'gypsy-ai-local';
export const DB_VERSION = 4;

type StoreMap = {
  profiles: BirthProfile[];
  tarotSessions: TarotSession[];
  astroSessions: unknown[];
  geneKeysSessions: GeneKeysSession[];
  ancestry: AncestryData | null;
  assistantChats: AssistantSession[];
  gravityHistory: TiekatGravityHistoryEntry[];
  oracleArtifacts: TiekatOracleArtifact[];
  meta: { schemaVersion: number; appVersion: string; updatedAt: string };
};

const stores: Array<keyof StoreMap> = [
  'profiles',
  'tarotSessions',
  'astroSessions',
  'geneKeysSessions',
  'ancestry',
  'assistantChats',
  'gravityHistory',
  'oracleArtifacts',
  'meta'
];

export function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const s of stores) if (!db.objectStoreNames.contains(s)) db.createObjectStore(s);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function dbSet<K extends keyof StoreMap>(store: K, value: StoreMap[K]) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put(value, 'data');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function dbGet<K extends keyof StoreMap>(store: K): Promise<StoreMap[K] | null> {
  const db = await openDb();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).get('data');
    req.onsuccess = () => resolve((req.result ?? null) as StoreMap[K] | null);
    req.onerror = () => reject(req.error);
  });
}

export async function dbHealthCheck() {
  const db = await openDb();
  return {
    name: db.name,
    version: db.version,
    stores: Array.from(db.objectStoreNames),
    ok: true
  };
}

export interface BackupPayload {
  schemaVersion: number;
  appVersion: string;
  timestamp: string;
  data: Partial<StoreMap>;
}

const APP_VERSION = '0.1.4';

async function deriveKey(password: string, salt: Uint8Array) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  return await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: Uint8Array.from(salt), iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function exportBackup(encrypt = false, password?: string): Promise<string> {
  const payload: BackupPayload = {
    schemaVersion: DB_VERSION,
    appVersion: APP_VERSION,
    timestamp: new Date().toISOString(),
    data: {}
  };
  for (const s of stores) payload.data[s] = await dbGet(s as keyof StoreMap) as never;
  const plain = JSON.stringify(payload);
  if (!encrypt || !password) return plain;

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: Uint8Array.from(iv) }, key, new TextEncoder().encode(plain));
  return JSON.stringify({ encrypted: true, alg: 'AES-GCM', kdf: 'PBKDF2', salt: Array.from(salt), iv: Array.from(iv), data: Array.from(new Uint8Array(ct)) });
}

export async function restoreBackup(text: string, password?: string): Promise<BackupPayload> {
  let payload: BackupPayload;
  const parsed = JSON.parse(text);
  if (parsed.encrypted) {
    if (!password) throw new Error('Password required for encrypted backup');
    const salt = new Uint8Array(parsed.salt);
    const iv = new Uint8Array(parsed.iv);
    const key = await deriveKey(password, salt);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: Uint8Array.from(iv) }, key, Uint8Array.from(parsed.data));
    payload = JSON.parse(new TextDecoder().decode(plain));
  } else payload = parsed;

  for (const s of stores) {
    if (s in payload.data) await dbSet(s as keyof StoreMap, payload.data[s as keyof StoreMap] as never);
  }
  return payload;
}
