import { spawn } from 'node:child_process';
import { access } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const cwd = process.cwd();
const port = Number(process.env.SMOKE_PORT ?? 3100);
const baseUrl = `http://localhost:${port}`;
const nextCli = path.join(cwd, 'node_modules', 'next', 'dist', 'bin', 'next');

const env = {
  ...process.env,
  NEXT_PUBLIC_APP_URL: baseUrl,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? '',
  FC_ACCESS_CODE: process.env.FC_ACCESS_CODE ?? 'fc-demo',
  DRIVER_ACCESS_CODE: process.env.DRIVER_ACCESS_CODE ?? 'driver-demo',
};

const checks = [
  { path: '/', text: 'Doorin5' },
  { path: '/order', text: 'Book a local delivery' },
  { path: '/fc', text: 'FC dashboard' },
  { path: '/driver', text: 'Driver dashboard' },
  { path: '/track/demo-1002', text: 'demo-1002' },
  { path: '/api/health', json: true },
  { path: '/api/orders/demo-1002', json: true },
];

await access(path.join(cwd, '.next', 'BUILD_ID')).catch(() => {
  throw new Error('Missing .next build output. Run `npm run build` before `npm run smoke`.');
});

const server = spawn(process.execPath, [nextCli, 'start', '-p', String(port)], {
  cwd,
  env,
  stdio: ['ignore', 'pipe', 'pipe'],
});

let serverOutput = '';
server.stdout.on('data', (chunk) => {
  serverOutput += chunk.toString();
});
server.stderr.on('data', (chunk) => {
  serverOutput += chunk.toString();
});

try {
  await waitForServer(`${baseUrl}/api/health`);

  for (const check of checks) {
    const url = `${baseUrl}${check.path}`;
    const response = await fetch(url, { redirect: 'manual' });
    if (!response.ok) {
      throw new Error(`${check.path} returned ${response.status}`);
    }

    if (check.json) {
      await response.json();
    } else {
      const html = await response.text();
      if (!html.includes(check.text)) {
        throw new Error(`${check.path} did not include expected text: ${check.text}`);
      }
    }
  }

  console.log('Smoke test passed:', checks.map((check) => check.path).join(', '));
} finally {
  server.kill();
}

async function waitForServer(url) {
  const startedAt = Date.now();
  let lastError;

  while (Date.now() - startedAt < 30000) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for ${url}.\n${lastError?.message ?? ''}\n${serverOutput}`);
}
