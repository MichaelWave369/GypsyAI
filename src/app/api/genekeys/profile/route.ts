import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { buildGeneKeysProfile } from '@/lib/genekeys';

const schema = z.object({ date: z.string(), time: z.string() });

export async function POST(req: NextRequest) {
  const data = schema.parse(await req.json());
  const date = new Date(`${data.date}T${data.time}:00`);
  return NextResponse.json(buildGeneKeysProfile(date));
}
