import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { drawCards } from '@/lib/tarot/engine';
import { buildTarotPrompt } from '@/lib/ai/promptBuilder';
import { callModel } from '@/lib/ai/client';
import { demoTarotInterpretation } from '@/lib/ai/demo';

const schema = z.object({
  question: z.string().optional(),
  spread: z.enum(['single', 'three-card', 'celtic-cross', 'tree-of-life', '369']),
  seed: z.string().optional(),
  demoMode: z.boolean().optional(),
  style: z.enum(['Direct', 'Gentle', 'Ritual']).default('Gentle')
});

export async function POST(req: NextRequest) {
  const parsed = schema.parse(await req.json());
  const drawn = drawCards(parsed.spread, parsed.seed);

  if (parsed.demoMode) {
    return NextResponse.json({ drawn, reading: demoTarotInterpretation(drawn, parsed.question), mode: 'demo' });
  }

  try {
    const prompt = buildTarotPrompt({ question: parsed.question, spread: parsed.spread, drawn, style: parsed.style });
    const reading = await callModel(prompt);
    return NextResponse.json({ drawn, reading, mode: 'ai' });
  } catch {
    return NextResponse.json({ drawn, reading: demoTarotInterpretation(drawn, parsed.question), mode: 'demo-fallback' });
  }
}
