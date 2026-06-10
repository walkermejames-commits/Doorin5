import assert from 'node:assert/strict';
import { getRuntimeConfig } from '../src/lib/runtime-config';

const config = getRuntimeConfig();

assert.ok(typeof config.deploymentMode === 'string');
assert.ok(typeof config.supabaseReady === 'boolean');
assert.ok(typeof config.stripeReady === 'boolean');
assert.ok(typeof config.authReady === 'boolean');
assert.ok(Array.isArray(config.missingEnvVars));
assert.ok(Array.isArray(config.blockers));
assert.ok(Array.isArray(config.warnings));

console.log('Pilot-ready smoke test passed:', {
  deploymentMode: config.deploymentMode,
  supabaseReady: config.supabaseReady,
  stripeReady: config.stripeReady,
  authReady: config.authReady,
  missingEnvVars: config.missingEnvVars,
  blockers: config.blockers,
  warnings: config.warnings,
});
