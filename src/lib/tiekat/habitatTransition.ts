import { buildHabitatProfileDiff, TiekatHabitatProfile } from '@/lib/tiekat/habitatProfile';
import { resolveSessionMode } from '@/lib/tiekat/sessionMode';

export type TiekatHabitatTransitionSeverity = 'high' | 'medium' | 'low';

export interface TiekatHabitatTransitionChip {
  key: 'session_mode' | 'council_mode' | 'diagnostics' | 'geometry' | 'v55_framing' | 'ancestry_fallback';
  label: string;
  severity: TiekatHabitatTransitionSeverity;
}

export interface TiekatHabitatTransitionSummary {
  headline: string;
  line: string;
  fallbackLine?: string;
}

export interface TiekatHabitatTransition {
  fromProfileName: string;
  toProfileName: string;
  chips: TiekatHabitatTransitionChip[];
  fullDiffLines: string[];
  summary: TiekatHabitatTransitionSummary;
}

export type TiekatHabitatShortcutAction = 'toggle_pin' | 'apply' | 'move_up' | 'move_down';

export function buildHabitatTransitionChips(args: {
  current: TiekatHabitatProfile;
  target: TiekatHabitatProfile;
  allowAncestry: boolean;
  maxChips?: number;
}): TiekatHabitatTransitionChip[] {
  const current = args.current.preferences;
  const target = args.target.preferences;
  const chips: TiekatHabitatTransitionChip[] = [];
  if (current.sessionMode !== target.sessionMode) {
    chips.push({ key: 'session_mode', label: `Session mode: ${current.sessionMode} → ${target.sessionMode}`, severity: 'high' });
  }
  if (current.councilMode !== target.councilMode) {
    chips.push({ key: 'council_mode', label: `Council: ${current.councilMode} → ${target.councilMode}`, severity: 'high' });
  }
  if (current.showDiagnostics !== target.showDiagnostics) {
    chips.push({ key: 'diagnostics', label: `Diagnostics: ${current.showDiagnostics ? 'on' : 'off'} → ${target.showDiagnostics ? 'on' : 'off'}`, severity: 'medium' });
  }
  if (current.showGeometry !== target.showGeometry) {
    chips.push({ key: 'geometry', label: `Geometry: ${current.showGeometry ? 'on' : 'off'} → ${target.showGeometry ? 'on' : 'off'}`, severity: 'medium' });
  }
  if (current.enableV55Framing !== target.enableV55Framing) {
    chips.push({ key: 'v55_framing', label: `v55 framing: ${current.enableV55Framing ? 'on' : 'off'} → ${target.enableV55Framing ? 'on' : 'off'}`, severity: 'low' });
  }
  const resolvedMode = resolveSessionMode(target.sessionMode, { allowAncestry: args.allowAncestry });
  if (resolvedMode !== target.sessionMode) {
    chips.unshift({ key: 'ancestry_fallback', label: `Consent fallback: ${target.sessionMode} → ${resolvedMode}`, severity: 'high' });
  }
  return chips.slice(0, Math.max(1, Math.min(args.maxChips ?? 5, 5)));
}

export function summarizeHabitatTransition(transition: Pick<TiekatHabitatTransition, 'fromProfileName' | 'toProfileName' | 'chips'>): TiekatHabitatTransitionSummary {
  const headline = `Transitioning from ${transition.fromProfileName} to ${transition.toProfileName}.`;
  const mediumOrHigh = transition.chips.filter((chip) => chip.severity !== 'low');
  const focus = mediumOrHigh[0]?.label || transition.chips[0]?.label || 'No major habitat changes detected.';
  const fallbackLine = transition.chips.find((chip) => chip.key === 'ancestry_fallback')?.label;
  return {
    headline,
    line: `This shift emphasizes: ${focus}.`,
    fallbackLine
  };
}

export function buildHabitatTransition(args: {
  current: TiekatHabitatProfile;
  target: TiekatHabitatProfile;
  allowAncestry: boolean;
}): TiekatHabitatTransition {
  const diff = buildHabitatProfileDiff({
    current: args.current,
    target: args.target,
    allowAncestry: args.allowAncestry
  });
  const chips = buildHabitatTransitionChips({
    current: args.current,
    target: args.target,
    allowAncestry: args.allowAncestry
  });
  const summary = summarizeHabitatTransition({
    fromProfileName: args.current.name,
    toProfileName: args.target.name,
    chips
  });
  return {
    fromProfileName: args.current.name,
    toProfileName: args.target.name,
    chips,
    fullDiffLines: diff.lines,
    summary: {
      ...summary,
      fallbackLine: diff.ancestryFallbackLine || summary.fallbackLine
    }
  };
}

export function resolveHabitatShortcut(args: {
  key: string;
  altKey: boolean;
  shiftKey: boolean;
  targetTag?: string;
  isContentEditable?: boolean;
}): TiekatHabitatShortcutAction | null {
  const tag = args.targetTag?.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || args.isContentEditable) return null;
  if (!(args.altKey && args.shiftKey)) return null;
  if (args.key.toLowerCase() === 'p') return 'toggle_pin';
  if (args.key.toLowerCase() === 'a') return 'apply';
  if (args.key === 'ArrowUp') return 'move_up';
  if (args.key === 'ArrowDown') return 'move_down';
  return null;
}
