import { Bug, FolderKanban, GitBranch, Settings } from "lucide-react";
import Link from "next/link";

import type { RepositorySummaryDto } from "@/features/repositories/schemas/repository-summary.schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

interface RepositoriesOverviewListProps {
  repositories: RepositorySummaryDto[];
}

const repositoryMetaBySlug: Record<
  string,
  { description: string; organization: string; lastSync: string }
> = {
  "finance-portal": {
    description: "金融ポータルのフロントエンド",
    organization: "acme-corp",
    lastSync: "2026-05-22 10:30",
  },
  "payment-service": {
    description: "決済サービスのバックエンドAPI",
    organization: "acme-corp",
    lastSync: "2026-05-22 09:15",
  },
  "user-management": {
    description: "ユーザー管理・認証サービス",
    organization: "acme-corp",
    lastSync: "2026-05-21 16:45",
  },
};

export function RepositoriesOverviewList({ repositories }: RepositoriesOverviewListProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2" aria-label="repositories-overview">
      {repositories.map((repository) => (
        <Card key={repository.id} className="border-border/70">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="text-2xl font-semibold tracking-tight">
                  <Link href={`/repositories/${repository.id}`} className="hover:underline">
                    {repository.name}
                  </Link>
                </CardTitle>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {repositoryMetaBySlug[repository.slug]?.organization ?? "acme-corp"}
                </p>
              </div>

              <button
                type="button"
                aria-label={`Open settings for ${repository.name}`}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted"
              >
                <Settings className="size-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-0 text-sm">
            <p className="text-base text-muted-foreground">
              {repositoryMetaBySlug[repository.slug]?.description ?? "QA automation workspace"}
            </p>

            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="inline-flex items-center gap-1.5">
                <FolderKanban className="size-4" />
                <span>{repository.activeProjects} projects</span>
              </div>
              <div className="inline-flex items-center gap-1.5">
                <GitBranch className="size-4" />
                <span>{Math.max(repository.activeProjects - 1, 0)} branches</span>
              </div>
              <div className="inline-flex items-center gap-1.5">
                <Bug className="size-4" />
                <span>{repository.openIssues} issues</span>
              </div>
            </div>

            <div className="border-t pt-3 text-muted-foreground">
              Last sync: {repositoryMetaBySlug[repository.slug]?.lastSync ?? "2026-05-20 12:00"}
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
