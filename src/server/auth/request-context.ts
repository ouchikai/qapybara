import { headers } from "next/headers";

import { auth } from "@/lib/auth/server";
import { prisma } from "@/server/db/prisma";
import { ApiError } from "@/server/http/api-error";

export type AppRole = "owner" | "admin" | "qa" | "developer" | "viewer";

const membershipRoleMap = {
  OWNER: "owner",
  ADMIN: "admin",
  QA: "qa",
  DEVELOPER: "developer",
  VIEWER: "viewer",
} as const satisfies Record<string, AppRole>;

export interface RequestContext {
  organizationSlug: string;
  actorRole: AppRole;
  userId: string;
}

export async function getRequestContext(): Promise<RequestContext> {
  let requestHeaders: Headers;
  try {
    requestHeaders = await headers();
  } catch {
    throw new ApiError("UNAUTHORIZED", "Authentication is required");
  }

  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session?.user?.id) {
    throw new ApiError("UNAUTHORIZED", "Authentication is required");
  }

  const organizationSlug = process.env.DEFAULT_ORGANIZATION_SLUG ?? "default-org";

  const membership = await prisma.membership.findFirst({
    where: {
      userId: session.user.id,
      status: "ACTIVE",
      organization: {
        slug: organizationSlug,
        deletedAt: null,
      },
    },
    select: {
      role: true,
    },
  });

  if (!membership) {
    throw new ApiError("FORBIDDEN", "No active membership found for this organization");
  }

  const actorRole = membershipRoleMap[membership.role];

  if (!actorRole) {
    throw new ApiError("FORBIDDEN", "Unsupported membership role");
  }

  return {
    organizationSlug,
    actorRole,
    userId: session.user.id,
  };
}

export function authorize(actorRole: AppRole, allowedRoles: AppRole[]): void {
  if (!allowedRoles.includes(actorRole)) {
    throw new ApiError("FORBIDDEN", "You do not have access to this resource");
  }
}
