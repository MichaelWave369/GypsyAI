export const MOTHERSHIP_READER_SCHEMA = 'parallax.mothership.reader-envelope.v0.1' as const;

export type ReaderClaimClass =
  | 'computed'
  | 'source_observation'
  | 'symbolic_interpretation'
  | 'modeled_theoretical'
  | 'experimental';

export interface ReaderObservation {
  id: string;
  claimClass: ReaderClaimClass;
  label: string;
  value: unknown;
  source?: string;
  confidence?: 'low' | 'medium' | 'high' | 'deterministic';
  note?: string;
}

export interface ReaderInterpretation {
  id: string;
  framework: string;
  claimClass: 'symbolic_interpretation' | 'modeled_theoretical' | 'experimental';
  summary: string;
  basedOn: string[];
  note?: string;
}

export interface ReaderProvenance {
  id: string;
  kind: 'code' | 'dataset' | 'library' | 'source' | 'operator';
  label: string;
  version?: string;
  locator?: string;
  note?: string;
}

export interface ReaderWarning {
  code: string;
  message: string;
  severity: 'info' | 'caution' | 'blocked';
}

export interface MothershipReaderEnvelope<TInput = unknown> {
  schema: typeof MOTHERSHIP_READER_SCHEMA;
  reader: {
    id: string;
    name: string;
    version: string;
    implementation: string;
  };
  input: {
    kind: string;
    payload: TInput;
  };
  observations: ReaderObservation[];
  interpretations: ReaderInterpretation[];
  provenance: ReaderProvenance[];
  warnings: ReaderWarning[];
  claimBoundary: string;
  generatedAt?: string;
  receiptHash?: string;
}

function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortObject);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => key !== 'generatedAt' && key !== 'receiptHash')
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, child]) => [key, sortObject(child)])
    );
  }
  return value;
}

export function canonicalReaderPayload(envelope: MothershipReaderEnvelope): string {
  return JSON.stringify(sortObject(envelope));
}

export async function hashReaderEnvelope(envelope: MothershipReaderEnvelope): Promise<string> {
  const bytes = new TextEncoder().encode(canonicalReaderPayload(envelope));
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `RDR-${hex.slice(0, 16).toUpperCase()}`;
}

export async function finalizeReaderEnvelope<TInput>(
  envelope: MothershipReaderEnvelope<TInput>
): Promise<MothershipReaderEnvelope<TInput>> {
  const receiptHash = await hashReaderEnvelope(envelope);
  return { ...envelope, generatedAt: new Date().toISOString(), receiptHash };
}
