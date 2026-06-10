import { getRuntimeConfig } from "./runtime-config";

export type SuitcaseMode = "demo" | "local" | "hosted";

export type SuitcaseConfig = {
  appName: string;
  mode: SuitcaseMode;
  serviceArea: string;
  driverName: string;
  appUrl: string;
  demoTrackingPath: string;
  supabaseConfigured: boolean;
  stripeConfigured: boolean;
  deploymentMode: string;
  authReady: boolean;
  missingEnvVars: string[];
  blockers: string[];
};

export function getSuitcaseConfig(): SuitcaseConfig {
  const config = getRuntimeConfig();

  return {
    appName: "Doorin5",
    mode: config.demoMode ? "demo" : "hosted",
    serviceArea: process.env.DEMO_SERVICE_AREA ?? "Tunbridge Wells",
    driverName: process.env.DEMO_DRIVER_NAME ?? "Doorin5 Driver",
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    demoTrackingPath: process.env.NEXT_PUBLIC_DEMO_TRACKING_PATH ?? "/track-demo",
    supabaseConfigured: config.supabaseReady,
    stripeConfigured: config.stripeReady,
    deploymentMode: config.deploymentMode,
    authReady: config.authReady,
    missingEnvVars: config.missingEnvVars,
    blockers: config.blockers,
  };
}
