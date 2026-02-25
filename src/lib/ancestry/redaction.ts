import { Person } from './types';

export function yearFromDate(date?: string) {
  if (!date) return undefined;
  const m = date.match(/(\d{4})/);
  return m ? Number(m[1]) : undefined;
}

export function isLiving(person: Person, nowYear = new Date().getFullYear()) {
  if (person.death?.date) return false;
  const y = yearFromDate(person.birth?.date);
  if (!y) return true;
  return nowYear - y <= 120;
}

export function redactPerson(person: Person, hideLiving: boolean) {
  if (!hideLiving || !isLiving(person)) return person;
  return {
    ...person,
    names: ['Private Person'],
    notes: [],
    birth: person.birth ? { ...person.birth, place: undefined, date: undefined } : undefined
  };
}
