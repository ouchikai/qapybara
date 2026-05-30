"use client";

import { GitBranch, Menu, Users } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { type ReactNode, useState } from "react";

import { QapybaraIcon } from "@/app/components/QapybaraIcon";
import { Button } from "@/app/components/ui/button";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { authClient } from "@/lib/auth/client";

interface RepositoriesShellProps {
  title: string;
  description: string;
  activeItem: "repositories" | "users";
  breadcrumb?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}

export function RepositoriesShell({
  title,
  description,
  activeItem,
  breadcrumb,
  actions,
  children,
}: RepositoriesShellProps) {
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { data: sessionData } = authClient.useSession();

  const userName = sessionData?.user?.name ?? "田中太郎";

  return (
    <main className="min-h-dvh bg-muted/20">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1400px] bg-background md:border-x">
        <aside
          className={`hidden border-r bg-background md:flex md:flex-col ${
            desktopSidebarOpen ? "w-64" : "w-16"
          }`}
        >
          <div className="flex h-16 items-center justify-between gap-2 border-b px-4">
            {desktopSidebarOpen ? (
              <div className="flex items-center gap-2">
                <QapybaraIcon className="size-7 text-muted-foreground" />
                <p className="text-2xl font-semibold tracking-tight">Qapybara</p>
              </div>
            ) : (
              <QapybaraIcon className="size-7 text-muted-foreground" />
            )}

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setDesktopSidebarOpen((current) => !current)}
              aria-label="Toggle sidebar"
            >
              <Menu className="size-4" />
            </Button>
          </div>

          <nav className="space-y-1 p-3" aria-label="Sidebar">
            <Link
              href={"/repositories" as Route}
              aria-current={activeItem === "repositories" ? "page" : undefined}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeItem === "repositories"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <GitBranch className="size-4 shrink-0" />
              {desktopSidebarOpen ? <span>Repositories</span> : null}
            </Link>
            <button
              type="button"
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                activeItem === "users"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Users className="size-4 shrink-0" />
              {desktopSidebarOpen ? <span>Users</span> : null}
            </button>
          </nav>

          {desktopSidebarOpen ? (
            <div className="mt-auto border-t p-4">
              <div className="mb-3">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">member</p>
              </div>
              <LogoutButton
                className="flex items-center gap-2 text-sm text-destructive hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                ログアウト
              </LogoutButton>
              <p className="mt-3 text-xs text-muted-foreground">AI-Powered QA Workbench</p>
            </div>
          ) : null}
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="border-b px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2 md:hidden">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => setMobileSidebarOpen((current) => !current)}
                    aria-label="Open navigation"
                  >
                    <Menu className="size-4 text-muted-foreground" />
                  </Button>
                  <p className="text-sm font-medium text-muted-foreground">Qapybara</p>
                </div>
                {breadcrumb ? <div className="mb-1">{breadcrumb}</div> : null}
                <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>

              {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
        </section>
      </div>

      {mobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close navigation"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-72 flex-col border-r bg-background p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QapybaraIcon className="size-7 text-muted-foreground" />
                <p className="text-2xl font-semibold tracking-tight">Qapybara</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => setMobileSidebarOpen(false)}
                aria-label="Close navigation"
              >
                <Menu className="size-4" />
              </Button>
            </div>

            <nav className="space-y-1" aria-label="Mobile sidebar">
              <Link
                href={"/repositories" as Route}
                aria-current={activeItem === "repositories" ? "page" : undefined}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  activeItem === "repositories"
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`}
                onClick={() => setMobileSidebarOpen(false)}
              >
                <GitBranch className="size-4 shrink-0" />
                <span>Repositories</span>
              </Link>
              <button
                type="button"
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  activeItem === "users"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Users className="size-4 shrink-0" />
                <span>Users</span>
              </button>
            </nav>

            <div className="mt-auto border-t pt-4">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">member</p>
              <LogoutButton
                className="mt-3 flex items-center gap-2 text-sm text-destructive hover:opacity-90"
                onLoggedOut={() => setMobileSidebarOpen(false)}
              >
                ログアウト
              </LogoutButton>
            </div>
          </aside>
        </div>
      ) : null}
    </main>
  );
}
