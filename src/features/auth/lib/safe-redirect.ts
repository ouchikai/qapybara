export function sanitizeRedirectTarget(redirectTo: string | undefined): string {
  if (!redirectTo) {
    return "/";
  }

  if (!redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return "/";
  }

  return redirectTo;
}