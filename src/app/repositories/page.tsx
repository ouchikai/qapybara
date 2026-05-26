import { LogOut, Menu, Plus, RefreshCcw, Settings2, Users } from "lucide-react";
import Link from "next/link";

import { QapybaraIcon } from "@/app/components/QapybaraIcon";
import { RepositoriesOverview } from "@/features/repositories/components/repositories-overview";

export default function RepositoriesPage() {
  return (
    <main className="min-h-dvh bg-muted/20">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1440px] bg-background md:border-x">
        <aside className="hidden w-80 flex-col border-r bg-background md:flex">
          <div className="flex items-center justify-between border-b px-5 py-6">
            <div className="flex items-center gap-3">
              <QapybaraIcon className="size-8 text-muted-foreground" />
              <p className="text-[2.6rem] font-semibold leading-none tracking-tight">Qapybara</p>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
          </div>

          <nav className="space-y-2 p-2" aria-label="Sidebar">
            <Link
              href="/repositories"
              aria-current="page"
              className="flex items-center gap-3 rounded-xl bg-primary px-5 py-4 text-[2rem] font-medium leading-none text-primary-foreground"
            >
              <QapybaraIcon className="size-6" />
              Repositories
            </Link>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-5 py-4 text-left text-[2rem] leading-none text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Users className="size-6" />
              Users
            </button>
          </nav>

          <div className="mt-auto border-t px-5 py-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="inline-flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Users className="size-5" />
              </div>
              <div>
                <p className="text-[2rem] font-medium leading-tight">田中太郎</p>
                <p className="text-[1.8rem] text-muted-foreground">admin</p>
              </div>
            </div>

            <button
              type="button"
              className="mb-6 inline-flex items-center gap-2 text-[1.9rem] text-destructive transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <LogOut className="size-5" />
              ログアウト
            </button>

            <p className="text-[1.6rem] text-muted-foreground">AI-Powered QA Workbench</p>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="border-b px-5 py-4 sm:px-8 sm:py-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-2 inline-flex items-center gap-2 md:hidden">
                  <Menu className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Qapybara</span>
                </div>

                <h1 className="text-[3.8rem] font-semibold leading-tight tracking-tight">
                  Repositories
                </h1>
                <p className="text-[2rem] text-muted-foreground">GitHub同期済みリポジトリー一覧</p>
              </div>

              <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:flex-nowrap">
                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-5 py-3 text-[2rem] font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-none"
                >
                  <RefreshCcw className="size-5" />
                  Sync All
                </button>
                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-[2rem] font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-none"
                >
                  <Plus className="size-5" />
                  Add Repository
                </button>
              </div>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-8">
            <div className="mb-4 flex items-center justify-end sm:hidden">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-muted-foreground"
              >
                <Settings2 className="size-4" />
                Settings
              </button>
            </div>
            <RepositoriesOverview />
          </div>
        </section>
      </div>
    </main>
  );
}
