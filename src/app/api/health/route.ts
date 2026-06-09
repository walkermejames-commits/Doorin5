import { getRuntimeConfig } from "../../../lib/runtime-config";
import { jsonOk } from "../../../lib/http";

export async function GET() {
  const config = getRuntimeConfig();

  return jsonOk({
    deploymentMode: config.deploymentMode,
    supabaseReady: config.supabaseReady,
    stripeReady: config.stripeReady,
    authReady: config.authReady,
    demoMode: config.demoMode,
    missingEnvVars: config.missingEnvVars,
    productionReadinessBlockers: config.blockers,
    status: config.status,
    warnings: config.warnings,
  });
}
