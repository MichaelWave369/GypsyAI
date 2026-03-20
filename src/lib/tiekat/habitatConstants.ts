export const HABITAT_STALE_DAYS = 14 as const;
export const HABITAT_FREQUENT_USE_THRESHOLD = 5 as const;
export const HABITAT_CONSTELLATION_RECENT_WINDOW = 2 as const;
export const HABITAT_CONSTELLATION_MAX_NODES = 4 as const;
export const HABITAT_DECK_MAX_CARDS = 12 as const;

export const HABITAT_STALE_MS = HABITAT_STALE_DAYS * 24 * 60 * 60 * 1000;
