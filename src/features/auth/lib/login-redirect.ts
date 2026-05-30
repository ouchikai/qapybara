const SESSION_EXPIRED_REASON = "session-expired";

export function buildLoginRedirectPath(redirectTo: string, reason = SESSION_EXPIRED_REASON): string {
  const searchParams = new URLSearchParams({
    redirectTo,
    reason,
  });

  return `/login?${searchParams.toString()}`;
}

export function redirectToLogin(reason = SESSION_EXPIRED_REASON): void {
  if (typeof window === "undefined") {
    return;
  }

  const redirectTo = `${window.location.pathname}${window.location.search}`;

  const loginUrl = new URL(buildLoginRedirectPath(redirectTo, reason), window.location.origin);

  window.location.assign(loginUrl);
}

export function getLoginReasonMessage(reason: string | undefined): string | null {
  if (reason === SESSION_EXPIRED_REASON) {
    return "セッションの有効期限が切れました。再度ログインしてください。";
  }

  return null;
}