import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { prisma } from "@/server/db/prisma";

import { hashPassword, verifyPassword } from "./password";

const fallbackBaseUrl = "http://localhost:3000";
const developmentLoopbackBaseUrl = "http://127.0.0.1:3000";

function getRequiredEnv(name: "BETTER_AUTH_SECRET"): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} must be set`);
  }

  return value;
}

const baseURL = process.env.BETTER_AUTH_URL ?? fallbackBaseUrl;
const secret = getRequiredEnv("BETTER_AUTH_SECRET");
const trustedOrigins = [
  process.env.BETTER_AUTH_URL,
  process.env.NODE_ENV === "development" ? fallbackBaseUrl : undefined,
  process.env.NODE_ENV === "development" ? developmentLoopbackBaseUrl : undefined,
].filter((origin): origin is string => Boolean(origin));

export const auth = betterAuth({
  appName: "Qapybara",
  basePath: "/api/auth",
  baseURL,
  secret,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    modelName: "User",
    fields: {
      name: "displayName",
    },
  },
  session: {
    modelName: "Session",
  },
  account: {
    modelName: "Account",
  },
  verification: {
    modelName: "Verification",
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 8,
    password: {
      hash: hashPassword,
      verify: verifyPassword,
    },
  },
  trustedOrigins,
  advanced: {
    database: {
      generateId: false,
    },
  },
});
