import { adaptAncestryContext, AncestryAdapterInput } from '@/lib/tiekat/adapters/ancestry';
import { adaptAstrologyContext, AstrologyAdapterInput } from '@/lib/tiekat/adapters/astrology';
import { adaptGeneKeysContext, GeneKeysAdapterInput } from '@/lib/tiekat/adapters/genekeys';
import { adaptTarotContext, TarotAdapterInput } from '@/lib/tiekat/adapters/tarot';
import { selectRelevantMemory } from '@/lib/tiekat/memory';
import { classifyTiekatRequest } from '@/lib/tiekat/routing';
import {
  TiekatConsentState,
  TiekatContextEnvelope,
  TiekatMemoryEntry,
  TiekatReflectionMode,
  TiekatReflectionPlan,
  TiekatSessionState
} from '@/lib/tiekat/schema';

export interface TiekatModuleDataInput {
  tarot?: TarotAdapterInput;
  astrology?: AstrologyAdapterInput;
  genekeys?: GeneKeysAdapterInput;
  ancestry?: AncestryAdapterInput;
}

export interface BuildTiekatContextArgs {
  message: string;
  consent: TiekatConsentState;
  moduleData?: TiekatModuleDataInput;
  memoryEntries?: TiekatMemoryEntry[];
}

function inferMode(moduleCount: number): TiekatReflectionMode {
  if (moduleCount <= 1) return 'assistant_synthesis';
  if (moduleCount === 2) return 'single_module';
  return 'blended';
}

function hasStringAnchors(value: unknown): value is { anchors: string[] } {
  return typeof value === 'object'
    && value !== null
    && 'anchors' in value
    && Array.isArray((value as { anchors?: unknown }).anchors)
    && (value as { anchors: unknown[] }).anchors.every((anchor) => typeof anchor === 'string');
}

export function buildTiekatContextEnvelope(args: BuildTiekatContextArgs): TiekatContextEnvelope {
  const moduleData = args.moduleData ?? {};
  const moduleContext: TiekatContextEnvelope['moduleContext'] = {
    tarot: adaptTarotContext(moduleData.tarot),
    astrology: adaptAstrologyContext(moduleData.astrology),
    genekeys: adaptGeneKeysContext(moduleData.genekeys),
    ancestry: adaptAncestryContext(moduleData.ancestry, args.consent)
  };

  const redactionApplied: string[] = [];
  if (!args.consent.allowAncestry) redactionApplied.push('ancestry_blocked');
  if (!args.consent.includeNames) redactionApplied.push('names_removed');
  if (args.consent.hideLivingPersons) redactionApplied.push('living_persons_hidden');
  if (!args.consent.memoryEnabled) redactionApplied.push('memory_disabled');

  const memoryContext = args.consent.memoryEnabled ? selectRelevantMemory(args.memoryEntries ?? [], args.message) : [];
  const symbolicAnchors = [
    ...(hasStringAnchors(moduleContext.tarot) ? moduleContext.tarot.anchors : []),
    ...memoryContext.flatMap((entry) => entry.anchors)
  ].slice(0, 12);

  return {
    message: args.message,
    consent: args.consent,
    moduleContext,
    memoryContext,
    symbolicAnchors,
    redactionApplied
  };
}

export function buildTiekatReflectionPlan(session: TiekatSessionState, envelope: TiekatContextEnvelope): TiekatReflectionPlan {
  const mode = inferMode(session.activeModules.length);
  const modulesToConsult = session.activeModules;
  const verificationRules = [
    'stay_in_scope_modules',
    'respect_ancestry_consent',
    'non_empty_response',
    `mode:${mode}`
  ];

  return {
    mode,
    modulesToConsult,
    contextSummary: `Intent: ${session.userIntent}. Anchors: ${envelope.symbolicAnchors.join(', ') || 'none'}. Redactions: ${envelope.redactionApplied.join(', ') || 'none'}.`,
    verificationRules,
    memoryKeysUsed: envelope.memoryContext.map((entry) => entry.key),
    gravityBootstrap: {
      enabled: true,
      status: 'theoretical',
      sourceMode: 'modeled_internal_signal'
    }
  };
}

export function buildTiekatSessionState(sessionId: string, message: string, consent: TiekatConsentState) {
  const routing = classifyTiekatRequest(message, consent);
  const state: TiekatSessionState = {
    sessionId,
    userIntent: routing.userIntent,
    activeModules: routing.modules,
    symbolicAnchors: [],
    consent
  };

  return { routing, state };
}
