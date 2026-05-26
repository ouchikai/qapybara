"use client";

import { AlertCircle, Inbox } from "lucide-react";

import { Badge } from "@/app/components/ui/badge";
import { Skeleton } from "@/app/components/ui/skeleton";
import { useRepositoriesQuery } from "@/features/repositories/hooks/use-repositories-query";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";

import { RepositoriesOverviewList } from "./repositories-overview-list";

function RepositoriesOverviewSkeleton() {
  const skeletonKeys = ["left", "right", "bottom"];

  return (
    <section className="grid gap-4 sm:grid-cols-2" aria-label="repositories-overview-skeleton">
      {skeletonKeys.map((key) => (
        <Card key={`repo-skeleton-${key}`} className="border-border/70">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Skeleton className="size-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-7 w-44" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
              <Skeleton className="size-8" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <Skeleton className="h-6 w-3/4" />
            <div className="flex gap-5">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="flex items-center justify-between border-t pt-3">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-6 w-16" />
            </div>
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
      <Card className="border-destructive/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-destructive" />
            <h2 className="text-lg font-semibold">Repositories</h2>
          </div>
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
          <div className="flex items-center gap-2">
            <Inbox className="size-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Repositories</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">No repositories yet.</p>
          <Badge variant="outline" className="text-muted-foreground">
            Sync required
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return <RepositoriesOverviewList repositories={repositories} />;
}
