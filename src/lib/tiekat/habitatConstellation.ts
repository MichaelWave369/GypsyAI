import {
  HABITAT_CONSTELLATION_MAX_NODES,
  HABITAT_CONSTELLATION_RECENT_WINDOW
} from '@/lib/tiekat/habitatConstants';
import { TiekatHabitatProfile, normalizeHabitatProfile } from '@/lib/tiekat/habitatProfile';
import { classifyHabitatRecency } from '@/lib/tiekat/habitatTime';

export interface TiekatHabitatConstellationNode {
  id: string;
  name: string;
  pinned: boolean;
  applyCount: number;
  lastAppliedAt: string | null;
  recency: 'never_applied' | 'just_now' | 'recent' | 'aging' | 'stale';
  intensity: 'low' | 'medium' | 'high';
  sessionMode: string;
  councilMode: string;
}

export interface TiekatHabitatConstellationEdge {
  key: string;
  fromId: string;
  toId: string;
  weight: number;
  label: string;
}

export interface TiekatHabitatConstellationState {
  nodes: TiekatHabitatConstellationNode[];
  edges: TiekatHabitatConstellationEdge[];
}

export interface TiekatHabitatConstellationSummary {
  headline: string;
  line: string;
  pairLine: string | null;
}

function toMs(value: string | null): number {
  if (!value) return Number.NEGATIVE_INFINITY;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed;
}

function toIntensity(applyCount: number): 'low' | 'medium' | 'high' {
  if (applyCount >= 5) return 'high';
  if (applyCount >= 2) return 'medium';
  return 'low';
}

export function buildHabitatConstellationNodes(args: { profiles: TiekatHabitatProfile[]; now?: string }): TiekatHabitatConstellationNode[] {
  const now = args.now || new Date().toISOString();
  return args.profiles
    .map((profile) => normalizeHabitatProfile(profile))
    .sort((a, b) => b.applyCount - a.applyCount || toMs(b.lastAppliedAt) - toMs(a.lastAppliedAt) || a.name.localeCompare(b.name))
    .slice(0, HABITAT_CONSTELLATION_MAX_NODES)
    .map((profile) => ({
      id: profile.id,
      name: profile.name,
      pinned: profile.pinned,
      applyCount: profile.applyCount,
      lastAppliedAt: profile.lastAppliedAt,
      recency: classifyHabitatRecency(profile.lastAppliedAt, now),
      intensity: toIntensity(profile.applyCount),
      sessionMode: profile.preferences.sessionMode,
      councilMode: profile.preferences.councilMode
    }));
}

export function buildHabitatConstellationEdges(args: {
  nodes: TiekatHabitatConstellationNode[];
  recentTransition?: { from: string; to: string } | null;
}): TiekatHabitatConstellationEdge[] {
  if (args.recentTransition) {
    const from = args.nodes.find((node) => node.name === args.recentTransition?.from);
    const to = args.nodes.find((node) => node.name === args.recentTransition?.to);
    if (from && to) {
      return [{
        key: `${from.id}:${to.id}`,
        fromId: from.id,
        toId: to.id,
        weight: 2,
        label: `${from.name} → ${to.name}`
      }];
    }
  }
  const recentNodes = args.nodes
    .filter((node) => node.recency !== 'never_applied')
    .sort((a, b) => toMs(b.lastAppliedAt) - toMs(a.lastAppliedAt))
    .slice(0, HABITAT_CONSTELLATION_RECENT_WINDOW);
  if (recentNodes.length >= 2) {
    return [{
      key: `${recentNodes[1].id}:${recentNodes[0].id}`,
      fromId: recentNodes[1].id,
      toId: recentNodes[0].id,
      weight: 1,
      label: `${recentNodes[1].name} → ${recentNodes[0].name}`
    }];
  }
  return [];
}

export function buildHabitatConstellationState(args: {
  profiles: TiekatHabitatProfile[];
  now?: string;
  recentTransition?: { from: string; to: string } | null;
}): TiekatHabitatConstellationState {
  const nodes = buildHabitatConstellationNodes({ profiles: args.profiles, now: args.now });
  const edges = buildHabitatConstellationEdges({ nodes, recentTransition: args.recentTransition });
  return { nodes, edges };
}

export function buildHabitatConstellationSummary(args: {
  state: TiekatHabitatConstellationState;
}): TiekatHabitatConstellationSummary {
  const dominant = args.state.nodes[0];
  const hasUsageHistory = args.state.nodes.some((node) => node.applyCount > 0);
  if (!dominant || !hasUsageHistory) {
    return {
      headline: 'No habitat transition history yet.',
      line: 'Apply a habitat profile to begin constellation continuity.',
      pairLine: null
    };
  }
  const pinnedInactive = args.state.nodes.some((node) => node.pinned && (node.recency === 'never_applied' || node.recency === 'stale'));
  return {
    headline: `Recent habitat continuity favors ${dominant.name}.`,
    line: pinnedInactive
      ? 'Pinned habitats are present but not recently active.'
      : `${dominant.name} is currently the dominant habitat node.`,
    pairLine: args.state.edges[0] ? `${args.state.edges[0].label} is the dominant pair.` : null
  };
}
