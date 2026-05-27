import { Bug, FolderKanban, GitBranch, Settings } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { Badge } from "@/app/components/ui/badge";
import type { RepositorySummaryDto } from "@/features/repositories/schemas/repository-summary.schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

interface RepositoriesOverviewListProps {
  repositories: RepositorySummaryDto[];
}

const repositoryMetaBySlug: Record<
  string,
  { description: string; organization: string; lastSync: string; status?: "synced" | "attention" }
> = {
  "finance-portal": {
    description: "金融ポータルのフロントエンド",
    organization: "acme-corp",
    lastSync: "2026-05-22 10:30",
    status: "synced",
  },
  "payment-service": {
    description: "決済サービスのバックエンドAPI",
    organization: "acme-corp",
    lastSync: "2026-05-22 09:15",
    status: "synced",
  },
  "user-management": {
    description: "ユーザー管理・認証サービス",
    organization: "acme-corp",
    lastSync: "2026-05-21 16:45",
    status: "attention",
  },
};

function getStatusByRepository(repository: RepositorySummaryDto): "synced" | "attention" {
  const mappedStatus = repositoryMetaBySlug[repository.slug]?.status;
  if (mappedStatus) {
    return mappedStatus;
  }

  return repository.openIssues > 10 ? "attention" : "synced";
}

export function RepositoriesOverviewList({ repositories }: RepositoriesOverviewListProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2" aria-label="repositories-overview">
      {repositories.map((repository) => {
        const status = getStatusByRepository(repository);

        return (
          <Card
            key={repository.id}
            className="border-border/70 transition-[border-color,box-shadow] hover:border-border hover:shadow-sm"
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-1 inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <GitBranch className="size-5" />
                  </div>

                  <div className="min-w-0">
                    <CardTitle className="text-2xl font-semibold leading-tight tracking-tight">
                      <Link
                        href={`/repositories/${repository.id}/projects` as Route}
                        className="block truncate rounded-sm underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {repository.name}
                      </Link>
                    </CardTitle>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {repositoryMetaBySlug[repository.slug]?.organization ?? "acme-corp"}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Badge
                    variant={status === "synced" ? "secondary" : "outline"}
                    className={
                      status === "synced"
                        ? "text-xs"
                        : "border-chart-4/50 bg-chart-4/10 text-chart-3 text-xs"
                    }
                  >
                    {status === "synced" ? "Synced" : "Attention"}
                  </Badge>

                  <button
                    type="button"
                    aria-label={`Open settings for ${repository.name}`}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Settings className="size-4" />
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-0 text-sm">
              <p className="line-clamp-2 min-h-[3rem] text-base leading-relaxed text-muted-foreground">
                {repositoryMetaBySlug[repository.slug]?.description ?? "QA automation workspace"}
              </p>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <div className="inline-flex min-w-0 items-center gap-1.5">
                  <FolderKanban className="size-4 shrink-0" />
                  <span className="truncate">{repository.activeProjects} projects</span>
                </div>
                <div className="inline-flex min-w-0 items-center gap-1.5">
                  <Bug className="size-4 shrink-0" />
                  <span className="truncate">{repository.openIssues} issues</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t pt-3 text-sm text-muted-foreground">
                <p className="truncate">
                  Last sync: {repositoryMetaBySlug[repository.slug]?.lastSync ?? "2026-05-20 12:00"}
                </p>
                <Badge variant="outline" className="text-xs">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
