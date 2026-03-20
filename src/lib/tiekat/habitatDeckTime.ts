import { TiekatHabitatDeck } from '@/lib/tiekat/habitatDeck';

function toMs(value: string): number | null {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function formatHabitatDeckRelativeTime(timestamp: string, now = new Date().toISOString()): string {
  const ts = toMs(timestamp);
  const current = toMs(now);
  if (ts === null || current === null) return 'just now';
  const deltaMs = Math.max(0, current - ts);
  const minutes = Math.floor(deltaMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatHabitatDeckSavedLabel(deck: Pick<TiekatHabitatDeck, 'createdAt'>, now = new Date().toISOString()): string {
  return `saved ${formatHabitatDeckRelativeTime(deck.createdAt, now)}`;
}
