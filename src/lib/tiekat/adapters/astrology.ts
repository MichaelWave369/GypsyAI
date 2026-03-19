export interface AstrologyAdapterInput {
  placements?: Array<{ body?: string; sign?: string }>;
  aspects?: Array<{ a?: string; b?: string; type?: string }>;
  summary?: string;
}

export function adaptAstrologyContext(input?: AstrologyAdapterInput | null) {
  if (!input) return undefined;
  return {
    summary: input.summary ?? 'astrology snapshot',
    placements: (input.placements ?? []).slice(0, 8).map((p) => `${p.body ?? 'Body'} in ${p.sign ?? 'Sign'}`),
    aspects: (input.aspects ?? []).slice(0, 6).map((a) => `${a.a ?? 'A'} ${a.type ?? 'aspect'} ${a.b ?? 'B'}`)
  };
}
