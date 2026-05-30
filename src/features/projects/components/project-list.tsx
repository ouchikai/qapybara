"use client";

import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Bug,
  Calendar,
  Folder,
  Inbox,
  LineChart,
  ListChecks,
  Plus,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";
import { useProjectsQuery } from "@/features/projects/hooks/use-projects-query";
import type { ProjectSummaryDto } from "@/features/projects/schemas/project-summary.schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface ProjectListProps {
  repositoryId: string;
}

interface ProjectCardProps {
  project: ProjectSummaryDto;
  repositoryId: string;
}

interface StatTileProps {
  value: React.ReactNode;
  label: string;
  icon?: React.ReactNode;
  variant: "plain" | "teal" | "red";
  href?: Route;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatDueDate(value: string | null): string {
  if (!value) return "未設定";
  return new Date(value).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function getStatusLabel(status: ProjectSummaryDto["status"]): string {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "ARCHIVED":
      return "Archived";
    case "PLANNING":
      return "Planning";
  }
}

/**
 * ステータスバッジのクラス名を返す。
 * 仕様書の色定義:
 *   active   → bg-chart-2/10 text-chart-2  border-chart-2/20
 *   planning → bg-chart-4/10 text-chart-4  border-chart-4/20
 *   archived → bg-muted      text-muted-foreground border-border
 */
function getStatusBadgeClassName(status: ProjectSummaryDto["status"]): string {
  switch (status) {
    case "ACTIVE":
      return "bg-chart-2/10 text-chart-2 border-chart-2/20";
    case "PLANNING":
      return "bg-chart-4/10 text-chart-4 border-chart-4/20";
    case "ARCHIVED":
      return "bg-muted text-muted-foreground border-border";
  }
}

function createRoute(repositoryId: string, projectId: string, suffix: string): Route {
  return `/repositories/${repositoryId}/projects/${projectId}/${suffix}` as Route;
}

// ─────────────────────────────────────────────
// StatTile
// ─────────────────────────────────────────────

/**
 * プロジェクトカード内の統計タイル。
 * href が指定された場合はクリッカブルなリンクになる。
 */
function StatTile({ value, label, icon, variant, href }: StatTileProps) {
  const bgClass =
    variant === "teal"
      ? "bg-chart-2/10 hover:bg-chart-2/15"
      : variant === "red"
        ? "bg-destructive/10 hover:bg-destructive/15"
        : "bg-muted/55";

  const textClass =
    variant === "teal"
      ? "text-chart-2"
      : variant === "red"
        ? "text-destructive"
        : "text-foreground";

  const labelClass =
    variant === "teal"
      ? "text-chart-2 font-medium"
      : variant === "red"
        ? "text-destructive font-medium"
        : "text-muted-foreground";

  const content = (
    <>
      <p className={`text-3xl font-bold leading-none ${textClass}`} aria-hidden="false">
        {value}
      </p>
      <div className={`inline-flex items-center gap-1.5 text-sm ${labelClass}`}>
        {icon}
        <span>{label}</span>
        {href && <ArrowRight className="size-4 shrink-0" aria-hidden="true" />}
      </div>
    </>
  );

  const baseClass = `space-y-1.5 rounded-xl p-4 transition-colors ${bgClass}`;

  if (href) {
    return (
      <Link href={href} className={`${baseClass} block`}>
        {content}
      </Link>
    );
  }

  return <div className={baseClass}>{content}</div>;
}

// ─────────────────────────────────────────────
// ProjectCard
// ─────────────────────────────────────────────

function ProjectCard({ project, repositoryId }: ProjectCardProps) {
  const issuesRoute = createRoute(repositoryId, project.id, "issues");
  const testCasesRoute = createRoute(repositoryId, project.id, "test-cases");
  const bugsRoute = createRoute(repositoryId, project.id, "bugs");
  const dashboardRoute = createRoute(repositoryId, project.id, "dashboard");

  // description がない場合は slug をフォールバックとして表示
  const displayDescription = project.description ?? project.slug;

  return (
    <Card
      className="border-border/70 transition-[border-color,box-shadow] hover:border-border hover:shadow-md"
      aria-label={`プロジェクト: ${project.name}`}
    >
      {/* ── カードヘッダー ── */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            {/*
              フォルダアイコン: 仕様書に従い chart-4 色（黄色系）。
              bg-chart-4/10 = CSS変数 --chart-4 の 10% 透過背景
            */}
            <div
              className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-chart-4/10 text-chart-4"
              aria-hidden="true"
            >
              <Folder className="size-5" />
            </div>

            <div className="min-w-0">
              <CardTitle className="text-base font-semibold leading-tight tracking-tight">
                <Link
                  href={issuesRoute}
                  className="truncate rounded-sm underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {project.name}
                </Link>
              </CardTitle>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {displayDescription}
              </p>
            </div>
          </div>

          {/* ステータスバッジ */}
          <Badge
            variant="outline"
            className={`shrink-0 text-xs ${getStatusBadgeClassName(project.status)}`}
          >
            {getStatusLabel(project.status)}
          </Badge>
        </div>
      </CardHeader>

      {/* ── カードコンテンツ ── */}
      <CardContent className="space-y-3 pt-0">
        {/* 統計グリッド 2×2 */}
        <div className="grid grid-cols-2 gap-3" role="group" aria-label="プロジェクト統計">
          {/* Issues（プレーン） */}
          <StatTile
            value={project.openIssues}
            label="Issues"
            icon={<ListChecks className="size-4 shrink-0" aria-hidden="true" />}
            variant="plain"
          />

          {/* Test Cases（緑、クリッカブル） */}
          <StatTile
            value={project.testCases}
            label="Test Cases"
            variant="teal"
            href={testCasesRoute}
          />

          {/* Pass Rate（プレーン） */}
          <StatTile
            value={`${project.passRate}%`}
            label="Pass Rate"
            icon={<LineChart className="size-4 shrink-0" aria-hidden="true" />}
            variant="plain"
          />

          {/* Bugs（赤、クリッカブル） */}
          <StatTile
            value={project.openBugs}
            label="Bugs"
            icon={<Bug className="size-4 shrink-0" aria-hidden="true" />}
            variant="red"
            href={bugsRoute}
          />
        </div>

        {/* View Dashboard ボタン: bg-primary/10 + border（仕様書準拠） */}
        <Button
          asChild
          variant="outline"
          className="h-10 w-full justify-center gap-2 rounded-lg border-border bg-primary/10 text-sm hover:bg-primary/15"
        >
          <Link href={dashboardRoute}>
            <BarChart3 className="size-4 shrink-0" aria-hidden="true" />
            View Dashboard
          </Link>
        </Button>

        {/* Due date */}
        <div
          className="flex items-center gap-1.5 border-t pt-3 text-sm text-muted-foreground"
          aria-label={`期限: ${formatDueDate(project.dueDate)}`}
        >
          <Calendar className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">Due: {formatDueDate(project.dueDate)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────

function ProjectListSkeleton() {
  return (
    <section
      className="grid gap-5 sm:grid-cols-2"
      aria-label="プロジェクト一覧を読み込み中"
      aria-busy="true"
    >
      {(["a", "b", "c"] as const).map((key) => (
        <Card key={`skeleton-${key}`} className="border-border/70">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Skeleton className="size-10 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
              <Skeleton className="h-6 w-16 rounded-md" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-4 w-36" />
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

// ─────────────────────────────────────────────
// Error state
// ─────────────────────────────────────────────

function ProjectListError({ message }: { message: string }) {
  return (
    <Card className="border-destructive/30" role="alert" aria-live="assertive">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="size-4 text-destructive" aria-hidden="true" />
          <h2 className="text-lg font-semibold">プロジェクトの取得に失敗しました</h2>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-destructive">{message}</p>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────

function ProjectListEmpty({ repositoryId }: { repositoryId: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Inbox className="size-4 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-lg font-semibold">プロジェクトがありません</h2>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          このリポジトリにはまだプロジェクトが登録されていません。
        </p>
        <Button asChild size="sm">
          <Link href={`/repositories/${repositoryId}/projects/new` as Route}>
            <Plus className="size-4" aria-hidden="true" />
            最初のプロジェクトを作成
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// ProjectList（メインエクスポート）
// ─────────────────────────────────────────────

export function ProjectList({ repositoryId }: ProjectListProps) {
  const projectsQuery = useProjectsQuery(repositoryId);

  if (projectsQuery.isLoading) {
    return <ProjectListSkeleton />;
  }

  if (projectsQuery.error) {
    return (
      <ProjectListError
        message={projectsQuery.error.message || "Failed to load projects"}
      />
    );
  }

  const projects = projectsQuery.data ?? [];

  if (projects.length === 0) {
    return <ProjectListEmpty repositoryId={repositoryId} />;
  }

  return (
    <section
      className="grid gap-5 sm:grid-cols-2"
      aria-label="プロジェクト一覧"
    >
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          repositoryId={repositoryId}
        />
      ))}
    </section>
  );
}
