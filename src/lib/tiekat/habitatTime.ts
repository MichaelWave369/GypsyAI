import { TiekatHabitatProfile } from '@/lib/tiekat/habitatProfile';

export type TiekatHabitatRecency = 'never_applied' | 'just_now' | 'recent' | 'aging' | 'stale';
export type TiekatHabitatUsageStatus = 'never_applied' | 'recently_active' | 'frequently_used' | 'stale';

function toMs(value: string | null | undefined): number | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function formatHabitatRelativeTime(timestamp: string | null | undefined, now = new Date().toISOString()): string {
  const timestampMs = toMs(timestamp);
  const nowMs = toMs(now);
  if (timestampMs === null || nowMs === null) return 'never applied';
  const deltaMs = Math.max(0, nowMs - timestampMs);
  const deltaMinutes = Math.floor(deltaMs / 60000);
  if (deltaMinutes < 1) return 'just now';
  if (deltaMinutes < 60) return `${deltaMinutes}m ago`;
  const deltaHours = Math.floor(deltaMinutes / 60);
  if (deltaHours < 24) return `${deltaHours}h ago`;
  const deltaDays = Math.floor(deltaHours / 24);
  return `${deltaDays}d ago`;
}

export function classifyHabitatRecency(timestamp: string | null | undefined, now = new Date().toISOString()): TiekatHabitatRecency {
  const timestampMs = toMs(timestamp);
  const nowMs = toMs(now);
  if (timestampMs === null || nowMs === null) return 'never_applied';
  const deltaMs = Math.max(0, nowMs - timestampMs);
  if (deltaMs < 1000 * 60) return 'just_now';
  if (deltaMs < 1000 * 60 * 60 * 24) return 'recent';
  if (deltaMs < 1000 * 60 * 60 * 24 * 14) return 'aging';
  return 'stale';
}

export function formatHabitatLastAppliedLabel(profile: Pick<TiekatHabitatProfile, 'lastAppliedAt'>, now = new Date().toISOString()): string {
  const compact = formatHabitatRelativeTime(profile.lastAppliedAt, now);
  return compact === 'never applied' ? 'Never applied' : `Last applied ${compact}`;
}

export function classifyHabitatUsage(profile: Pick<TiekatHabitatProfile, 'lastAppliedAt' | 'applyCount'>, now = new Date().toISOString()): TiekatHabitatUsageStatus {
  if (!profile.lastAppliedAt || profile.applyCount <= 0) return 'never_applied';
  const recency = classifyHabitatRecency(profile.lastAppliedAt, now);
  if (recency === 'stale') return 'stale';
  if (profile.applyCount >= 5) return 'frequently_used';
  return 'recently_active';
}

export function formatHabitatUsageBadge(status: TiekatHabitatUsageStatus): string {
  if (status === 'never_applied') return 'Never Applied';
  if (status === 'stale') return 'Stale';
  if (status === 'frequently_used') return 'Frequently Used';
  return 'Recently Active';
}
