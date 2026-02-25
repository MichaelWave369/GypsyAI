import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { streamOllama } from '@/lib/ai/client';

const schema = z.object({ message: z.string().min(1), demoMode: z.boolean().optional() });

export async function POST(req: NextRequest) {
  const { message, demoMode } = schema.parse(await req.json());

  if (demoMode) {
    return NextResponse.json({ content: `Demo response: ${message}\nReflect on one practical step and one Hermetic correspondence.` });
  }

  try {
    const body = await streamOllama(`Respond with concise, structured guidance:\n${message}`);
    if (!body) return NextResponse.json({ content: 'No stream body returned.' });
    return new Response(body, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    });
  } catch {
    return NextResponse.json({ content: `Fallback response: ${message}\nThe local model is unavailable; use Demo Mode for deterministic guidance.` });
  }
}
