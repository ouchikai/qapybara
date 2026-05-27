"use client";

import { AlertCircle } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";

interface RepositoryProjectsErrorProps {
  error: Error;
  reset: () => void;
}

export default function RepositoryProjectsError({ error, reset }: RepositoryProjectsErrorProps) {
  return (
    <main className="min-h-dvh bg-muted/20 p-4 sm:p-8">
      <div className="mx-auto w-full max-w-3xl">
        <Card className="border-destructive/30">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="size-5" />
              <h1 className="text-xl font-semibold">Projects</h1>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-destructive">
              {error.message || "Failed to load this projects screen"}
            </p>
            <Button type="button" onClick={reset}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
