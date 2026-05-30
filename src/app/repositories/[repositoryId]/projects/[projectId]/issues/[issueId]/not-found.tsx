import { FileQuestion } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

export default function IssueNotFound() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center gap-4 p-16 text-center">
      <FileQuestion className="size-12 text-muted-foreground" aria-hidden="true" />
      <h1 className="text-xl font-semibold">Issueが見つかりません</h1>
      <p className="text-sm text-muted-foreground">
        指定されたIssueは存在しないか、削除された可能性があります。
      </p>
      <Link
        href={"/repositories" as Route}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Repositoriesへ戻る
      </Link>
    </main>
  );
}
