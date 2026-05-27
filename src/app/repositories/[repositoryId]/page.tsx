import type { Route } from "next";
import { redirect } from "next/navigation";

interface RepositoryDetailPageProps {
  params: Promise<{ repositoryId: string }>;
}

export default async function RepositoryDetailPage({ params }: RepositoryDetailPageProps) {
  const { repositoryId } = await params;

  redirect(`/repositories/${repositoryId}/projects` as Route);
}
