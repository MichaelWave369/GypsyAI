export interface AncestryEvent {
  type: string;
  date?: string;
  place?: string;
  raw?: string;
}

export interface Person {
  id: string;
  names: string[];
  sex?: string;
  birth?: AncestryEvent;
  death?: AncestryEvent;
  events: AncestryEvent[];
  notes: string[];
  famc: string[];
  fams: string[];
  sources: string[];
}

export interface Family {
  id: string;
  husb?: string;
  wife?: string;
  chil: string[];
  events: AncestryEvent[];
  notes: string[];
}

export interface AncestryData {
  people: Record<string, Person>;
  families: Record<string, Family>;
  warnings: string[];
}
