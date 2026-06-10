import { getRuntimeConfig } from "./runtime-config";

export type HealthStatus = "ok" | "warning" | "error";

export function getHealthReport() {
  const config = getRuntimeConfig();

  return {
    status: config.status,
    deploymentMode: config.deploymentMode,
    demoMode: config.demoMode,
    supabaseReady: config.supabaseReady,
    stripeReady: config.stripeReady,
    authReady: config.authReady,
    missingEnvVars: config.missingEnvVars,
    blockers: config.blockers,
    warnings: config.warnings,
    productionReadiness: config.blockers.length === 0,
    timestamp: new Date().toISOString(),
  };
}
