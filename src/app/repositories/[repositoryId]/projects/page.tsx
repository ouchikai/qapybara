import { Plus } from "lucide-react";
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
import { ProjectList } from "@/features/projects/components/project-list";
import { RepositoriesShell } from "@/features/repositories/components/repositories-shell";

interface RepositoryProjectsPageProps {
  params: Promise<{ repositoryId: string }>;
}

export default async function RepositoryProjectsPage({ params }: RepositoryProjectsPageProps) {
  const { repositoryId } = await params;

  return (
    <RepositoriesShell
      title="Projects"
      description="プロジェクト（リリース・施策）単位でIssueを管理"
      activeItem="repositories"
      breadcrumb={
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/repositories">Repositories</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{repositoryId}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      }
      actions={
        <Button type="button" size="sm">
          <Plus className="size-4" />
          New Project
        </Button>
      }
    >
      <ProjectList repositoryId={repositoryId} />
    </RepositoriesShell>
  );
}
