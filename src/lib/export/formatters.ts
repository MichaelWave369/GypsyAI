export function toJsonExport(data: unknown) {
  return JSON.stringify(data, null, 2);
}

export function tarotToMarkdown(input: {
  spread: string;
  question?: string;
  createdAt: string;
  interpretation: string;
  cards: string[];
}) {
  return `# Gypsy AI Tarot Session\n\n- Spread: ${input.spread}\n- Question: ${input.question ?? 'N/A'}\n- Timestamp: ${input.createdAt}\n\n## Cards\n${input.cards.map((c) => `- ${c}`).join('\n')}\n\n## Interpretation\n${input.interpretation}\n`;
}

export function chartToMarkdown(input: {
  name?: string;
  createdAt: string;
  placements: string[];
  aspects: string[];
  houses: string[];
}) {
  return `# Gypsy AI Chart Export\n\n- Name: ${input.name ?? 'N/A'}\n- Timestamp: ${input.createdAt}\n\n## Placements\n${input.placements.map((x) => `- ${x}`).join('\n')}\n\n## Aspects\n${input.aspects.map((x) => `- ${x}`).join('\n')}\n\n## Houses\n${input.houses.map((x) => `- ${x}`).join('\n')}\n`;
}

export function toPrintableHtml(title: string, body: string) {
  return `<!doctype html><html><head><meta charset="UTF-8"/><title>${title}</title><style>body{font-family:system-ui;padding:24px;max-width:900px;margin:auto;}h1{margin-bottom:8px;}pre{white-space:pre-wrap;}</style></head><body><h1>${title}</h1><pre>${body.replace(/</g, '&lt;')}</pre></body></html>`;
}
