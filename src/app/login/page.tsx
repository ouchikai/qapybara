import type { Route } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { LoginForm } from "@/features/auth/components/login-form";
import { getLoginReasonMessage } from "@/features/auth/lib/login-redirect";
import { sanitizeRedirectTarget } from "@/features/auth/lib/safe-redirect";
import { auth } from "@/lib/auth/server";

interface LoginPageProps {
  searchParams: Promise<{ redirectTo?: string; reason?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirectTo, reason } = await searchParams;
  const safeRedirectTarget = sanitizeRedirectTarget(redirectTo);
  const loginReasonMessage = getLoginReasonMessage(reason);
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    redirect(safeRedirectTarget as Route);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-chart-4/5 p-4">
      <div>
        <LoginForm redirectTo={safeRedirectTarget} reasonMessage={loginReasonMessage} />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          © 2026 Qapybara. All rights reserved.
        </p>
      </div>
    </main>
  );
}
