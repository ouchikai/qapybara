import Link from "next/link";

import { ProjectList } from "@/features/projects/components/project-list";

interface RepositoryDetailPageProps {
  params: Promise<{ repositoryId: string }>;
}

export default async function RepositoryDetailPage({ params }: RepositoryDetailPageProps) {
  const { repositoryId } = await params;

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <Link href="/" className="text-sm text-primary underline-offset-4 hover:underline">
          Back to Home
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Repository Projects</h1>
        <p className="text-sm text-muted-foreground">repositoryId: {repositoryId}</p>
      </header>
      <ProjectList repositoryId={repositoryId} />
    </main>
  );
}
