"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { QapybaraIcon } from "@/app/components/QapybaraIcon";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { Button } from "@/app/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";

import { type LoginInput, loginSchema } from "../schemas/login.schema";
import { loginWithEmailAndPassword } from "../services/login.service";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);

    const result = await loginWithEmailAndPassword(values);

    if (!result.ok) {
      setSubmitError(result.message ?? "メールアドレスまたはパスワードが正しくありません");
      return;
    }

    router.push("/");
    router.refresh();
  });

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex size-20 items-center justify-center rounded-full border border-border bg-card shadow-lg">
            <QapybaraIcon className="size-12 text-primary" />
          </div>
        </div>
        <h1 className="mb-2 text-3xl font-bold">Qapybara</h1>
        <p className="text-muted-foreground">AI-Powered QA Workbench</p>
      </div>

      <section
        className="rounded-lg border border-border bg-card p-8 shadow-xl"
        aria-labelledby="login-title"
      >
        <h2 id="login-title" className="mb-6 text-xl font-semibold">
          ログイン
        </h2>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>メールアドレス</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail
                        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <Input
                        {...field}
                        type="email"
                        autoComplete="email"
                        placeholder="user@example.com"
                        className="pl-10"
                        disabled={form.formState.isSubmitting}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>パスワード</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock
                        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        disabled={form.formState.isSubmitting}
                      />
                      <button
                        type="button"
                        className="absolute top-1/2 right-2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={() => setShowPassword((current) => !current)}
                        aria-label={showPassword ? "パスワードを非表示" : "パスワードを表示"}
                        disabled={form.formState.isSubmitting}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {submitError ? (
              <Alert variant="destructive" role="alert">
                <AlertCircle className="size-4" aria-hidden="true" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            ) : null}

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ログイン中...
                </>
              ) : (
                "ログイン"
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-6 border-t border-border pt-6">
          <div className="rounded-md bg-muted/50 p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">デモ用ログイン情報：</p>
            <div className="space-y-1 text-xs font-mono">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Admin:</span>
                <span className="truncate">tanaka@example.com / password123</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">QA:</span>
                <span className="truncate">sato@example.com / password123</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
