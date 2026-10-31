/**
 * GAIA ⇄ PhiServe direct browser adapter.
 * No auto-connect, model install, stored credentials, external service discovery,
 * unauthorized reading packets or fallback to other model providers.
 */
import { buildOracleMessages } from './logic';
import type { ChatTurn } from './logic';

export const PHISERVE_LOCAL_URL = 'http://127.0.0.1:11435';
export const PHISERVE_MAX_PROMPT = 5000;
export const PHISERVE_MAX_RESPONSE = 100000;

export function phiServeLoopbackOrigin(input: string): string {
  let url: URL;
  try { url = new URL(input.trim()); }
  catch { throw new Error('Enter a complete PhiServe loopback URL.'); }
  if (url.protocol !== 'http:' ||
      !['localhost','127.0.0.1','[::1]'].includes(url.hostname) ||
      !url.port || url.username || url.password || url.search || url.hash ||
      (url.pathname !== '/' && url.pathname !== '')) {
    throw new Error('PhiServe only accepts an HTTP loopback origin with an explicit port; no remote host or credentials.');
  }
  return url.origin;
}

function tokenHeaders(token: string, json = false): Record<string, string> {
  if (typeof token !== 'string' || token.trim().length < 32 ||
      token.trim().length > 511 || /\s/.test(token.trim())) {
    throw new Error('Paste a valid private PhiServe bearer token; it stays in this browser tab only.');
  }
  return {
    Authorization: 'Bearer ' + token.trim(),
    ...(json ? { 'Content-Type': 'application/json' } : {}),
  };
}

function httpError(status: number): Error {
  // Never include upstream response body, prompt, token or URL.
  const hints: Record<number, string> = {
    401: 'token missing or invalid',
    403: 'this browser origin was not allowed',
    409: 'local model currently busy',
    429: 'request limit reached',
    503: 'model unavailable or transitioning',
  };
  return new Error('PhiServe local HTTP ' + status + ': ' + (hints[status] || 'request rejected') + '. No alternate provider was contacted.');
}

function privacyFetch(): Pick<RequestInit, 'redirect' | 'credentials' | 'cache' | 'referrerPolicy'> {
  return { redirect: 'error', credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer' };
}

export async function discoverPhiServeModels(
  endpoint: string, bearerToken: string,
  fetcher: typeof fetch = fetch,
): Promise<string[]> {
  const base = phiServeLoopbackOrigin(endpoint);
  const response = await fetcher(base + '/api/tags', {
    ...privacyFetch(), method: 'GET', headers: tokenHeaders(bearerToken),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw httpError(response.status);
  const body: unknown = await response.json();
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('PhiServe returned invalid model catalog metadata.');
  }
  const list = (body as { models?: unknown }).models;
  if (!Array.isArray(list) || list.length > 200 || !list.every((m) =>
    m && typeof m === 'object' && typeof (m as { name?: unknown }).name === 'string' &&
    (m as { name: string }).name.length > 0 &&
    (m as { name: string }).name.length <= 160
  )) throw new Error('PhiServe returned an invalid GGUF model catalog.');
  return list.map((m) => (m as { name: string }).name);
}

export async function askPhiServeOracle(
  endpoint: string, bearerToken: string, model: string, turns: ChatTurn[],
  approvedContext = '', fetcher: typeof fetch = fetch,
): Promise<string> {
  const base = phiServeLoopbackOrigin(endpoint);
  if (!model.trim() || model.length > 160) throw new Error('Choose a registered local PhiServe model.');
  if (turns.some((t) => t.content.length > PHISERVE_MAX_PROMPT)) {
    throw new Error('PhiServe Oracle chat messages exceed the maximum length.');
  }
  const messages = buildOracleMessages(turns, approvedContext);
  const response = await fetcher(base + '/api/chat', {
    ...privacyFetch(), method: 'POST',
    headers: tokenHeaders(bearerToken, true),
    body: JSON.stringify({
      model, stream: false, options: { temperature: 0.3, num_predict: 256 }, messages,
    }),
    signal: AbortSignal.timeout(120000),
  });
  if (!response.ok) throw httpError(response.status);
  const data: unknown = await response.json();
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('PhiServe returned invalid text response metadata.');
  }
  const body = data as { done?: unknown; error?: unknown; message?: { role?: unknown; content?: unknown } };
  const content = body.message?.content;
  if (body.done !== true || body.error || body.message?.role !== 'assistant' ||
      typeof content !== 'string' || !content.trim() || content.length > PHISERVE_MAX_RESPONSE) {
    throw new Error('PhiServe did not return a complete, bounded assistant text response.');
  }
  return content;
}
