import { TiekatConsentState, TiekatModuleKey, TiekatReflectionPlan, TiekatVerificationResult } from '@/lib/tiekat/schema';

const MODULE_TOKENS: Record<TiekatModuleKey, string[]> = {
  assistant: ['reflect', 'integration', 'journal', 'practice'],
  tarot: ['tarot', 'card', 'spread', 'arcana'],
  astrology: ['chart', 'transit', 'planet', 'sign', 'house'],
  genekeys: ['gene key', 'shadow', 'gift', 'siddhi'],
  ancestry: ['ancestor', 'lineage', 'family', 'bloodline']
};

function detectUsedModules(text: string): TiekatModuleKey[] {
  const t = text.toLowerCase();
  return (Object.keys(MODULE_TOKENS) as TiekatModuleKey[]).filter((module) => MODULE_TOKENS[module].some((token) => t.includes(token)));
}

export function verifyTiekatOutput(output: string, plan: TiekatReflectionPlan, consent: TiekatConsentState): TiekatVerificationResult {
  const issues: string[] = [];
  const trimmed = output.trim();

  if (!trimmed) issues.push('Output is empty.');
  if (trimmed.length < 24) issues.push('Output is too short to be meaningful.');

  const usedModules = detectUsedModules(trimmed);
  const scopeLeak = usedModules.filter((module) => module !== 'assistant' && !plan.modulesToConsult.includes(module));
  if (scopeLeak.length) issues.push(`Output referenced out-of-scope modules: ${scopeLeak.join(', ')}.`);

  if (!consent.allowAncestry) {
    const ancestryLeak = MODULE_TOKENS.ancestry.some((token) => trimmed.toLowerCase().includes(token));
    if (ancestryLeak) issues.push('Output referenced ancestry details when ancestry consent is disabled.');
  }

  if (plan.mode === 'single_module' && plan.modulesToConsult.filter((module) => module !== 'assistant').length > 1) {
    issues.push('Plan mode mismatch: single_module includes multiple modules.');
  }

  const coherenceScore = Math.max(0, 1 - issues.length * 0.25);
  return {
    passed: issues.length === 0,
    coherenceScore: Number(coherenceScore.toFixed(2)),
    issues,
    usedModules: usedModules.length ? usedModules : ['assistant']
  };
}
