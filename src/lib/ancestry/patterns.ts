import { AncestryData } from './types';

const topN = (obj: Record<string, number>, n: number) => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n);

export function extractAncestryPatterns(data: AncestryData) {
  const placeCounts: Record<string, number> = {};
  const givenNames: Record<string, number> = {};
  const longevity: number[] = [];
  const eventYears: Record<string, number> = {};
  const migrationArcs: Record<string, number> = {};

  for (const p of Object.values(data.people)) {
    const name = (p.names[0] || '').split(' ')[0];
    if (name) givenNames[name] = (givenNames[name] || 0) + 1;
    if (p.birth?.place) placeCounts[p.birth.place] = (placeCounts[p.birth.place] || 0) + 1;
    const by = p.birth?.date?.match(/(\d{4})/)?.[1];
    const dy = p.death?.date?.match(/(\d{4})/)?.[1];
    if (by && dy) longevity.push(Number(dy) - Number(by));
    for (const e of p.events) {
      const y = e.date?.match(/(\d{4})/)?.[1];
      if (y) eventYears[y] = (eventYears[y] || 0) + 1;
    }
    const fam = p.famc[0] ? data.families[p.famc[0]] : undefined;
    const parent = fam?.husb ? data.people[fam.husb] : undefined;
    if (parent?.birth?.place && p.birth?.place && parent.birth.place !== p.birth.place) {
      const arc = `${parent.birth.place} -> ${p.birth.place}`;
      migrationArcs[arc] = (migrationArcs[arc] || 0) + 1;
    }
  }

  return {
    topBirthPlaces: topN(placeCounts, 5),
    migrationArcs: topN(migrationArcs, 8),
    repeatingGivenNames: topN(givenNames, 10),
    longevity: {
      count: longevity.length,
      avg: longevity.length ? Number((longevity.reduce((a, b) => a + b, 0) / longevity.length).toFixed(1)) : null,
      min: longevity.length ? Math.min(...longevity) : null,
      max: longevity.length ? Math.max(...longevity) : null
    },
    eventClusters: topN(eventYears, 8)
  };
}
