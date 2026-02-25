const blocked = [
  /ignore previous instructions/gi,
  /override.*consent/gi,
  /enable ancestry data/gi,
  /disable safety/gi,
  /system prompt/gi
];

export function sanitizeUserInput(input: string) {
  let out = input;
  for (const r of blocked) out = out.replace(r, '[blocked-instruction]');
  return out.trim();
}
