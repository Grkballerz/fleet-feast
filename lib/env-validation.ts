/**
 * Environment Variable Validation
 * Ensures critical environment variables are set in production
 * Prevents deployment with missing security-critical configuration
 */

export class EnvValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnvValidationError";
  }
}

/**
 * Validate production environment variables
 * Throws error if any critical variables are missing in production
 */
export function validateProductionEnv(): void {
  // Only enforce strict validation in production
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const requiredEnvVars = [
    {
      name: "NEXT_PUBLIC_APP_URL",
      description: "Application URL for redirects and webhooks",
      critical: true,
    },
    {
      name: "NEXTAUTH_SECRET",
      description: "NextAuth JWT token signing secret",
      critical: true,
    },
    {
      name: "DATABASE_URL",
      description: "Database connection string",
      critical: true,
    },
    // NOTE: Stripe env vars removed - will be replaced with Helcim configuration
  ];

  const missingVars: string[] = [];
  const warnings: string[] = [];

  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar.name];

    if (!value || value.trim() === "") {
      if (envVar.critical) {
        missingVars.push(`${envVar.name} (${envVar.description})`);
      } else {
        warnings.push(`${envVar.name} (${envVar.description})`);
      }
    }
  }

  // Log warnings (non-blocking)
  if (warnings.length > 0) {
    console.warn(
      "⚠️  WARNING: The following environment variables are recommended but not set:"
    );
    warnings.forEach((warning) => console.warn(`   - ${warning}`));
  }

  // Throw error for critical missing variables (blocking)
  if (missingVars.length > 0) {
    const errorMessage = [
      "❌ CRITICAL: Missing required environment variables in production:",
      ...missingVars.map((v) => `   - ${v}`),
      "",
      "Application cannot start without these variables.",
      "Please configure them in your deployment environment.",
    ].join("\n");

    throw new EnvValidationError(errorMessage);
  }

  console.log("✅ Production environment variables validated successfully");
}

/**
 * Validate development environment variables
 * Provides helpful warnings but does not block startup
 */
export function validateDevelopmentEnv(): void {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const warnings: string[] = [];

  // Check for common development mistakes
  if (!process.env.DATABASE_URL) {
    warnings.push("DATABASE_URL - Database connection may fail");
  }

  if (!process.env.NEXTAUTH_SECRET) {
    warnings.push("NEXTAUTH_SECRET - Using insecure default secret");
  }

  // NOTE: Stripe validation removed - will be replaced with Helcim validation

  if (warnings.length > 0) {
    console.warn("\n⚠️  Development Environment Warnings:");
    warnings.forEach((warning) => console.warn(`   - ${warning}`));
    console.warn("");
  }
}

/**
 * Run all environment validations
 * Call this at application startup (e.g., in middleware.ts or layout)
 */
export function validateEnvironment(): void {
  if (process.env.NODE_ENV === "production") {
    validateProductionEnv();
  } else {
    validateDevelopmentEnv();
  }
}
