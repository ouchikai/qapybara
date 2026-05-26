"use client";

import { useRepositoriesQuery } from "@/features/repositories/hooks/use-repositories-query";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";

import { RepositoriesOverviewList } from "./repositories-overview-list";

function RepositoriesOverviewSkeleton() {
  const skeletonKeys = ["left", "right"];

  return (
    <section className="grid gap-4 sm:grid-cols-2" aria-label="repositories-overview-skeleton">
      {skeletonKeys.map((key) => (
        <Card key={`repo-skeleton-${key}`}>
          <CardHeader>
            <div className="h-5 w-40 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-16 animate-pulse rounded bg-muted" />
            <div className="h-10 w-36 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

export function RepositoriesOverview() {
  const repositoriesQuery = useRepositoriesQuery();

  if (repositoriesQuery.isLoading) {
    return <RepositoriesOverviewSkeleton />;
  }

  if (repositoriesQuery.error) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Repositories</h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            {repositoriesQuery.error.message || "Failed to load repositories"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const repositories = repositoriesQuery.data ?? [];

  if (repositories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Repositories</h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No repositories yet.</p>
        </CardContent>
      </Card>
    );
  }

  return <RepositoriesOverviewList repositories={repositories} />;
}
