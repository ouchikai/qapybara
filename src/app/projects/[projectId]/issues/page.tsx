import Link from "next/link";

import { IssueList } from "@/features/issues/components/issue-list";

interface ProjectIssuesPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectIssuesPage({ params }: ProjectIssuesPageProps) {
  const { projectId } = await params;

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <Link href="/" className="text-sm text-primary underline-offset-4 hover:underline">
          Back to Home
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Project Issues</h1>
        <p className="text-sm text-muted-foreground">projectId: {projectId}</p>
      </header>
      <IssueList projectId={projectId} />
    </main>
  );
}
