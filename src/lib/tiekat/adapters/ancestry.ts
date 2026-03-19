import { TiekatConsentState } from '@/lib/tiekat/schema';

export interface AncestryAdapterInput {
  topBirthPlaces?: Array<[string, number]>;
  migrationArcs?: Array<[string, number]>;
  repeatingGivenNames?: Array<[string, number]>;
  eventClusters?: Array<[string, number]>;
}

export function adaptAncestryContext(input: AncestryAdapterInput | null | undefined, consent: TiekatConsentState) {
  if (!input || !consent.allowAncestry) return undefined;

  return {
    topBirthPlaces: (input.topBirthPlaces ?? []).slice(0, 5),
    migrationArcs: (input.migrationArcs ?? []).slice(0, 5),
    repeatingGivenNames: consent.includeNames ? (input.repeatingGivenNames ?? []).slice(0, 8) : [],
    eventClusters: (input.eventClusters ?? []).slice(0, 6),
    redactedNames: !consent.includeNames
  };
}
