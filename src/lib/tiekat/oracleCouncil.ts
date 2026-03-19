import { TiekatConsentState, TiekatModuleKey } from '@/lib/tiekat/schema';
import { TiekatSessionModeKey } from '@/lib/tiekat/sessionMode';

export type TiekatCouncilMode = 'disabled' | 'oracle_council' | 'deliberation_oracle' | 'swarm_synthesis';

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
  footer: string;
}

export interface TiekatCouncilResult {
  plan: TiekatCouncilPlan;
  turns: TiekatCouncilTurn[];
  summary: TiekatCouncilSummary;
}

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

export function runOracleCouncil(args: {
  mode: TiekatCouncilMode;
  consent: Pick<TiekatConsentState, 'allowAncestry'>;
  envelope: TiekatCouncilInputEnvelope;
}): TiekatCouncilResult | null {
  if (args.mode === 'disabled') return null;
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
  const summary: TiekatCouncilSummary = {
    mode: args.mode,
    roles: plan.roles.map((entry) => entry.role),
    turnCount: turns.length,
    roleSummaries: turns.map((turn) => ({ role: turn.role, summary: turn.summary })),
    disagreement,
    synthesisNote: `Council synthesized ${turns.length} compact role perspectives under TIEKAT governance.`,
    selectedModules: args.envelope.modules,
    warnings,
    footer: COUNCIL_FOOTER
  };

  return { plan, turns, summary };
}
