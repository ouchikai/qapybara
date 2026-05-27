"use client";

import {
  AlertCircle,
  ArrowRight,
  Bug,
  Calendar,
  Folder,
  Inbox,
  LineChart,
  ListChecks,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";
import { useProjectsQuery } from "@/features/projects/hooks/use-projects-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

interface ProjectListProps {
  repositoryId: string;
}

function ProjectListSkeleton() {
  return (
    <section className="space-y-4" aria-label="projects-list-skeleton">
      {["first", "second"].map((key) => (
        <Card key={`project-skeleton-${key}`} className="border-border/70">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Skeleton className="size-10 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-44" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-7 w-14 rounded-md" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </div>
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-5 w-40" />
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function formatDueDate(value: string | null) {
  if (!value) {
    return "未設定";
  }

  return new Date(value).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function projectStatusLabel(status: "PLANNING" | "ACTIVE" | "ARCHIVED") {
  if (status === "ACTIVE") {
    return "Active";
  }
  if (status === "ARCHIVED") {
    return "Archived";
  }
  return "Planning";
}

function projectStatusClassName(status: "PLANNING" | "ACTIVE" | "ARCHIVED") {
  if (status === "ACTIVE") {
    return "border-chart-2/40 bg-chart-2/10 text-chart-2";
  }
  if (status === "ARCHIVED") {
    return "border-muted-foreground/30 bg-muted text-muted-foreground";
  }
  return "border-chart-4/50 bg-chart-4/10 text-chart-3";
}

export function ProjectList({ repositoryId }: ProjectListProps) {
  const projectsQuery = useProjectsQuery(repositoryId);

  if (projectsQuery.isLoading) {
    return <ProjectListSkeleton />;
  }

  if (projectsQuery.error) {
    return (
      <Card className="border-destructive/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-destructive" />
            <h2 className="text-lg font-semibold">Projects</h2>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            {projectsQuery.error.message || "Failed to load projects"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const projects = projectsQuery.data ?? [];

  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Inbox className="size-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Projects</h2>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No projects available in this repository.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-4" aria-label="projects-list">
      {projects.map((project) => (
        <Card
          key={project.id}
          className="border-border/70 transition-[border-color,box-shadow] hover:border-border hover:shadow-sm"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="mt-1 inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <Folder className="size-5" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="truncate text-2xl font-semibold leading-tight tracking-tight">
                    {project.name}
                  </CardTitle>
                  <p className="mt-1 truncate text-sm text-muted-foreground">{project.slug}</p>
                </div>
              </div>

              <Badge variant="outline" className={projectStatusClassName(project.status)}>
                {projectStatusLabel(project.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1 rounded-xl bg-muted/55 p-4">
                <p className="text-4xl font-semibold leading-none">{project.openIssues}</p>
                <div className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <ListChecks className="size-4" />
                  <span>Issues</span>
                </div>
              </div>

              <div className="space-y-1 rounded-xl bg-chart-2/10 p-4">
                <p className="text-4xl font-semibold leading-none text-chart-2">
                  {project.testCases}
                </p>
                <div className="inline-flex items-center gap-1.5 text-sm font-medium text-chart-2">
                  <span>Test Cases</span>
                  <ArrowRight className="size-4" />
                </div>
              </div>

              <div className="space-y-1 rounded-xl bg-muted/55 p-4">
                <p className="text-4xl font-semibold leading-none">{project.passRate}%</p>
                <div className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <LineChart className="size-4" />
                  <span>Pass Rate</span>
                </div>
              </div>

              <div className="space-y-1 rounded-xl bg-destructive/10 p-4">
                <p className="text-4xl font-semibold leading-none text-destructive">
                  {project.openBugs}
                </p>
                <div className="inline-flex items-center gap-1.5 text-sm font-medium text-destructive">
                  <Bug className="size-4" />
                  <span>Bugs</span>
                  <ArrowRight className="size-4" />
                </div>
              </div>
            </div>

            <Button
              asChild
              variant="outline"
              className="h-11 w-full justify-center rounded-lg bg-muted/30 text-base hover:bg-muted"
            >
              <Link href={`/projects/${project.id}/issues` as Route}>View Dashboard</Link>
            </Button>

            <div className="flex items-center gap-2 border-t pt-3 text-sm text-muted-foreground">
              <Calendar className="size-4" />
              <span className="truncate">Due: {formatDueDate(project.dueDate)}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
