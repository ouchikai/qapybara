export default function Loading() {
  return (
    <div
      className="flex min-h-dvh flex-col bg-background"
      role="status"
      aria-label="Issueを読み込み中"
      aria-busy="true"
    >
      <header className="border-b border-border bg-card px-4 py-4 sm:px-6">
        <div className="mb-3 h-4 w-72 animate-pulse rounded bg-muted" />
        <div className="flex items-center justify-between gap-4">
          <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
          <div className="hidden gap-2 sm:flex">
            <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
            <div className="h-9 w-44 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="h-40 animate-pulse rounded-lg bg-muted" />
          <div className="h-32 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="h-80 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}
