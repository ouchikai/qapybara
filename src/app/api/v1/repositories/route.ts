import { NextResponse } from "next/server";

import { ListRepositoriesService } from "@/features/repositories/services/list-repositories.service";
import { authorize, getRequestContext } from "@/server/auth/request-context";
import { toErrorResponse } from "@/server/http/api-error";

const service = new ListRepositoriesService();

export async function GET() {
  try {
    const requestContext = await getRequestContext();
    authorize(requestContext.actorRole, ["owner", "admin", "qa", "developer", "viewer"]);
    const payload = await service.execute(requestContext.organizationSlug);

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
