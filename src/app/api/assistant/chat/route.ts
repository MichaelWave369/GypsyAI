import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { isTestMode } from '@/lib/env';
import { z } from 'zod';
import { classifyIntent } from '@/lib/assistant/router';
import { streamOllama, callModel, assertProvider, getProviderConfigError } from '@/lib/ai/client';
import { buildGroundingPacketTarot, buildGroundingPacketAstro, buildGroundingPacketGeneKeys } from '@/lib/reading/grounding';
import { drawCards } from '@/lib/tarot/engine';
import { computeChart } from '@/lib/astro/engine';
import { buildGeneKeysProfile } from '@/lib/genekeys';
import { verifyReading, buildRevisionPrompt } from '@/lib/reading/verifier';
import { buildGroundedPrompt } from '@/lib/ai/promptBuilder';
import { sanitizeUserInput } from '@/lib/security/promptShield';
import { buildTiekatContextEnvelope, buildTiekatReflectionPlan, buildTiekatSessionState } from '@/lib/tiekat/core';
import { TiekatConsentState } from '@/lib/tiekat/schema';
import { verifyTiekatOutput } from '@/lib/tiekat/verification';
import { computeGravityBootstrap } from '@/lib/tiekat/gravity';
import { getTiekatV54Metadata } from '@/lib/tiekat/v54';
import { buildSessionModePromptFrame, getDefaultSessionMode, resolveSessionMode } from '@/lib/tiekat/sessionMode';
import { buildCouncilInputEnvelope, runOracleCouncil, TiekatCouncilMode } from '@/lib/tiekat/oracleCouncil';

const consentSchema = z.object({
  allowAncestry: z.boolean().default(false),
  includeNames: z.boolean().default(false),
  hideLivingPersons: z.boolean().default(true),
  memoryEnabled: z.boolean().default(false)
});

const tiekatSchema = z
  .object({
    sessionId: z.string().optional(),
    sessionMode: z.enum(['open_reflection', 'tarot_inquiry', 'astrology_reflection', 'genekeys_contemplation', 'ancestral_listening', 'synthesis_oracle']).optional(),
    councilMode: z.enum(['disabled', 'oracle_council', 'deliberation_oracle', 'swarm_synthesis']).optional(),
    consent: consentSchema.optional(),
    moduleData: z
      .object({
        tarot: z.any().optional(),
        astrology: z.any().optional(),
        genekeys: z.any().optional(),
        ancestry: z.any().optional()
      })
      .optional(),
    gravityDiagnostics: z.boolean().optional(),
    memoryEntries: z
      .array(
        z.object({
          key: z.string(),
          summary: z.string(),
          anchors: z.array(z.string()),
          modules: z.array(z.enum(['assistant', 'tarot', 'astrology', 'genekeys', 'ancestry'])),
          updatedAt: z.string(),
          gravitySummary: z
            .object({
              deltaGPredicted: z.number(),
              informationIntegral: z.number(),
              contributingModules: z.array(z.enum(['assistant', 'tarot', 'astrology', 'genekeys', 'ancestry'])),
              status: z.enum(['disabled', 'theoretical', 'simulated']),
              scoringVersion: z.string().optional()
            })
            .optional()
        })
      )
      .optional()
  })
  .optional();

const schema = z.object({
  message: z.string().min(1),
  demoMode: z.boolean().optional(),
  strictReadingMode: z.boolean().optional(),
  autoSwitchReadingMode: z.boolean().optional(),
  provider: z.enum(['ollama', 'openai', 'anthropic', 'xai']).optional(),
  model: z.string().optional(),
  tiekat: tiekatSchema
});

const v54Metadata = getTiekatV54Metadata();

const defaultConsent: TiekatConsentState = {
  allowAncestry: false,
  includeNames: false,
  hideLivingPersons: true,
  memoryEnabled: false
};

export async function POST(req: NextRequest) {
  const limit = checkRateLimit(req.headers.get('x-forwarded-for') ?? 'local');
  if (!limit.ok) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const { message, demoMode, strictReadingMode = true, provider: providerInput, model, tiekat } = schema.parse(await req.json());
  const cleanMessage = sanitizeUserInput(message);
  const consent = tiekat?.consent ?? defaultConsent;
  const sessionMode = resolveSessionMode(tiekat?.sessionMode ?? getDefaultSessionMode(), { allowAncestry: consent.allowAncestry });
  const modeFrame = buildSessionModePromptFrame(sessionMode, { allowAncestry: consent.allowAncestry });
  const modeAdjustedMessage = `${modeFrame}\nUser message: ${cleanMessage}`;
  const intent = classifyIntent(modeAdjustedMessage, consent);
  const tiekatSession = buildTiekatSessionState(tiekat?.sessionId ?? crypto.randomUUID(), modeAdjustedMessage, consent);
  const tiekatEnvelope = buildTiekatContextEnvelope({
    message: modeAdjustedMessage,
    consent,
    moduleData: tiekat?.moduleData,
    memoryEntries: tiekat?.memoryEntries
  });
  tiekatSession.state.symbolicAnchors = tiekatEnvelope.symbolicAnchors;
  const tiekatPlan = buildTiekatReflectionPlan(tiekatSession.state, tiekatEnvelope);
  const councilMode = (tiekat?.councilMode ?? 'disabled') as TiekatCouncilMode;
  const councilEnvelope = buildCouncilInputEnvelope({
    message: modeAdjustedMessage,
    sessionMode,
    route: tiekatSession.routing.route,
    modules: tiekatPlan.modulesToConsult,
    ritualFrame: modeFrame,
    artifactContinuitySummary: tiekatPlan.contextSummary,
    ancestrySummary: typeof tiekat?.moduleData?.ancestry === 'string' ? tiekat.moduleData.ancestry : 'ancestry summary not expanded',
    consent
  });
  const councilResult = runOracleCouncil({
    mode: councilMode,
    consent,
    envelope: councilEnvelope
  });

  if (isTestMode() || demoMode) {
    const content = `Demo assistant (${intent}, mode=${sessionMode}): ${cleanMessage}\nOpening\nSpread overview\nCard-by-card\nHermetic Layer\nIntegration\nPractical steps\nClosing line`;
    const verification = verifyTiekatOutput(content, tiekatPlan, consent);
    const gravityBootstrap = computeGravityBootstrap({ session: tiekatSession.state, envelope: tiekatEnvelope, verification, includeDiagnostics: Boolean(tiekat?.gravityDiagnostics) });
    return NextResponse.json({
      content,
      intent,
      sources: [],
      tiekat: {
        route: tiekatSession.routing.route,
        plan: tiekatPlan,
        council: councilResult?.summary ?? null,
        verification,
        gravityBootstrap,
        v54: v54Metadata,
        sessionMode
      }
    });
  }

  let provider;
  try {
    provider = assertProvider(providerInput ?? 'ollama');
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'provider_error';
    if (msg.startsWith('invalid_provider:')) {
      return NextResponse.json({ error: 'Invalid provider selection.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Provider configuration error.' }, { status: 400 });
  }

  const providerIssue = getProviderConfigError(provider);
  if (providerIssue) return NextResponse.json(providerIssue, { status: 400 });

  const readingIntent = intent !== 'CHAT' && intent !== 'STUDY_LOOKUP';
  if (!readingIntent) {
    if (provider === 'ollama') {
      const body = await streamOllama({ model, prompt: `Conversational mode. Be warm and practical.\n${modeFrame}\nContext: ${tiekatPlan.contextSummary}\nUser: ${cleanMessage}` });
      if (!body) return NextResponse.json({ content: 'No stream body', intent, sources: [] });
      return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
    const content = await callModel({ provider, model, prompt: `Conversational mode. Be warm and practical.\n${modeFrame}\nContext: ${tiekatPlan.contextSummary}\nUser: ${cleanMessage}`, temperature: 0.2 });
    const verification = verifyTiekatOutput(content, tiekatPlan, consent);
    const gravityBootstrap = computeGravityBootstrap({ session: tiekatSession.state, envelope: tiekatEnvelope, verification, includeDiagnostics: Boolean(tiekat?.gravityDiagnostics) });
    return NextResponse.json({
      content,
      intent,
      sources: [],
      mode: 'chat',
      tiekat: {
        route: tiekatSession.routing.route,
        plan: tiekatPlan,
        council: councilResult?.summary ?? null,
        verification,
        gravityBootstrap,
        v54: v54Metadata,
        sessionMode
      }
    });
  }

  let packet;
  const sources: string[] = [];
  if (intent === 'TAROT_READING' || intent === 'ANCESTRY_READING') {
    const cards = drawCards(intent === 'ANCESTRY_READING' ? 'ancestral-ladder' : 'three-card', 'assistant-seed');
    packet = buildGroundingPacketTarot(intent === 'ANCESTRY_READING' ? 'ancestral-ladder' : 'three-card', cards);
    sources.push('Tarot cards');
    if (intent === 'ANCESTRY_READING') sources.push('Ancestry patterns (derived)');
  } else if (intent === 'ASTRO_READING') {
    const chart = computeChart(new Date(), 40.7128, -74.006, 6, 'tropical', false, true);
    packet = buildGroundingPacketAstro({ placements: chart.placements, aspects: chart.aspects.slice(0, 5), houses: chart.houses, keys: chart.hermeticKeys, dignityNotes: chart.dignityNotes, aspectTags: chart.aspectTags });
    sources.push('Astrology placements');
  } else {
    const gk = buildGeneKeysProfile(new Date());
    packet = buildGroundingPacketGeneKeys({ activationSequence: gk.activationSequence, planetary: gk.planetary, guideMode: 'contemplation', triads: ['gene keys spheres'] });
    sources.push('Gene Keys spheres');
  }

  let reading = await callModel({ provider, model, prompt: buildGroundedPrompt(packet, 'Gentle'), temperature: 0.2 });
  if (strictReadingMode) {
    const issues = verifyReading(reading, packet);
    if (issues.length) reading = await callModel({ provider, model, prompt: buildRevisionPrompt(reading, packet, issues), temperature: 0.1 });
  }

  const verification = verifyTiekatOutput(reading, tiekatPlan, consent);
  const gravityBootstrap = computeGravityBootstrap({ session: tiekatSession.state, envelope: tiekatEnvelope, verification, includeDiagnostics: Boolean(tiekat?.gravityDiagnostics) });
  return NextResponse.json({
    content: reading,
    intent,
    sources,
    mode: 'reading',
    tiekat: {
      route: tiekatSession.routing.route,
      plan: tiekatPlan,
      council: councilResult?.summary ?? null,
      verification,
      gravityBootstrap,
      v54: v54Metadata,
      sessionMode
    }
  });
}
