export type DeploymentMode = "local" | "preview" | "production";

export type RuntimeConfig = {
  deploymentMode: DeploymentMode;
  supabaseReady: boolean;
  stripeReady: boolean;
  authReady: boolean;
  demoMode: boolean;
  missingEnvVars: string[];
  blockers: string[];
  warnings: string[];
  status: "ok" | "warning" | "error";
};

function hasValue(value?: string) {
  return Boolean(value && value.trim().length > 0 && !value.includes("replace_me") && !value.includes("your-project"));
}

export function getRuntimeConfig(): RuntimeConfig {
  const missingEnvVars: string[] = [];

  if (!hasValue(process.env.NEXT_PUBLIC_SUPABASE_URL)) missingEnvVars.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!hasValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) missingEnvVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!hasValue(process.env.SUPABASE_SERVICE_ROLE_KEY)) missingEnvVars.push("SUPABASE_SERVICE_ROLE_KEY");

  if (!hasValue(process.env.STRIPE_SECRET_KEY)) missingEnvVars.push("STRIPE_SECRET_KEY");
  if (!hasValue(process.env.STRIPE_PUBLIC_KEY) && !hasValue(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY)) {
    missingEnvVars.push("STRIPE_PUBLIC_KEY or NEXT_PUBLIC_STRIPE_PUBLIC_KEY");
  }
  if (!hasValue(process.env.STRIPE_WEBHOOK_SECRET)) missingEnvVars.push("STRIPE_WEBHOOK_SECRET");

  if (!hasValue(process.env.FC_ACCESS_CODE)) missingEnvVars.push("FC_ACCESS_CODE");
  if (!hasValue(process.env.DRIVER_ACCESS_CODE)) missingEnvVars.push("DRIVER_ACCESS_CODE");

  const supabaseReady = hasValue(process.env.NEXT_PUBLIC_SUPABASE_URL) && hasValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) && hasValue(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const stripeReady = hasValue(process.env.STRIPE_SECRET_KEY) && (hasValue(process.env.STRIPE_PUBLIC_KEY) || hasValue(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY)) && hasValue(process.env.STRIPE_WEBHOOK_SECRET);
  const authReady = hasValue(process.env.FC_ACCESS_CODE) && hasValue(process.env.DRIVER_ACCESS_CODE);
  const demoMode = !supabaseReady;

  const deploymentMode: DeploymentMode = process.env.VERCEL_ENV === "production"
    ? "production"
    : process.env.VERCEL_ENV === "preview"
      ? "preview"
      : "local";

  const blockers: string[] = [];
  const warnings: string[] = [];

  if (deploymentMode === "production" && !supabaseReady) {
    blockers.push("Production pilot is blocked until Supabase is configured.");
  }

  if (deploymentMode === "production" && !stripeReady) {
    blockers.push("Production checkout is not ready until Stripe is configured.");
  }

  if (!authReady) {
    warnings.push("Pilot passcodes are not fully configured; demo access remains open.");
  }

  if (demoMode) {
    warnings.push("Supabase is unavailable, so the pilot is running in demo fallback mode.");
  }

  const status: RuntimeConfig["status"] = blockers.length > 0 ? "error" : warnings.length > 0 ? "warning" : "ok";

  return {
    deploymentMode,
    supabaseReady,
    stripeReady,
    authReady,
    demoMode,
    missingEnvVars,
    blockers,
    warnings,
    status,
  };
}
