import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { isTestMode } from '@/lib/env';
import { z } from 'zod';
import { callModel, streamOllama, assertProvider, ensureProviderConfigured } from '@/lib/ai/client';
import { sanitizeUserInput } from '@/lib/security/promptShield';

const schema = z.object({
  message: z.string().min(1),
  demoMode: z.boolean().optional(),
  mode: z.enum(['tarot', 'astrology', 'genekeys', 'blend']).default('tarot'),
  provider: z.string().optional(),
  model: z.string().optional()
});

export async function POST(req: NextRequest) {
  const limit = checkRateLimit(req.headers.get('x-forwarded-for') ?? 'local');
  if (!limit.ok) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const { message, demoMode, mode, provider: providerInput, model } = schema.parse(await req.json());
  const cleanMessage = sanitizeUserInput(message);
  const framed = `Mode: ${mode}. Keep modality facts separated. Never claim certainty.`;

  if (isTestMode() || demoMode) return NextResponse.json({ content: `Demo ${mode} response:\n${cleanMessage}\n${framed}` });

  try {
    const provider = assertProvider(providerInput ?? 'ollama');
    ensureProviderConfigured(provider);

    if (provider === 'ollama') {
      const body = await streamOllama(`${framed}\nRespond with concise structured guidance:\n${cleanMessage}`, model);
      if (!body) return NextResponse.json({ content: 'No stream body returned.' });
      return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' } });
    }

    const content = await callModel(`${framed}\nRespond with concise structured guidance:\n${cleanMessage}`, 0.2, { provider, model });
    return NextResponse.json({ content, provider, mode: 'non-stream' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'provider_error';
    if (msg.startsWith('invalid_provider:')) {
      return NextResponse.json({ error: 'Invalid provider selection.' }, { status: 400 });
    }
    if (msg.startsWith('missing_api_key:')) {
      const missing = msg.split(':')[1];
      return NextResponse.json({ error: `Missing API key for ${missing}. Add it in environment variables or enable Demo Mode.` }, { status: 400 });
    }
    return NextResponse.json({ content: `Fallback ${mode} response:\n${cleanMessage}\nUse Demo Mode for deterministic guidance.` });
  }
}
