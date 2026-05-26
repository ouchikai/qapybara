import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { LoginForm } from "@/features/auth/components/login-form";
import { auth } from "@/lib/auth/server";

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-chart-4/5 p-4">
      <div>
        <LoginForm />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          © 2026 Qapybara. All rights reserved.
        </p>
      </div>
    </main>
  );
}
