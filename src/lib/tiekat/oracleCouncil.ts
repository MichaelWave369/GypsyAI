import { TiekatConsentState, TiekatModuleKey } from '@/lib/tiekat/schema';
import { TiekatSessionModeKey } from '@/lib/tiekat/sessionMode';
import { resolveCouncilAdapter, TiekatCouncilAdapterMode } from '@/lib/tiekat/oracleCouncilAdapter';

export type TiekatCouncilMode = 'disabled' | 'oracle_council' | 'deliberation_oracle' | 'swarm_synthesis';
export type TiekatCouncilExecutionSource = 'deterministic_stub' | 'provider_backed';

export type TiekatCouncilRole = 'oracle_reader' | 'pattern_weaver' | 'skeptic_grounder' | 'lineage_keeper' | 'final_integrator';

export interface TiekatCouncilInputEnvelope {
  promptSummary: string;
  sessionMode: TiekatSessionModeKey;
  route: string;
  modules: TiekatModuleKey[];
  ritualFrame: string;
  artifactContinuitySummary: string;
  gravitySummary?: {
    status: string;
    informationIntegral: number;
    deltaGPredicted: number;
    scoringVersion?: string;
  };
  ancestrySummary?: string;
}

export interface TiekatCouncilPlan {
  mode: TiekatCouncilMode;
  roles: Array<{ role: TiekatCouncilRole; purpose: string }>;
}

export interface TiekatCouncilTurn {
  role: TiekatCouncilRole;
  summary: string;
  agreesWithPrior: boolean;
  warning?: string;
}

export interface TiekatCouncilSummary {
  mode: TiekatCouncilMode;
  roles: TiekatCouncilRole[];
  turnCount: number;
  roleSummaries: Array<{ role: TiekatCouncilRole; summary: string }>;
  disagreement: boolean;
  synthesisNote: string;
  selectedModules: TiekatModuleKey[];
  warnings: string[];
  executionSource: TiekatCouncilExecutionSource;
  adapterName?: string;
  adapterAvailable: boolean;
  footer: string;
}

export interface TiekatCouncilResult {
  plan: TiekatCouncilPlan;
  turns: TiekatCouncilTurn[];
  summary: TiekatCouncilSummary;
}

export interface TiekatCouncilContinuitySummary {
  state: 'insufficient_data' | 'council_continuity' | 'council_shift';
  recentModes: TiekatCouncilMode[];
  disagreementRate: number;
  executionSources: TiekatCouncilExecutionSource[];
  roleStability: 'stable' | 'shifted';
  note: string;
}

const COUNCIL_MODE_KEY = 'gypsy-ai-tiekat-council-mode';
export const COUNCIL_FOOTER = 'Modeled council deliberation only. Theoretical planning aid — not physical confirmation.';

const ROLE_PURPOSES: Record<TiekatCouncilRole, string> = {
  oracle_reader: 'Extract concise symbolic meaning from the prompt context.',
  pattern_weaver: 'Connect cross-module motifs into a coherent pattern.',
  skeptic_grounder: 'Challenge overreach and flag unsupported claims.',
  lineage_keeper: 'Constrain ancestry-sensitive interpretation to consent-safe lineage motifs.',
  final_integrator: 'Merge validated points into a compact synthesis plan.'
};

export function getCouncilModes(): TiekatCouncilMode[] {
  return ['disabled', 'oracle_council', 'deliberation_oracle', 'swarm_synthesis'];
}

export function loadCouncilModePreference(defaultMode: TiekatCouncilMode = 'disabled'): TiekatCouncilMode {
  if (typeof window === 'undefined') return defaultMode;
  const raw = window.localStorage.getItem(COUNCIL_MODE_KEY);
  return getCouncilModes().includes(raw as TiekatCouncilMode) ? raw as TiekatCouncilMode : defaultMode;
}

export function saveCouncilModePreference(mode: TiekatCouncilMode) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(COUNCIL_MODE_KEY, mode);
}

export function getCouncilRoster(consent: Pick<TiekatConsentState, 'allowAncestry'>): TiekatCouncilRole[] {
  const base: TiekatCouncilRole[] = ['oracle_reader', 'pattern_weaver', 'skeptic_grounder'];
  if (consent.allowAncestry) base.push('lineage_keeper');
  base.push('final_integrator');
  return base;
}

export function buildCouncilPlan(mode: TiekatCouncilMode, consent: Pick<TiekatConsentState, 'allowAncestry'>): TiekatCouncilPlan {
  if (mode === 'disabled') return { mode, roles: [] };
  const roles = getCouncilRoster(consent).map((role) => ({ role, purpose: ROLE_PURPOSES[role] }));
  return { mode, roles };
}

export function summarizePromptForCouncil(text: string, max = 180) {
  return text.replace(/\s+/g, ' ').replace(/\b[A-Z][a-z]{2,}\b/g, '[name]').trim().slice(0, max);
}

export function buildCouncilInputEnvelope(args: {
  message: string;
  sessionMode: TiekatSessionModeKey;
  route: string;
  modules: TiekatModuleKey[];
  ritualFrame: string;
  artifactContinuitySummary: string;
  ancestrySummary?: string;
  consent: Pick<TiekatConsentState, 'allowAncestry' | 'includeNames'>;
  gravitySummary?: {
    status: string;
    informationIntegral: number;
    deltaGPredicted: number;
    scoringVersion?: string;
  };
}): TiekatCouncilInputEnvelope {
  return {
    promptSummary: summarizePromptForCouncil(args.message),
    sessionMode: args.sessionMode,
    route: args.route,
    modules: args.modules,
    ritualFrame: args.ritualFrame,
    artifactContinuitySummary: summarizePromptForCouncil(args.artifactContinuitySummary, 140),
    gravitySummary: args.gravitySummary,
    ancestrySummary: args.consent.allowAncestry ? summarizePromptForCouncil(args.ancestrySummary || '', 140) : undefined
  };
}

function buildDeterministicCouncil(args: {
  mode: TiekatCouncilMode;
  consent: Pick<TiekatConsentState, 'allowAncestry'>;
  envelope: TiekatCouncilInputEnvelope;
}) {
  const plan = buildCouncilPlan(args.mode, args.consent);
  const turns: TiekatCouncilTurn[] = plan.roles.map((entry, i) => {
    const base = `${entry.role}: ${entry.purpose}`;
    const compact = `${base} Focus=${args.envelope.sessionMode}/${args.envelope.route}; modules=${args.envelope.modules.join(',') || 'assistant'}.`;
    const agreesWithPrior = entry.role === 'skeptic_grounder' ? args.envelope.modules.length <= 3 : true;
    const warning = entry.role === 'skeptic_grounder' && !agreesWithPrior ? 'module_sprawl_risk' : undefined;
    return {
      role: entry.role,
      summary: compact.slice(0, 200),
      agreesWithPrior,
      warning: i > 0 ? warning : undefined
    };
  });

  const disagreement = turns.some((turn) => !turn.agreesWithPrior);
  const warnings = turns.map((turn) => turn.warning).filter(Boolean) as string[];
  return {
    plan,
    turns,
    summary: {
      mode: args.mode,
      roles: plan.roles.map((entry) => entry.role),
      turnCount: turns.length,
      roleSummaries: turns.map((turn) => ({ role: turn.role, summary: turn.summary })),
      disagreement,
      synthesisNote: `Council synthesized ${turns.length} compact role perspectives under TIEKAT governance.`,
      selectedModules: args.envelope.modules,
      warnings,
      executionSource: 'deterministic_stub' as const,
      adapterName: undefined,
      adapterAvailable: false,
      footer: COUNCIL_FOOTER
    }
  };
}

export async function runOracleCouncilWithAdapter(args: {
  mode: TiekatCouncilMode;
  consent: Pick<TiekatConsentState, 'allowAncestry'>;
  envelope: TiekatCouncilInputEnvelope;
  adapterMode?: TiekatCouncilAdapterMode;
  provider?: string;
}): Promise<TiekatCouncilResult | null> {
  if (args.mode === 'disabled') return null;

  const base = buildDeterministicCouncil(args);
  const adapter = resolveCouncilAdapter(args.adapterMode ?? 'deterministic_only', args.provider);
  if (!adapter.available) {
    return {
      ...base,
      summary: {
        ...base.summary,
        adapterAvailable: false
      }
    };
  }

  const adapterResult = await adapter.run({
    mode: args.mode,
    roles: base.plan.roles.map((row) => row.role),
    envelope: args.envelope
  });
  return {
    plan: base.plan,
    turns: adapterResult.turns,
    summary: {
      mode: args.mode,
      roles: base.plan.roles.map((entry) => entry.role),
      turnCount: adapterResult.turns.length,
      roleSummaries: adapterResult.turns.map((turn) => ({ role: turn.role, summary: turn.summary })),
      disagreement: adapterResult.disagreement,
      synthesisNote: adapterResult.synthesisNote,
      selectedModules: args.envelope.modules,
      warnings: adapterResult.warnings,
      executionSource: 'provider_backed',
      adapterName: adapter.name,
      adapterAvailable: true,
      footer: COUNCIL_FOOTER
    }
  };
}

export async function runOracleCouncil(args: {
  mode: TiekatCouncilMode;
  consent: Pick<TiekatConsentState, 'allowAncestry'>;
  envelope: TiekatCouncilInputEnvelope;
  adapterMode?: TiekatCouncilAdapterMode;
  provider?: string;
}): Promise<TiekatCouncilResult | null> {
  return runOracleCouncilWithAdapter(args);
}

export function buildCouncilContinuitySummary(summaries: Array<TiekatCouncilSummary | undefined | null>): TiekatCouncilContinuitySummary {
  const rows = summaries.filter(Boolean) as TiekatCouncilSummary[];
  if (rows.length < 2) {
    return {
      state: 'insufficient_data',
      recentModes: rows.map((row) => row.mode),
      disagreementRate: rows.length ? Number((rows.filter((row) => row.disagreement).length / rows.length).toFixed(3)) : 0,
      executionSources: rows.map((row) => row.executionSource),
      roleStability: 'stable',
      note: 'Insufficient council artifacts for continuity signal.'
    };
  }
  const recentModes = rows.map((row) => row.mode);
  const uniqueModes = new Set(recentModes);
  const roleSignature = rows.map((row) => row.roles.join('|'));
  const roleStability = new Set(roleSignature).size > 1 ? 'shifted' : 'stable';
  const disagreementRate = Number((rows.filter((row) => row.disagreement).length / rows.length).toFixed(3));
  const state = uniqueModes.size > 1 || roleStability === 'shifted' ? 'council_shift' : 'council_continuity';
  return {
    state,
    recentModes,
    disagreementRate,
    executionSources: rows.map((row) => row.executionSource),
    roleStability,
    note: state === 'council_continuity' ? 'Recent council artifacts show stable role/mode continuity.' : 'Recent council artifacts indicate mode/roster shift.'
  };
}
