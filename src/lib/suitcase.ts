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
};

export function getSuitcaseConfig(): SuitcaseConfig {
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project") &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const stripeConfigured = Boolean(
    process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes("replace_me")
  );

  const mode: SuitcaseMode = supabaseConfigured ? "hosted" : "demo";

  return {
    appName: "Doorin5",
    mode,
    serviceArea: process.env.DEMO_SERVICE_AREA ?? "Tunbridge Wells",
    driverName: process.env.DEMO_DRIVER_NAME ?? "Doorin5 Driver",
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    demoTrackingPath: process.env.NEXT_PUBLIC_DEMO_TRACKING_PATH ?? "/track-demo",
    supabaseConfigured,
    stripeConfigured,
  };
}
