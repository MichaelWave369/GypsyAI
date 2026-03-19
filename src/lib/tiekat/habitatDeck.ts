import { HABITAT_DECK_MAX_CARDS } from '@/lib/tiekat/habitatConstants';
import { TiekatHabitatProfile, normalizeHabitatProfile, sortHabitatProfiles } from '@/lib/tiekat/habitatProfile';
import { buildHabitatSphereSignature, TiekatHabitatSphereSignature } from '@/lib/tiekat/habitatSphere';
import { classifyHabitatUsage, formatHabitatUsageBadge } from '@/lib/tiekat/habitatTime';

export const TIEKAT_HABITAT_DECK_EXPORT_VERSION = 'TIEKAT-habitat-deck-v1' as const;
export type TiekatHabitatDeckExportVersion = typeof TIEKAT_HABITAT_DECK_EXPORT_VERSION;
export type TiekatHabitatDeckKind = 'pinned' | 'recent' | 'all' | 'selected';

export interface TiekatHabitatCard {
  id: string;
  profileId: string;
  profileName: string;
  description: string;
  sessionMode: string;
  councilMode: string;
  preferProviderBackedCouncil: boolean;
  showGeometry: boolean;
  showDiagnostics: boolean;
  enableV55Framing: boolean;
  pinned: boolean;
  applyCount: number;
  lastAppliedAt: string | null;
  usageBadge: string;
  continuityLabel: string;
  sphereSignature: TiekatHabitatSphereSignature;
  footer: string;
  version: TiekatHabitatDeckExportVersion;
}

export interface TiekatHabitatDeck {
  id: string;
  name: string;
  kind: TiekatHabitatDeckKind;
  createdAt: string;
  cards: TiekatHabitatCard[];
  footer: string;
  version: TiekatHabitatDeckExportVersion;
}

export interface TiekatHabitatDeckSummary {
  name: string;
  kind: TiekatHabitatDeckKind;
  cardCount: number;
  topCardName: string | null;
  line: string;
}

function toMs(value: string | null): number {
  if (!value) return Number.NEGATIVE_INFINITY;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed;
}

function buildContinuityLabel(profile: TiekatHabitatProfile): string {
  if (!profile.lastAppliedAt || profile.applyCount <= 0) return 'Never applied';
  return profile.applyCount === 1 ? 'Applied once' : `Applied ${profile.applyCount} times`;
}

export function buildHabitatCardFromProfile(profile: TiekatHabitatProfile, now = new Date().toISOString()): TiekatHabitatCard {
  const normalized = normalizeHabitatProfile(profile);
  return {
    id: `habitat-card:${normalized.id}`,
    profileId: normalized.id,
    profileName: normalized.name,
    description: normalized.description,
    sessionMode: normalized.preferences.sessionMode,
    councilMode: normalized.preferences.councilMode,
    preferProviderBackedCouncil: normalized.preferences.preferProviderBackedCouncil,
    showGeometry: normalized.preferences.showGeometry,
    showDiagnostics: normalized.preferences.showDiagnostics,
    enableV55Framing: normalized.preferences.enableV55Framing,
    pinned: normalized.pinned,
    applyCount: normalized.applyCount,
    lastAppliedAt: normalized.lastAppliedAt,
    usageBadge: formatHabitatUsageBadge(classifyHabitatUsage(normalized, now)),
    continuityLabel: buildContinuityLabel(normalized),
    sphereSignature: buildHabitatSphereSignature(normalized),
    footer: 'Local habitat ritual object — configuration only. No session content or physical measurement data included.',
    version: TIEKAT_HABITAT_DECK_EXPORT_VERSION
  };
}

export function buildHabitatDeck(args: {
  profiles: TiekatHabitatProfile[];
  kind: TiekatHabitatDeckKind;
  name?: string;
  now?: string;
  selectedIds?: string[];
}): TiekatHabitatDeck {
  const now = args.now || new Date().toISOString();
  const normalized = sortHabitatProfiles(args.profiles.map((profile) => normalizeHabitatProfile(profile)));
  let scoped: TiekatHabitatProfile[] = normalized;
  if (args.kind === 'pinned') scoped = normalized.filter((profile) => profile.pinned);
  if (args.kind === 'recent') {
    scoped = [...normalized].sort((a, b) => toMs(b.lastAppliedAt) - toMs(a.lastAppliedAt) || b.applyCount - a.applyCount || a.name.localeCompare(b.name));
  }
  if (args.kind === 'selected') {
    const selected = new Set(args.selectedIds || []);
    scoped = normalized.filter((profile) => selected.has(profile.id));
  }
  const cards = scoped.slice(0, HABITAT_DECK_MAX_CARDS).map((profile) => buildHabitatCardFromProfile(profile, now));
  return {
    id: `habitat-deck:${args.kind}:${now}`,
    name: args.name || `Habitat ${args.kind} ritual deck`,
    kind: args.kind,
    createdAt: now,
    cards,
    footer: 'Local habitat ritual object — configuration only.',
    version: TIEKAT_HABITAT_DECK_EXPORT_VERSION
  };
}

export function buildPinnedHabitatDeck(profiles: TiekatHabitatProfile[], now?: string) {
  return buildHabitatDeck({ profiles, kind: 'pinned', now, name: 'Pinned habitat ritual deck' });
}

export function buildRecentHabitatDeck(profiles: TiekatHabitatProfile[], now?: string) {
  return buildHabitatDeck({ profiles, kind: 'recent', now, name: 'Recent habitat ritual deck' });
}

export function summarizeHabitatDeck(deck: TiekatHabitatDeck): TiekatHabitatDeckSummary {
  return {
    name: deck.name,
    kind: deck.kind,
    cardCount: deck.cards.length,
    topCardName: deck.cards[0]?.profileName ?? null,
    line: deck.cards.length ? `${deck.cards.length} habitat card(s). Lead: ${deck.cards[0].profileName}.` : 'No habitat cards in this deck.'
  };
}

export function exportHabitatCardJson(card: TiekatHabitatCard) {
  return JSON.stringify(card, null, 2);
}

export function exportHabitatDeckJson(deck: TiekatHabitatDeck) {
  return JSON.stringify(deck, null, 2);
}

export function exportHabitatDeckMarkdown(deck: TiekatHabitatDeck) {
  const lines = [`# ${deck.name}`, '', `Kind: ${deck.kind}`, `Created: ${deck.createdAt}`, '', '## Cards'];
  for (const card of deck.cards) {
    lines.push(`- **${card.profileName}** (${card.sessionMode} / ${card.councilMode})`);
    lines.push(`  - Usage: ${card.usageBadge} • ${card.continuityLabel}`);
    lines.push(`  - Sphere: ${card.sphereSignature.glyphFamily} (${card.sphereSignature.awakeningState}/${card.sphereSignature.shieldStatus}/${card.sphereSignature.synchronyState})`);
    lines.push(`  - Pinned: ${card.pinned ? 'yes' : 'no'} • Diagnostics: ${card.showDiagnostics ? 'on' : 'off'} • Geometry: ${card.showGeometry ? 'on' : 'off'}`);
  }
  lines.push('', deck.footer, `Version: ${deck.version}`);
  return lines.join('\n');
}

export function importHabitatDeckJson(text: string): TiekatHabitatDeck {
  const parsed = JSON.parse(text) as Partial<TiekatHabitatDeck>;
  if (!parsed || typeof parsed !== 'object') throw new Error('Invalid habitat deck payload');
  if (parsed.version !== TIEKAT_HABITAT_DECK_EXPORT_VERSION) {
    throw new Error(`Unsupported habitat deck export version: ${parsed.version}`);
  }
  if (!Array.isArray(parsed.cards)) throw new Error('Invalid habitat deck cards');
  const cards = parsed.cards.map((card) => {
    if (!card || typeof card !== 'object') throw new Error('Invalid habitat card');
    if (typeof card.profileId !== 'string' || typeof card.profileName !== 'string') throw new Error('Invalid habitat card identity');
    return card as TiekatHabitatCard;
  });
  return {
    id: typeof parsed.id === 'string' ? parsed.id : `habitat-deck:import:${new Date().toISOString()}`,
    name: typeof parsed.name === 'string' ? parsed.name : 'Imported habitat ritual deck',
    kind: parsed.kind === 'pinned' || parsed.kind === 'recent' || parsed.kind === 'all' || parsed.kind === 'selected' ? parsed.kind : 'all',
    createdAt: typeof parsed.createdAt === 'string' ? parsed.createdAt : new Date().toISOString(),
    cards: cards.slice(0, HABITAT_DECK_MAX_CARDS),
    footer: typeof parsed.footer === 'string' ? parsed.footer : 'Local habitat ritual object — configuration only.',
    version: TIEKAT_HABITAT_DECK_EXPORT_VERSION
  };
}
