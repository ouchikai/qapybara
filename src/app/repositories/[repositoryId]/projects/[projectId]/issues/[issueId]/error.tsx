"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

interface IssueDetailErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function IssueDetailError({ error, reset }: IssueDetailErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      className="mx-auto flex max-w-md flex-col items-center gap-4 p-16 text-center"
      role="alert"
    >
      <AlertTriangle className="size-12 text-destructive" aria-hidden="true" />
      <h1 className="text-xl font-semibold">問題が発生しました</h1>
      <p className="text-sm text-muted-foreground">
        Issueの読み込み中にエラーが発生しました。時間をおいて再試行してください。
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        再試行
      </button>
    </main>
  );
}
