import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { drawCards } from '@/lib/tarot/engine';
import { buildTarotPrompt } from '@/lib/ai/promptBuilder';
import { callModel } from '@/lib/ai/client';

const schema = z.object({
  question: z.string().optional(),
  spread: z.enum(['single', 'three-card', 'celtic-cross', 'tree-of-life', '369']),
  seed: z.string().optional()
});

export async function POST(req: NextRequest) {
  const parsed = schema.parse(await req.json());
  const drawn = drawCards(parsed.spread, parsed.seed);
  const prompt = buildTarotPrompt({ question: parsed.question, spread: parsed.spread, drawn });
  const reading = await callModel(prompt);
  return NextResponse.json({ drawn, reading });
}
