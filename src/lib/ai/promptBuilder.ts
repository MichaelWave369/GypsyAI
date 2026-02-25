import { GroundingPacket } from '@/lib/reading/grounding';

export function buildGroundedPrompt(packet: GroundingPacket, style?: string) {
  return `Use only the provided grounding packet. Do not add new correspondences, cards, aspects, keys, or claims.
Style: ${style ?? 'Gentle'}
Required sections:\n${packet.requiredSections.map((s) => `- ${s}`).join('\n')}
Allowed terms:\n${packet.allowedTerms.slice(0, 200).join(', ')}
Facts packet JSON:\n${JSON.stringify(packet.facts, null, 2)}`;
}
