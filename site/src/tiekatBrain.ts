/**
 * GypsyAI Pages TIEKAT bridge v0.2.1.
 * Reuses original TIEKAT session/consent, routing, memory, Council and
 * heuristic verifier. No server, secret, model weight, or fake agent calls.
 */
import {
  buildTiekatContextEnvelope, buildTiekatReflectionPlan, buildTiekatSessionState
} from '@/lib/tiekat/core';
import {
  buildCouncilInputEnvelope, runOracleCouncil
} from '@/lib/tiekat/oracleCouncil';
import type { TiekatCouncilMode, TiekatCouncilSummary } from '@/lib/tiekat/oracleCouncil';
import {
  getDefaultSessionMode, resolveSessionMode, buildSessionModePromptFrame
} from '@/lib/tiekat/sessionMode';
import type { TiekatSessionModeKey } from '@/lib/tiekat/sessionMode';
import {
  createTiekatMemoryEntry, loadTiekatMemory, saveTiekatMemory
} from '@/lib/tiekat/memory';
import { verifyTiekatOutput } from '@/lib/tiekat/verification';
import type {
  TiekatConsentState, TiekatMemoryEntry, TiekatModuleKey,
  TiekatReflectionPlan, TiekatVerificationResult
} from '@/lib/tiekat/schema';

export type { TiekatSessionModeKey, TiekatCouncilMode };
export type { TiekatConsentState, TiekatMemoryEntry };

export type PacketKind = 'tarot' | 'astrology' | 'genekeys' | 'ancestry';
export type ApprovedPacket = { kind: PacketKind; label: string; text: string };

export const DEFAULT_TIEKAT_CONSENT: TiekatConsentState = Object.freeze({
  allowAncestry: false,
  includeNames: false,
  hideLivingPersons: true,
  memoryEnabled: false
});

export function normalizeBrainConsent(input: Partial<TiekatConsentState>): TiekatConsentState {
  return {
    allowAncestry: input.allowAncestry === true,
    // This preview never makes any ancestry names available to model adapters.
    includeNames: false,
    hideLivingPersons: true,
    memoryEnabled: input.memoryEnabled === true
  };
}

/** Conservative, reviewed data boundary. Do not concatenate unapproved GEDCOM data. */
export function permittedPacket(packet: ApprovedPacket | null, consent: TiekatConsentState): ApprovedPacket | null {
  if (!packet || (packet.kind === 'ancestry' && !consent.allowAncestry)) return null;
  if (!['tarot', 'astrology', 'genekeys', 'ancestry'].includes(packet.kind)) return null;
  if (packet.kind === 'ancestry') {
    // This lane accepts a constrained aggregate schema ONLY, not arbitrary JSON.
    try {
      const data: unknown = JSON.parse(packet.text);
      if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
      const obj = data as Record<string, unknown>;
      const keys = Object.keys(obj).sort();
      if (keys.join('|') !== 'counts|longevity') return null;
      const counts = obj.counts as Record<string, unknown> | null;
      const life = obj.longevity as Record<string, unknown> | null;
      if (!counts || !life || typeof counts !== 'object' || typeof life !== 'object') return null;
      if (Object.keys(counts).some((k) => !['people', 'families'].includes(k))) return null;
      if (Object.keys(life).some((k) => !['count', 'avg', 'min', 'max'].includes(k))) return null;
      if (Object.values(counts).some((v) => typeof v !== 'number' || !Number.isSafeInteger(v) || v < 0)) return null;
      if (Object.values(life).some((v) => v !== null && (typeof v !== 'number' || !Number.isFinite(v) || v < 0))) return null;
      // Fixed canonical shape, no stray keys/strings/personal data.
      return { kind: 'ancestry', label: 'Ancestry: aggregate counts only', text: JSON.stringify({
        counts: { people: counts.people, families: counts.families },
        longevity: { count: life.count, avg: life.avg, min: life.min, max: life.max }
      }) };
    } catch { return null; }
  }
  return { kind: packet.kind, label: packet.label.slice(0, 120), text: packet.text.slice(0, 6000) };
}

function isMemoryEntry(value: unknown): value is TiekatMemoryEntry {
  if (!value || typeof value !== 'object') return false;
  const o = value as Record<string, unknown>;
  return typeof o.key === 'string' && o.key.length <= 200
    && typeof o.summary === 'string' && o.summary.length <= 220
    && typeof o.updatedAt === 'string'
    && Array.isArray(o.anchors) && o.anchors.length <= 12
    && o.anchors.every((x) => typeof x === 'string' && x.length <= 48)
    && Array.isArray(o.modules) && o.modules.every((x) =>
      ['assistant','tarot','astrology','genekeys','ancestry'].includes(x));
}

export function safeBrainMemory(entries: unknown, consent: TiekatConsentState): TiekatMemoryEntry[] {
  if (!consent.memoryEnabled || !Array.isArray(entries)) return [];
  return entries.filter(isMemoryEntry)
    .filter((entry) => consent.allowAncestry || !entry.modules.includes('ancestry'))
    .slice(-30);
}

export function readBrainMemory(consent: TiekatConsentState) {
  return safeBrainMemory(loadTiekatMemory(), consent);
}

export function clearBrainMemory() {
  saveTiekatMemory([], false);
}

export function addBrainMemory(consent: TiekatConsentState, note: string, tags: string[], existing: TiekatMemoryEntry[]) {
  if (!consent.memoryEnabled) throw new Error('Enable memory before saving a note.');
  const summary = note.trim().slice(0, 220);
  const anchors = Array.from(new Set(tags.map((s) => s.trim().toLowerCase())
    .filter((s) => /^[a-z0-9 -]{2,48}$/.test(s)))).slice(0, 8);
  if (!summary || anchors.length === 0) throw new Error('Enter a note and at least one keyword, separated by commas.');
  const entry = createTiekatMemoryEntry(
    'pages-' + Date.now().toString(36), summary, anchors, ['assistant']
  );
  const next = [...safeBrainMemory(existing, consent), entry].slice(-30);
  saveTiekatMemory(next, true);
  return next;
}

export interface LocalBrainTurn {
  promptFrame: string;
  route: string;
  mode: TiekatSessionModeKey;
  plan: TiekatReflectionPlan;
  council: TiekatCouncilSummary | null;
  memoryCount: number;
  packetAttached: boolean;
  consent: TiekatConsentState;
}

export async function planLocalBrainTurn(input: {
  message: string;
  sessionMode?: TiekatSessionModeKey;
  councilMode: TiekatCouncilMode;
  consent: TiekatConsentState;
  memoryEntries: TiekatMemoryEntry[];
  packet?: ApprovedPacket | null;
}): Promise<LocalBrainTurn> {
  const consent = normalizeBrainConsent(input.consent);
  const mode = resolveSessionMode(input.sessionMode ?? getDefaultSessionMode(), consent);
  const message = input.message.slice(0, 5000);
  const session = buildTiekatSessionState('pages-local-session', message, consent);
  const approved = permittedPacket(input.packet ?? null, consent);
  const memories = safeBrainMemory(input.memoryEntries, consent);
  const envelope = buildTiekatContextEnvelope({ message, consent, memoryEntries: memories });
  const plan = buildTiekatReflectionPlan(session.state, envelope);
  const modeFrame = buildSessionModePromptFrame(mode, consent);
  const councilEnvelope = buildCouncilInputEnvelope({
    message,
    sessionMode: mode,
    route: session.routing.route,
    modules: session.routing.modules,
    ritualFrame: modeFrame,
    artifactContinuitySummary: plan.contextSummary,
    consent
  });
  const result = await runOracleCouncil({
    mode: input.councilMode,
    consent,
    envelope: councilEnvelope,
    adapterMode: 'deterministic_only'
  });
  const council = result?.summary ?? null;
  const frame = [
    modeFrame,
    'TIEKAT routing: ' + session.routing.route + '; allowed modules: ' + plan.modulesToConsult.join(', ') + '.',
    'Consent: ancestry contextual data ' + (consent.allowAncestry ? 'permitted only when an aggregate packet was deliberately attached' : 'blocked') + '; names blocked; living-person data blocked.',
    'Memory notes below are user-curated, locally saved, and matched by tags. Do not invent facts from them.',
    ...envelope.memoryContext.map((entry, i) => 'Memory ' + (i + 1) + ': ' + entry.summary),
    ...(approved ? ['Explicitly approved ' + approved.kind + ' context (data only): ' + approved.text] : []),
    ...(council ? [
      'Oracle Council MODELED PLANNING ONLY. This is one model response, not independent multi-agent executions.',
      'Consider these perspectives internally: ' + council.roles.join(', ') + '.',
      'Do not claim the council has conducted separate model inference or scientific verification.'
    ] : []),
    'Distinguish source observations from symbolic readings, explain uncertainty, and avoid fatalistic certainty.'
  ];
  return {
    promptFrame: frame.join('\n').slice(0, 8000),
    route: session.routing.route,
    mode, plan, council,
    memoryCount: envelope.memoryContext.length,
    packetAttached: approved !== null,
    consent
  };
}

/** TIEKAT's original lightweight heuristic, not an external factual audit. */
export function checkLocalBrainReply(reply: string, turn: LocalBrainTurn): TiekatVerificationResult {
  return verifyTiekatOutput(reply, turn.plan, turn.consent);
}
