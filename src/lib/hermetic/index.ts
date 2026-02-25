import gd from './correspondences.gd.json';
import thoth from './correspondences.thoth.json';

export type HermeticProfileName = 'gd' | 'thoth';

export interface HermeticProfile {
  profile: string;
  description: string;
  sephiroth: Array<{ number: number; name: string; keywords: string[]; attribution: string; short_meaning: string }>;
  paths: Array<{ hebrew_letter: string; tarot_key: string; attribution: string; from: number; to: number }>;
  suit_elements: Record<string, string>;
  number_to_sephirah: Record<string, string>;
  decans: Array<{ sign: string; degree_range: string; planet_ruler: string; minor_card: string }>;
  sign_to_major_key: Record<string, string>;
}

const profiles: Record<HermeticProfileName, HermeticProfile> = { gd, thoth };

export const getHermeticProfile = (name: HermeticProfileName = 'gd'): HermeticProfile => profiles[name];

export const getDecanForSignDegree = (sign: string, degreeInSign: number, mode: HermeticProfileName = 'gd') => {
  const decanIndex = Math.min(2, Math.max(0, Math.floor(degreeInSign / 10)));
  return getHermeticProfile(mode).decans.find((d) => d.sign === sign && d.degree_range.startsWith(String(decanIndex * 10)));
};

export const minorCardToDeckId = (minorCard: string) => {
  const m = minorCard.match(/(\d+) of (\w+)/i);
  if (!m) return '';
  return `${m[2].toLowerCase()}-${m[1]}`;
};
