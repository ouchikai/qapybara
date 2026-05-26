import { NextResponse } from "next/server";

import { ListProjectsService } from "@/features/projects/services/list-projects.service";
import { authorize, getRequestContext } from "@/server/auth/request-context";
import { toErrorResponse } from "@/server/http/api-error";

const service = new ListProjectsService();

interface RouteContext {
  params: Promise<{ repositoryId: string }>;
}

export async function GET(_: Request, context: RouteContext) {
  try {
    const requestContext = await getRequestContext();
    authorize(requestContext.actorRole, ["owner", "admin", "qa", "developer", "viewer"]);

    const { repositoryId } = await context.params;
    const payload = await service.execute(requestContext.organizationSlug, repositoryId);

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
