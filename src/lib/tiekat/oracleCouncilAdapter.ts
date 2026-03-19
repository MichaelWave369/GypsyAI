import type { TiekatCouncilInputEnvelope, TiekatCouncilMode, TiekatCouncilRole, TiekatCouncilTurn } from '@/lib/tiekat/oracleCouncil';

export type TiekatCouncilAdapterMode = 'deterministic_only' | 'provider_preferred';

export interface TiekatCouncilAdapterResult {
  turns: TiekatCouncilTurn[];
  disagreement: boolean;
  synthesisNote: string;
  warnings: string[];
}

export interface TiekatCouncilAdapter {
  name: string;
  available: boolean;
  run: (args: {
    mode: TiekatCouncilMode;
    roles: TiekatCouncilRole[];
    envelope: TiekatCouncilInputEnvelope;
  }) => Promise<TiekatCouncilAdapterResult>;
}

function buildProviderBackedStub(provider: string): TiekatCouncilAdapter {
  return {
    name: `provider_stub:${provider}`,
    available: true,
    run: async ({ mode, roles, envelope }) => {
      const turns: TiekatCouncilTurn[] = roles.map((role, i) => ({
        role,
        summary: `[provider:${provider}] ${role} examined ${mode} using ${envelope.modules.join(',') || 'assistant'} modules.`.slice(0, 200),
        agreesWithPrior: i === 0 ? true : role !== 'skeptic_grounder',
        warning: role === 'skeptic_grounder' ? 'provider_grounding_check' : undefined
      }));
      return {
        turns,
        disagreement: turns.some((turn) => !turn.agreesWithPrior),
        synthesisNote: `Provider-backed council adapter (${provider}) produced compact role summaries under TIEKAT governance.`,
        warnings: turns.map((turn) => turn.warning).filter(Boolean) as string[]
      };
    }
  };
}

export function resolveCouncilAdapter(mode: TiekatCouncilAdapterMode, provider?: string): TiekatCouncilAdapter {
  if (mode === 'provider_preferred' && provider && provider !== 'ollama') {
    return buildProviderBackedStub(provider);
  }
  return {
    name: 'deterministic_stub',
    available: false,
    run: async () => ({ turns: [], disagreement: false, synthesisNote: '', warnings: [] })
  };
}
