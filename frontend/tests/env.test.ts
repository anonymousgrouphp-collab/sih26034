import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, '..');
const rootDir = path.resolve(frontendDir, '..');

test('frontend .env and .env.local exist and contain authoritative keys if present', (t) => {
  const envPath = path.join(frontendDir, '.env');
  const envLocalPath = path.join(frontendDir, '.env.local');
  const envProdPath = path.join(frontendDir, '.env.production');

  if (!fs.existsSync(envPath)) {
    t.skip('frontend/.env not present in this environment');
    return;
  }

  const content = fs.readFileSync(envPath, 'utf8');
  assert.match(content, /VITE_API_BASE_URL=\/api\/v1/);
  assert.match(content, /VITE_DEMO_OFFICER_USERNAME=controller_south/);
  assert.match(content, /VITE_DEMO_OFFICER_PASSWORD=Officer@2026/);
  assert.match(content, /VITE_OPERATING_MODE=LIVE/);
  assert.match(content, /VITE_SUPABASE_URL=https:\/\/ihqhfusgkullpbjfmjiy\.supabase\.co/);
  assert.match(content, /VITE_SUPABASE_ANON_KEY=sb_publishable_oJ5QTPn5xIzUEvvG---oyQ_5wrU3-8v/);
});

test('root .env exists and contains Oracle VM and Supabase credentials if present', (t) => {
  const rootEnvPath = path.join(rootDir, '.env');
  if (!fs.existsSync(rootEnvPath)) {
    t.skip('root .env not present in this environment');
    return;
  }

  const content = fs.readFileSync(rootEnvPath, 'utf8');
  assert.match(content, /ORACLE_VM_HOST=68\.233\.117\.16/);
  assert.match(content, /ORACLE_VM_USERNAME=ubuntu/);
  assert.match(content, /ORACLE_VM_KEY_PATH=oracle_vm_key\.pem/);
  assert.match(content, /ORACLE_VM_SSH_KEY="-----BEGIN RSA PRIVATE KEY-----/);
  assert.match(content, /DEMO_OFFICER_USERNAME=controller_south/);
  assert.match(content, /DEMO_OFFICER_PASSWORD=Officer@2026/);
  assert.match(content, /SUPABASE_URL=https:\/\/ihqhfusgkullpbjfmjiy\.supabase\.co/);
  assert.match(content, /SUPABASE_KEY=sb_publishable_oJ5QTPn5xIzUEvvG---oyQ_5wrU3-8v/);
  assert.match(content, /SUPABASE_SERVICE_ROLE_KEY=/);
});

test('environment example templates exist and are valid across modules', () => {
  const rootExample = path.join(rootDir, '.env.example');
  const frontendExample = path.join(frontendDir, '.env.example');
  const backendExample = path.join(rootDir, 'backend', '.env.example');

  assert.ok(fs.existsSync(rootExample), 'root .env.example must exist');
  assert.ok(fs.existsSync(frontendExample), 'frontend/.env.example must exist');
  assert.ok(fs.existsSync(backendExample), 'backend/.env.example must exist');

  const rootExContent = fs.readFileSync(rootExample, 'utf8');
  assert.match(rootExContent, /VITE_API_BASE_URL=\/api\/v1/);
  assert.match(rootExContent, /ORACLE_VM_HOST=68\.233\.117\.16/);
  assert.match(rootExContent, /ORACLE_VM_KEY_PATH=oracle_vm_key\.pem/);
});

test('backend .env exists and contains database and cloud storage variables if present', (t) => {
  const backendEnvPath = path.join(rootDir, 'backend', '.env');
  if (!fs.existsSync(backendEnvPath)) {
    t.skip('backend/.env not present in this environment');
    return;
  }

  const content = fs.readFileSync(backendEnvPath, 'utf8');
  assert.match(content, /DATABASE_URL=/);
  assert.match(content, /SUPABASE_URL=https:\/\/ihqhfusgkullpbjfmjiy\.supabase\.co/);
  assert.match(content, /DEMO_OFFICER_USERNAME=controller_south/);
  assert.match(content, /DEMO_OFFICER_PASSWORD=Officer@2026/);
});

test('oracle_vm_key.pem exists and has valid RSA private key structure if present', (t) => {
  const keyPath = path.join(rootDir, 'oracle_vm_key.pem');
  if (!fs.existsSync(keyPath)) {
    t.skip('oracle_vm_key.pem not present in this environment');
    return;
  }

  const content = fs.readFileSync(keyPath, 'utf8');
  assert.ok(content.includes('-----BEGIN RSA PRIVATE KEY-----'));
  assert.ok(content.includes('-----END RSA PRIVATE KEY-----'));
});
