import { FolderGit2, LogOut, Menu, Plus, RefreshCcw, Users } from "lucide-react";

import { RepositoriesOverview } from "@/features/repositories/components/repositories-overview";

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-muted/20">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1400px] border-x bg-background">
        <aside className="hidden w-60 border-r bg-background md:flex md:flex-col">
          <div className="flex items-center gap-2 border-b px-5 py-4">
            <FolderGit2 className="size-5 text-muted-foreground" />
            <p className="text-3xl font-semibold tracking-tight">Qapybara</p>
          </div>

          <nav className="space-y-2 p-3">
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
            >
              <FolderGit2 className="size-4" />
              Repositories
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              <Users className="size-4" />
              Users
            </button>
          </nav>

          <div className="mt-auto border-t p-4">
            <div className="mb-3">
              <p className="text-sm font-medium">田中太郎</p>
              <p className="text-xs text-muted-foreground">admin</p>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 text-sm text-destructive hover:opacity-90"
            >
              <LogOut className="size-4" />
              ログアウト
            </button>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="border-b px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2 md:hidden">
                  <Menu className="size-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">Qapybara</p>
                </div>
                <h1 className="text-3xl font-semibold tracking-tight">Repositories</h1>
                <p className="text-sm text-muted-foreground">GitHub同期済みリポジトリー一覧</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  <RefreshCcw className="size-4" />
                  Sync All
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="size-4" />
                  Add Repository
                </button>
              </div>
            </div>
          </header>

          <div className="p-4 sm:p-6">
            <RepositoriesOverview />
          </div>
        </section>
      </div>
    </main>
  );
}
