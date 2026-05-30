import { RefreshCw } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/app/components/ui/breadcrumb";
import { Button } from "@/app/components/ui/button";
import { IssueList } from "@/features/issues/components/issue-list";
import { RepositoriesShell } from "@/features/repositories/components/repositories-shell";

interface RepositoryProjectIssuesPageProps {
  params: Promise<{ repositoryId: string; projectId: string }>;
}

export default async function RepositoryProjectIssuesPage({
  params,
}: RepositoryProjectIssuesPageProps) {
  const { repositoryId, projectId } = await params;

  return (
    <RepositoriesShell
      title="Issues"
      description="GitHub Issue → AI影響分析 → テストケース生成"
      activeItem="repositories"
      breadcrumb={
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={"/repositories" as Route}>Repositories</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/repositories/${repositoryId}/projects` as Route}>
                  {repositoryId}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{projectId}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      }
      actions={
        <Button type="button" size="sm" className="gap-2">
          <RefreshCw className="size-4" aria-hidden="true" />
          Sync from GitHub
        </Button>
      }
    >
      <IssueList repositoryId={repositoryId} projectId={projectId} />
    </RepositoriesShell>
  );
}
