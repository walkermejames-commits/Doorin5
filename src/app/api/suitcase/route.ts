import { getSuitcaseConfig } from "../../../lib/suitcase";
import { jsonOk } from "../../../lib/http";

export async function GET() {
  const config = getSuitcaseConfig();

  return jsonOk({
    appName: config.appName,
    mode: config.mode,
    deploymentMode: config.deploymentMode,
    supabaseReady: config.supabaseConfigured,
    stripeReady: config.stripeConfigured,
    authReady: config.authReady,
    demoMode: config.mode === "demo",
    missingEnvVars: config.missingEnvVars,
    productionReadinessBlockers: config.blockers,
    warnings: config.blockers.length > 0 ? config.blockers : [],
  });
}
