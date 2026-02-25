import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { isTestMode } from '@/lib/env';
import { z } from 'zod';
import { drawCards } from '@/lib/tarot/engine';
import { callModel, assertProvider, getProviderConfigError } from '@/lib/ai/client';
import { demoTarotInterpretation } from '@/lib/ai/demo';
import { buildGroundingPacketTarot } from '@/lib/reading/grounding';
import { buildGroundedPrompt } from '@/lib/ai/promptBuilder';
import { buildRevisionPrompt, verifyReading } from '@/lib/reading/verifier';

const schema = z.object({
  question: z.string().optional(),
  spread: z.enum(['single', 'three-card', 'celtic-cross', 'tree-of-life', '369', 'ancestral-ladder']),
  seed: z.string().optional(),
  demoMode: z.boolean().optional(),
  style: z.enum(['Direct', 'Gentle', 'Ritual']).default('Gentle'),
  accuracyMode: z.boolean().default(true),
  passes: z.number().min(1).max(3).default(2),
  temperaturePreset: z.enum(['low', 'med']).default('low'),
  provider: z.enum(['ollama', 'openai', 'anthropic', 'xai']).optional(),
  model: z.string().optional()
});

export async function POST(req: NextRequest) {
  const limit = checkRateLimit(req.headers.get('x-forwarded-for') ?? 'local');
  if (!limit.ok) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const parsed = schema.parse(await req.json());
  const forcedDemo = isTestMode() || parsed.demoMode;
  const seed = parsed.seed ?? (isTestMode() ? 'test-seed' : undefined);
  const drawn = drawCards(parsed.spread, seed);
  const packet = buildGroundingPacketTarot(parsed.spread, drawn);
  if (forcedDemo) return NextResponse.json({ drawn, reading: demoTarotInterpretation(drawn, parsed.question), packet, mode: 'demo' });

  try {
    const provider = assertProvider(parsed.provider ?? 'ollama');
    const providerIssue = getProviderConfigError(provider);
    if (providerIssue) return NextResponse.json(providerIssue, { status: 400 });
    let reading = await callModel({ provider, model: parsed.model, prompt: buildGroundedPrompt(packet, parsed.style), temperature: parsed.temperaturePreset === 'low' ? 0.2 : 0.5 });
    if (parsed.accuracyMode) {
      for (let i = 0; i < parsed.passes; i++) {
        const issues = verifyReading(reading, packet);
        if (!issues.length) break;
        reading = await callModel({ provider, model: parsed.model, prompt: buildRevisionPrompt(reading, packet, issues), temperature: 0.1 });
      }
    }
    return NextResponse.json({ drawn, reading, packet, mode: 'ai' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'provider_error';
    if (msg.startsWith('invalid_provider:')) return NextResponse.json({ error: 'Invalid provider selection.' }, { status: 400 });
    return NextResponse.json({ drawn, reading: demoTarotInterpretation(drawn, parsed.question), packet, mode: 'demo-fallback' });
  }
}
