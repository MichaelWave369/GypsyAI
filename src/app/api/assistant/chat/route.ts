import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { isTestMode } from '@/lib/env';
import { z } from 'zod';
import { classifyIntent } from '@/lib/assistant/router';
import { streamOllama, callModel } from '@/lib/ai/client';
import { buildGroundingPacketTarot, buildGroundingPacketAstro, buildGroundingPacketGeneKeys } from '@/lib/reading/grounding';
import { drawCards } from '@/lib/tarot/engine';
import { computeChart } from '@/lib/astro/engine';
import { buildGeneKeysProfile } from '@/lib/genekeys';
import { verifyReading, buildRevisionPrompt } from '@/lib/reading/verifier';
import { buildGroundedPrompt } from '@/lib/ai/promptBuilder';
import { sanitizeUserInput } from '@/lib/security/promptShield';

const schema = z.object({ message: z.string().min(1), demoMode: z.boolean().optional(), strictReadingMode: z.boolean().optional(), autoSwitchReadingMode: z.boolean().optional() });

export async function POST(req: NextRequest) {
  const limit = checkRateLimit(req.headers.get('x-forwarded-for') ?? 'local');
  if (!limit.ok) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const { message, demoMode, strictReadingMode = true } = schema.parse(await req.json());
  const cleanMessage = sanitizeUserInput(message);
  const intent = classifyIntent(cleanMessage);
  if (isTestMode() || demoMode) return NextResponse.json({ content: `Demo assistant (${intent}): ${cleanMessage}\nOpening\nSpread overview\nCard-by-card\nHermetic Layer\nIntegration\nPractical steps\nClosing line`, intent, sources: [] });

  const readingIntent = intent !== 'CHAT' && intent !== 'STUDY_LOOKUP';
  if (!readingIntent) {
    const body = await streamOllama(`Conversational mode. Be warm and practical.\nUser: ${cleanMessage}`);
    if (!body) return NextResponse.json({ content: 'No stream body', intent, sources: [] });
    return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
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

  let reading = await callModel(buildGroundedPrompt(packet, 'Gentle'), 0.2);
  if (strictReadingMode) {
    const issues = verifyReading(reading, packet);
    if (issues.length) reading = await callModel(buildRevisionPrompt(reading, packet, issues), 0.1);
  }
  return NextResponse.json({ content: reading, intent, sources, mode: 'reading' });
}
