"use client";

import { Loader2 } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";

import { getRiskBadgeClassName } from "@/features/issues/lib/risk";
import type { TestCaseSuggestion } from "@/features/issues/types/issue-detail";

interface TestCaseSuggestionsSectionProps {
  suggestions: TestCaseSuggestion[];
  testCasesPath: string;
}

export function TestCaseSuggestionsSection({
  suggestions,
  testCasesPath,
}: TestCaseSuggestionsSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleOpenEditor = useCallback(() => {
    // 生成したテストケース候補のIDを searchParams で Test Case Editor に引き渡す。
    const ids = suggestions.map((suggestion) => suggestion.id).join(",");
    const target = `${testCasesPath}?suggestions=${encodeURIComponent(ids)}` as Route;
    startTransition(() => {
      router.push(target);
    });
  }, [router, suggestions, testCasesPath]);

  return (
    <section
      aria-labelledby="suggestions-heading"
      className="rounded-lg border border-border bg-card p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 id="suggestions-heading" className="text-base font-semibold">
          AI Generated Test Cases
        </h2>
        <span className="text-sm text-muted-foreground">{suggestions.length} cases</span>
      </div>

      <ul className="mb-4 space-y-2">
        {suggestions.map((suggestion) => (
          <li key={suggestion.id} className="rounded-md border border-border p-3">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className={`rounded border px-2 py-1 text-xs font-semibold ${getRiskBadgeClassName(suggestion.risk)}`}
                aria-label={`リスクレベル ${suggestion.risk}`}
              >
                {suggestion.risk}
              </span>
              <span className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
                {suggestion.category}
              </span>
            </div>
            <h3 className="text-sm font-medium">{suggestion.title}</h3>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={handleOpenEditor}
        disabled={isPending || suggestions.length === 0}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        Open in Test Case Editor
      </button>
    </section>
  );
}
