import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { isTestMode } from '@/lib/env';
import { z } from 'zod';
import { buildGeneKeysProfile, getKeySummary } from '@/lib/genekeys';
import { buildGroundingPacketGeneKeys } from '@/lib/reading/grounding';
import { buildGroundedPrompt } from '@/lib/ai/promptBuilder';
import { callModel, assertProvider, getProviderConfigError } from '@/lib/ai/client';
import { buildRevisionPrompt, verifyReading } from '@/lib/reading/verifier';

const schema = z.object({ date: z.string(), time: z.string(), guideMode: z.enum(['contemplation', 'direct']).default('contemplation'), demoMode: z.boolean().optional(), accuracyMode: z.boolean().default(true), provider: z.enum(['ollama', 'openai', 'anthropic', 'xai']).optional(), model: z.string().optional() });

export async function POST(req: NextRequest) {
  const limit = checkRateLimit(req.headers.get('x-forwarded-for') ?? 'local');
  if (!limit.ok) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const data = schema.parse(await req.json());
  const profile = buildGeneKeysProfile(new Date(`${data.date}T${data.time}:00`));
  const spheres = [profile.activationSequence.lifeWork, profile.activationSequence.evolution, profile.activationSequence.radiance, profile.activationSequence.purpose].map((s: any) => ({ ...s, triad: getKeySummary(s.key) }));
  const packet = buildGroundingPacketGeneKeys({ activationSequence: spheres, planetary: profile.planetary, guideMode: data.guideMode, triads: spheres.map((s: any) => `Key ${s.key}`) });
  if (isTestMode() || data.demoMode) return NextResponse.json({ profile, packet, reading: 'Short opening\nActivation Sequence overview\nEach sphere\nIntegration theme\nJournal prompts' });
  try {
    const provider = assertProvider(data.provider ?? 'ollama');
    const providerIssue = getProviderConfigError(provider);
    if (providerIssue) return NextResponse.json(providerIssue, { status: 400 });
    let reading = await callModel({ provider, model: data.model, prompt: buildGroundedPrompt(packet, data.guideMode === 'direct' ? 'Direct' : 'Gentle'), temperature: 0.2 });
    if (data.accuracyMode) {
      const issues = verifyReading(reading, packet);
      if (issues.length) reading = await callModel({ provider, model: data.model, prompt: buildRevisionPrompt(reading, packet, issues), temperature: 0.1 });
    }
    return NextResponse.json({ profile, packet, reading });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'provider_error';
    if (msg.startsWith('invalid_provider:')) return NextResponse.json({ error: 'Invalid provider selection.' }, { status: 400 });
    return NextResponse.json({ profile, packet, reading: 'Provider unavailable. Use Demo Mode for deterministic guidance.' }, { status: 502 });
  }
}
