import { getSuitcaseConfig } from "./suitcase";

export type HealthStatus = "ok" | "warning" | "error";

export function getHealthReport() {
  const suitcase = getSuitcaseConfig();
  const checks = {
    app: true,
    demoMode: suitcase.mode === "demo",
    supabaseConfigured: suitcase.supabaseConfigured,
    stripeConfigured: suitcase.stripeConfigured,
    appUrlConfigured: Boolean(suitcase.appUrl),
    serviceAreaConfigured: Boolean(suitcase.serviceArea),
  };

  const status: HealthStatus = checks.app && checks.appUrlConfigured ? "ok" : "error";

  return {
    status,
    appName: suitcase.appName,
    mode: suitcase.mode,
    serviceArea: suitcase.serviceArea,
    appUrl: suitcase.appUrl,
    checks,
    warnings: [
      suitcase.supabaseConfigured ? null : "Supabase is not configured; using demo mode.",
      suitcase.stripeConfigured ? null : "Stripe is not configured; checkout remains mocked.",
    ].filter(Boolean),
    timestamp: new Date().toISOString(),
  };
}
