#!/usr/bin/env node
import { execSync } from 'node:child_process';

const ok = (m) => console.log(`✅ ${m}`);
const warn = (m) => console.log(`⚠️ ${m}`);
const fail = (m) => console.log(`❌ ${m}`);

const nodeMajor = Number(process.versions.node.split('.')[0]);
if (nodeMajor >= 20) ok(`Node ${process.versions.node} detected.`);
else {
  fail(`Node ${process.versions.node} detected. Use Node 20+.`);
  console.log('   Fix: install Node 20 LTS.');
}

try {
  const pnpmVersion = execSync('pnpm --version', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  ok(`pnpm ${pnpmVersion} detected.`);
} catch {
  fail('pnpm not found.');
  console.log('   Fix: run `corepack enable && corepack prepare pnpm@9.12.3 --activate`.');
}

try {
  execSync('corepack --version', { stdio: ['ignore', 'pipe', 'ignore'] });
  ok('corepack available.');
} catch {
  warn('corepack not found on PATH.');
}

const envHints = [
  ['OLLAMA_BASE_URL', process.env.OLLAMA_BASE_URL || 'http://localhost:11434 (default)'],
  ['OLLAMA_MODEL', process.env.OLLAMA_MODEL || 'llama3.1 (default)'],
  ['OPENAI_API_KEY', process.env.OPENAI_API_KEY ? 'set' : 'not set (optional)']
];

for (const [name, value] of envHints) console.log(`• ${name}: ${value}`);

console.log('\nIf install fails with 403/network policy:');
console.log('1) corepack enable');
console.log('2) pnpm config set registry https://registry.npmjs.org/');
console.log('3) pnpm store prune && pnpm install --prefer-offline');
console.log('4) Use Demo Mode in Settings to keep Tarot/Astrology usable without AI backend.');
