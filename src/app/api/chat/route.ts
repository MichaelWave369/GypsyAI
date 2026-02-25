import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { streamOllama } from '@/lib/ai/client';

const schema = z.object({ message: z.string().min(1), demoMode: z.boolean().optional(), mode: z.enum(['tarot', 'astrology', 'genekeys', 'blend']).default('tarot') });

export async function POST(req: NextRequest) {
  const { message, demoMode, mode } = schema.parse(await req.json());
  const framed = `Mode: ${mode}. Keep modality facts separated. Never claim certainty.`;
  if (demoMode) return NextResponse.json({ content: `Demo ${mode} response:\n${message}\n${framed}` });
  try {
    const body = await streamOllama(`${framed}\nRespond with concise structured guidance:\n${message}`);
    if (!body) return NextResponse.json({ content: 'No stream body returned.' });
    return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' } });
  } catch {
    return NextResponse.json({ content: `Fallback ${mode} response:\n${message}\nUse Demo Mode for deterministic guidance.` });
  }
}
