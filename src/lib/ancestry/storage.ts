import { dbGet, dbSet } from '@/lib/local/db';
import { AncestryData } from './types';

export async function saveAncestry(data: AncestryData) {
  await dbSet('ancestry', data);
}

export async function loadAncestry(): Promise<AncestryData | null> {
  return await dbGet('ancestry');
}

export async function clearAncestry() {
  await dbSet('ancestry', null);
}
