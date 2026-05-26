"use client";

import type { Route } from "next";
import Link from "next/link";

import { useProjectsQuery } from "@/features/projects/hooks/use-projects-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

interface ProjectListProps {
  repositoryId: string;
}

export function ProjectList({ repositoryId }: ProjectListProps) {
  const projectsQuery = useProjectsQuery(repositoryId);

  if (projectsQuery.isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-16 animate-pulse rounded-lg bg-muted" />
        <div className="h-16 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (projectsQuery.error) {
    return <p className="text-sm text-destructive">{projectsQuery.error.message}</p>;
  }

  const projects = projectsQuery.data ?? [];

  if (projects.length === 0) {
    return <p className="text-sm text-muted-foreground">No projects available.</p>;
  }

  return (
    <section className="grid gap-3" aria-label="projects-list">
      {projects.map((project) => (
        <Card key={project.id}>
          <CardHeader>
            <CardTitle className="text-lg">{project.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">status: {project.status}</p>
            <p className="text-muted-foreground">open issues: {project.openIssues}</p>
            <Link
              href={`/projects/${project.id}/issues` as Route}
              className="inline-flex rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              View Issues
            </Link>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
