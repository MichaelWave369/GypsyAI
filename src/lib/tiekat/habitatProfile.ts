import { dbGet, dbSet } from '@/lib/local/db';
import { TiekatConstellationFilterState } from '@/lib/tiekat/oracleConstellation';
import { TiekatCouncilMode } from '@/lib/tiekat/oracleCouncil';
import { TiekatRitualDeckFilterState } from '@/lib/tiekat/ritualDeck';
import { resolveSessionMode, TiekatSessionModeKey } from '@/lib/tiekat/sessionMode';

export const TIEKAT_HABITAT_PROFILE_ROW_VERSION = 1 as const;
export const TIEKAT_HABITAT_PROFILE_EXPORT_VERSION = 'TIEKAT-habitat-profile-v1' as const;
const MAX_HABITAT_PROFILES = 40;

export type TiekatHabitatProfileRowVersion = typeof TIEKAT_HABITAT_PROFILE_ROW_VERSION;

export interface TiekatHabitatProfile {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  preferences: {
    sessionMode: TiekatSessionModeKey;
    councilMode: TiekatCouncilMode;
    preferProviderBackedCouncil: boolean;
    showGeometry: boolean;
    showDiagnostics: boolean;
    enableV55Framing: boolean;
    constellationFilters: TiekatConstellationFilterState;
    ritualDeckFilters: TiekatRitualDeckFilterState;
    promptPresetMode: TiekatSessionModeKey;
  };
  footer: string;
  version: {
    rowVersion: TiekatHabitatProfileRowVersion;
    exportVersion: typeof TIEKAT_HABITAT_PROFILE_EXPORT_VERSION;
  };
}

export interface TiekatHabitatProfileSummary {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
  sessionMode: TiekatSessionModeKey;
  councilMode: TiekatCouncilMode;
}

export interface TiekatHabitatProfileStoreEntry {
  rowVersion: TiekatHabitatProfileRowVersion;
  profile: TiekatHabitatProfile;
}

function defaultConstellationFilters(): TiekatConstellationFilterState {
  return { mode: 'all', scoringVersion: 'all', shiftType: 'all' };
}

function defaultRitualDeckFilters(): TiekatRitualDeckFilterState {
  return { mode: 'all', scoringVersion: 'all', timeWindow: 'all' };
}

export function normalizeHabitatProfile(value: Partial<TiekatHabitatProfile>): TiekatHabitatProfile {
  const now = new Date().toISOString();
  return {
    id: value.id || `habitat:${value.updatedAt || now}`,
    name: value.name?.slice(0, 48) || 'Sovereign Habitat',
    description: value.description?.slice(0, 180) || 'Compact local oracle habitat profile.',
    createdAt: value.createdAt || now,
    updatedAt: value.updatedAt || value.createdAt || now,
    preferences: {
      sessionMode: value.preferences?.sessionMode || 'open_reflection',
      councilMode: value.preferences?.councilMode || 'disabled',
      preferProviderBackedCouncil: Boolean(value.preferences?.preferProviderBackedCouncil),
      showGeometry: Boolean(value.preferences?.showGeometry),
      showDiagnostics: Boolean(value.preferences?.showDiagnostics),
      enableV55Framing: Boolean(value.preferences?.enableV55Framing),
      constellationFilters: {
        mode: value.preferences?.constellationFilters?.mode || 'all',
        scoringVersion: value.preferences?.constellationFilters?.scoringVersion || 'all',
        shiftType: value.preferences?.constellationFilters?.shiftType || 'all'
      },
      ritualDeckFilters: {
        mode: value.preferences?.ritualDeckFilters?.mode || 'all',
        scoringVersion: value.preferences?.ritualDeckFilters?.scoringVersion || 'all',
        timeWindow: value.preferences?.ritualDeckFilters?.timeWindow || 'all'
      },
      promptPresetMode: value.preferences?.promptPresetMode || value.preferences?.sessionMode || 'open_reflection'
    },
    footer: value.footer?.slice(0, 220) || 'Local habitat profile only. Preferences/configuration, no transcript storage.',
    version: {
      rowVersion: TIEKAT_HABITAT_PROFILE_ROW_VERSION,
      exportVersion: TIEKAT_HABITAT_PROFILE_EXPORT_VERSION
    }
  };
}

export function buildHabitatProfile(args: {
  id?: string;
  name: string;
  description?: string;
  now?: string;
  preferences: TiekatHabitatProfile['preferences'];
}): TiekatHabitatProfile {
  const now = args.now || new Date().toISOString();
  return normalizeHabitatProfile({
    id: args.id || `habitat:${now}`,
    name: args.name,
    description: args.description || 'Compact local oracle habitat profile.',
    createdAt: now,
    updatedAt: now,
    preferences: args.preferences,
    footer: 'Local habitat profile only. Preferences/configuration, no transcript storage.'
  });
}

export function buildDefaultHabitatProfiles(): TiekatHabitatProfile[] {
  const now = '2026-03-19T00:00:00.000Z';
  return [
    buildHabitatProfile({
      id: 'habitat-default-quiet-reflection',
      name: 'Quiet Reflection',
      description: 'Low-noise contemplation habitat with diagnostics hidden.',
      now,
      preferences: {
        sessionMode: 'open_reflection',
        councilMode: 'disabled',
        preferProviderBackedCouncil: false,
        showGeometry: false,
        showDiagnostics: false,
        enableV55Framing: false,
        constellationFilters: defaultConstellationFilters(),
        ritualDeckFilters: defaultRitualDeckFilters(),
        promptPresetMode: 'open_reflection'
      }
    }),
    buildHabitatProfile({
      id: 'habitat-default-tarot-chamber',
      name: 'Tarot Chamber',
      description: 'Tarot-forward habitat with symbolic framing.',
      now,
      preferences: {
        sessionMode: 'tarot_inquiry',
        councilMode: 'oracle_council',
        preferProviderBackedCouncil: false,
        showGeometry: true,
        showDiagnostics: false,
        enableV55Framing: true,
        constellationFilters: defaultConstellationFilters(),
        ritualDeckFilters: { ...defaultRitualDeckFilters(), mode: 'tarot_inquiry' },
        promptPresetMode: 'tarot_inquiry'
      }
    }),
    buildHabitatProfile({
      id: 'habitat-default-synthesis-oracle',
      name: 'Synthesis Oracle',
      description: 'Balanced synthesis habitat across modules.',
      now,
      preferences: {
        sessionMode: 'synthesis_oracle',
        councilMode: 'swarm_synthesis',
        preferProviderBackedCouncil: true,
        showGeometry: true,
        showDiagnostics: false,
        enableV55Framing: true,
        constellationFilters: defaultConstellationFilters(),
        ritualDeckFilters: { ...defaultRitualDeckFilters(), mode: 'synthesis_oracle' },
        promptPresetMode: 'synthesis_oracle'
      }
    }),
    buildHabitatProfile({
      id: 'habitat-default-council-deliberation',
      name: 'Council Deliberation',
      description: 'Governed council-first habitat for comparative synthesis.',
      now,
      preferences: {
        sessionMode: 'synthesis_oracle',
        councilMode: 'deliberation_oracle',
        preferProviderBackedCouncil: true,
        showGeometry: true,
        showDiagnostics: true,
        enableV55Framing: true,
        constellationFilters: { mode: 'all', scoringVersion: 'all', shiftType: 'mode_shift' },
        ritualDeckFilters: { ...defaultRitualDeckFilters(), mode: 'synthesis_oracle' },
        promptPresetMode: 'synthesis_oracle'
      }
    }),
    buildHabitatProfile({
      id: 'habitat-default-sphere-diagnostics',
      name: 'Sphere Diagnostics',
      description: 'v56 continuity habitat with diagnostics visibility enabled.',
      now,
      preferences: {
        sessionMode: 'synthesis_oracle',
        councilMode: 'swarm_synthesis',
        preferProviderBackedCouncil: true,
        showGeometry: true,
        showDiagnostics: true,
        enableV55Framing: true,
        constellationFilters: { mode: 'all', scoringVersion: 'all', shiftType: 'sphere_shift' },
        ritualDeckFilters: { ...defaultRitualDeckFilters(), mode: 'synthesis_oracle', timeWindow: 'recent_7' },
        promptPresetMode: 'synthesis_oracle'
      }
    })
  ];
}

export function summarizeHabitatProfile(profile: TiekatHabitatProfile): TiekatHabitatProfileSummary {
  const normalized = normalizeHabitatProfile(profile);
  return {
    id: normalized.id,
    name: normalized.name,
    description: normalized.description,
    updatedAt: normalized.updatedAt,
    sessionMode: normalized.preferences.sessionMode,
    councilMode: normalized.preferences.councilMode
  };
}

export function applyHabitatProfile(args: {
  profile: TiekatHabitatProfile;
  allowAncestry: boolean;
}): {
  profile: TiekatHabitatProfile;
  appliedSessionMode: TiekatSessionModeKey;
  ancestryFallbackApplied: boolean;
  note: string;
} {
  const profile = normalizeHabitatProfile(args.profile);
  const appliedSessionMode = resolveSessionMode(profile.preferences.sessionMode, { allowAncestry: args.allowAncestry });
  const ancestryFallbackApplied = appliedSessionMode !== profile.preferences.sessionMode;
  return {
    profile,
    appliedSessionMode,
    ancestryFallbackApplied,
    note: ancestryFallbackApplied
      ? `Habitat requested ${profile.preferences.sessionMode}; applied ${appliedSessionMode} because ancestry consent is disabled.`
      : `Applied habitat profile ${profile.name}.`
  };
}

export async function loadHabitatProfiles(): Promise<TiekatHabitatProfile[]> {
  const rows = await dbGet('habitatProfiles');
  const parsed = Array.isArray(rows) ? rows : [];
  if (!parsed.length) return buildDefaultHabitatProfiles();
  return parsed.map((row) => normalizeHabitatProfile(row));
}

export async function saveHabitatProfiles(rows: TiekatHabitatProfile[]) {
  await dbSet('habitatProfiles', rows.slice(0, MAX_HABITAT_PROFILES).map((row) => normalizeHabitatProfile(row)));
}

export async function appendHabitatProfile(profile: TiekatHabitatProfile) {
  const rows = await loadHabitatProfiles();
  const normalized = normalizeHabitatProfile(profile);
  await saveHabitatProfiles([normalized, ...rows.filter((row) => row.id !== normalized.id)]);
}

export async function updateHabitatProfile(profile: TiekatHabitatProfile) {
  const rows = await loadHabitatProfiles();
  const normalized = normalizeHabitatProfile({
    ...profile,
    updatedAt: new Date().toISOString()
  });
  await saveHabitatProfiles(rows.map((row) => (row.id === normalized.id ? normalized : row)));
}

export async function deleteHabitatProfile(id: string) {
  const rows = await loadHabitatProfiles();
  await saveHabitatProfiles(rows.filter((row) => row.id !== id));
}

export async function getRecentHabitatProfiles(limit = 8): Promise<TiekatHabitatProfile[]> {
  const rows = await loadHabitatProfiles();
  return [...rows]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, Math.max(1, limit));
}

export function exportHabitatProfileJson(profile: TiekatHabitatProfile) {
  return JSON.stringify(normalizeHabitatProfile(profile), null, 2);
}

export function importHabitatProfileJson(text: string): TiekatHabitatProfile {
  const parsed = JSON.parse(text) as Partial<TiekatHabitatProfile>;
  if (typeof parsed !== 'object' || parsed === null) throw new Error('Invalid habitat profile payload');
  if (parsed.preferences && typeof parsed.preferences !== 'object') throw new Error('Invalid habitat profile preferences');
  if (parsed.version?.exportVersion && parsed.version.exportVersion !== TIEKAT_HABITAT_PROFILE_EXPORT_VERSION) {
    throw new Error(`Unsupported habitat profile export version: ${parsed.version.exportVersion}`);
  }
  return normalizeHabitatProfile(parsed);
}
