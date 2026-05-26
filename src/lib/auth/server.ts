import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { prisma } from "@/server/db/prisma";

import { hashPassword, verifyPassword } from "./password";

const fallbackBaseUrl = "http://localhost:3000";
const fallbackSecret = "dev-only-better-auth-secret-change-me-1234567890";

const baseURL = process.env.BETTER_AUTH_URL ?? fallbackBaseUrl;
const secret = process.env.BETTER_AUTH_SECRET ?? fallbackSecret;

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
  trustedOrigins: [fallbackBaseUrl, process.env.BETTER_AUTH_URL].filter(
    (origin): origin is string => Boolean(origin),
  ),
  advanced: {
    database: {
      generateId: false,
    },
  },
});
