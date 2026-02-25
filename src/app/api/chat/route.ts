import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { callModel } from '@/lib/ai/client';

const schema = z.object({ message: z.string().min(1) });

export async function POST(req: NextRequest) {
  const { message } = schema.parse(await req.json());
  const prompt = `You are Gypsy AI. Respond warmly, mystical yet practical, and avoid fatalistic claims. User: ${message}`;
  const content = await callModel(prompt);
  return NextResponse.json({ content });
}
