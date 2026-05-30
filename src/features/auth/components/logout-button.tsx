"use client";

import { LogOut } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";

import { authClient } from "@/lib/auth/client";

interface LogoutButtonProps {
  className?: string;
  children?: ReactNode;
  onLoggedOut?: () => void;
}

export function LogoutButton({ className, children, onLoggedOut }: LogoutButtonProps) {
  const router = useRouter();
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLogoutError(null);
    setIsLoggingOut(true);

    const { error } = await authClient.signOut();

    setIsLoggingOut(false);

    if (error) {
      setLogoutError(error.message || "ログアウトに失敗しました");
      return;
    }

    onLoggedOut?.();
    router.push("/login" as Route);
    router.refresh();
  };

  return (
    <div>
      <button
        type="button"
        className={className}
        onClick={handleLogout}
        disabled={isLoggingOut}
      >
        <LogOut className="size-4" />
        {children ?? (isLoggingOut ? "ログアウト中..." : "ログアウト")}
      </button>
      {logoutError ? <p className="mt-2 text-xs text-destructive">{logoutError}</p> : null}
    </div>
  );
}