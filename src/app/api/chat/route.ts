import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { isTestMode } from '@/lib/env';
import { z } from 'zod';
import { streamOllama } from '@/lib/ai/client';
import { sanitizeUserInput } from '@/lib/security/promptShield';

const schema = z.object({ message: z.string().min(1), demoMode: z.boolean().optional(), mode: z.enum(['tarot', 'astrology', 'genekeys', 'blend']).default('tarot') });

export async function POST(req: NextRequest) {
  const limit = checkRateLimit(req.headers.get('x-forwarded-for') ?? 'local');
  if (!limit.ok) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const { message, demoMode, mode } = schema.parse(await req.json());
  const cleanMessage = sanitizeUserInput(message);
  const framed = `Mode: ${mode}. Keep modality facts separated. Never claim certainty.`;
  if (isTestMode() || demoMode) return NextResponse.json({ content: `Demo ${mode} response:\n${cleanMessage}\n${framed}` });
  try {
    const body = await streamOllama(`${framed}\nRespond with concise structured guidance:\n${cleanMessage}`);
    if (!body) return NextResponse.json({ content: 'No stream body returned.' });
    return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' } });
  } catch {
    return NextResponse.json({ content: `Fallback ${mode} response:\n${cleanMessage}\nUse Demo Mode for deterministic guidance.` });
  }
}
