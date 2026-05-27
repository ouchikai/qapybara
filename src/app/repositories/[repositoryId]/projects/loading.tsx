import { Skeleton } from "@/app/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";

export default function RepositoryProjectsLoading() {
  return (
    <main className="min-h-dvh bg-muted/20 p-4 sm:p-8">
      <div className="mx-auto w-full max-w-5xl space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-52" />
        <Skeleton className="h-7 w-80" />

        {["one", "two"].map((key) => (
          <Card key={`projects-route-loading-${key}`} className="border-border/70">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Skeleton className="size-10 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
                <Skeleton className="h-7 w-16 rounded-md" />
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
              <Skeleton className="h-5 w-48" />
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
