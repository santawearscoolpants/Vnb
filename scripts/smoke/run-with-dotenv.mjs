#!/usr/bin/env node
/**
 * Loads repo-root .env into env (first '=' only per line), then runs smoke.mjs.
 * Avoids shell `export`/`cut` mangling JWT values that contain '='.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '../..');
const envPath = resolve(root, '.env');
const env = { ...process.env };

try {
  const text = readFileSync(envPath, 'utf8');
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    env[k] = v;
  }
} catch {
  console.error('[smoke] No .env at repo root; set SMOKE_* vars manually.');
  process.exit(1);
}

env.SMOKE_FRONTEND_URL ||= 'https://www.vnbway.com';
env.SMOKE_API_URL ||= env.VITE_API_URL || '';
env.SMOKE_SUPABASE_URL ||= env.VITE_SUPABASE_URL || '';
env.SMOKE_SUPABASE_ANON_KEY ||= env.VITE_SUPABASE_ANON_KEY || '';

const r = spawnSync(process.execPath, [resolve(root, 'scripts/smoke/smoke.mjs')], {
  env,
  cwd: root,
  stdio: 'inherit',
});
process.exit(r.status === null ? 1 : r.status);
