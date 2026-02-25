import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { buildGeneKeysProfile, getKeySummary } from '@/lib/genekeys';
import { buildGroundingPacketGeneKeys } from '@/lib/reading/grounding';
import { buildGroundedPrompt } from '@/lib/ai/promptBuilder';
import { callModel } from '@/lib/ai/client';
import { buildRevisionPrompt, verifyReading } from '@/lib/reading/verifier';

const schema = z.object({ date: z.string(), time: z.string(), guideMode: z.enum(['contemplation', 'direct']).default('contemplation'), demoMode: z.boolean().optional(), accuracyMode: z.boolean().default(true) });

export async function POST(req: NextRequest) {
  const data = schema.parse(await req.json());
  const profile = buildGeneKeysProfile(new Date(`${data.date}T${data.time}:00`));
  const spheres = [profile.activationSequence.lifeWork, profile.activationSequence.evolution, profile.activationSequence.radiance, profile.activationSequence.purpose].map((s:any)=>({ ...s, triad: getKeySummary(s.key) }));
  const packet = buildGroundingPacketGeneKeys({ activationSequence: spheres, planetary: profile.planetary, guideMode: data.guideMode, triads: spheres.map((s:any)=>`Key ${s.key}`) });
  if (data.demoMode) return NextResponse.json({ profile, packet, reading: 'Short opening\nActivation Sequence overview\nEach sphere\nIntegration theme\nJournal prompts' });
  let reading = await callModel(buildGroundedPrompt(packet, data.guideMode === 'direct' ? 'Direct' : 'Gentle'), 0.2);
  if (data.accuracyMode) {
    const issues = verifyReading(reading, packet);
    if (issues.length) reading = await callModel(buildRevisionPrompt(reading, packet, issues), 0.1);
  }
  return NextResponse.json({ profile, packet, reading });
}
