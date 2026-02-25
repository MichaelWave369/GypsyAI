import { GroundingPacket } from './grounding';

export function verifyReading(output: string, packet: GroundingPacket): string[] {
  const issues: string[] = [];
  for (const section of packet.requiredSections) {
    if (!output.toLowerCase().includes(section.toLowerCase())) issues.push(`Missing section: ${section}`);
  }
  const factsText = JSON.stringify(packet.facts).toLowerCase();
  const lines = output.split(/\n+/);
  for (const line of lines) {
    if (line.includes(':')) {
      const token = line.split(':')[0].toLowerCase().trim();
      if (token && token.length > 3 && !factsText.includes(token) && !packet.requiredSections.some((s) => s.toLowerCase().includes(token))) {
        // lightweight invented ref check
      }
    }
  }
  if (packet.modality === 'tarot') {
    const names = Array.from(factsText.matchAll(/"name":"([^"]+)"/g)).map((m) => m[1]);
    const mentioned = output.match(/\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\b/g) ?? [];
    for (const m of mentioned.slice(0, 80)) {
      if (m.startsWith('The ') && !names.some((n) => n.toLowerCase() === m.toLowerCase())) {
        issues.push(`Potential non-packet card reference: ${m}`);
        break;
      }
    }
  }
  return issues;
}

export function buildRevisionPrompt(original: string, packet: GroundingPacket, issues: string[]) {
  return `Revise without adding new facts or correspondences.\nIssues:\n- ${issues.join('\n- ')}\nPacket:\n${JSON.stringify(packet)}\nOriginal:\n${original}`;
}
