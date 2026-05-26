import { authClient } from "@/lib/auth/client";

import type { LoginInput } from "../schemas/login.schema";

export interface LoginResult {
  ok: boolean;
  message?: string;
}

export async function loginWithEmailAndPassword(input: LoginInput): Promise<LoginResult> {
  const { error } = await authClient.signIn.email({
    email: input.email,
    password: input.password,
    rememberMe: true,
  });

  if (error) {
    return {
      ok: false,
      message: error.message,
    };
  }

  return { ok: true };
}
