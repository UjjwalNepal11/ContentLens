const envSchema = {

  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  DATABASE_URL: process.env.DATABASE_URL,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,

  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
} as const;

type ServerEnv = {
  GEMINI_API_KEY: string;
  DATABASE_URL: string;
  CLERK_SECRET_KEY: string;
};

type PublicEnv = {
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
};

export function validateServerEnv(): ServerEnv {
  const missingVars: string[] = [];

  if (!envSchema.GEMINI_API_KEY) {
    missingVars.push('GEMINI_API_KEY');
  }
  if (!envSchema.DATABASE_URL) {
    missingVars.push('DATABASE_URL');
  }
  if (!envSchema.CLERK_SECRET_KEY) {
    missingVars.push('CLERK_SECRET_KEY');
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      `Please add these to your .env.local file.`
    );
  }

  return envSchema as ServerEnv;
}

export function getPublicEnv(): PublicEnv {
  return {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: envSchema.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
  };
}

export function getEnv(key: keyof ServerEnv): string | undefined {
  return envSchema[key];
}

export function getGeminiApiKey(): string {
  if (!envSchema.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set. Please add it to your .env.local file.');
  }
  return envSchema.GEMINI_API_KEY;
}

export function getClerkPublishableKey(): string {
  return envSchema.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
}

export function getClerkSecretKey(): string {
  if (!envSchema.CLERK_SECRET_KEY) {
    throw new Error('CLERK_SECRET_KEY is not set. Please add it to your .env.local file.');
  }
  return envSchema.CLERK_SECRET_KEY;
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}
