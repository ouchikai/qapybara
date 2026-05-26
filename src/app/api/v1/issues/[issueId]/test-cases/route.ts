import { NextResponse } from "next/server";

import { ListTestCasesService } from "@/features/test-cases/services/list-test-cases.service";
import { authorize, getRequestContext } from "@/server/auth/request-context";
import { toErrorResponse } from "@/server/http/api-error";

const service = new ListTestCasesService();

interface RouteContext {
  params: Promise<{ issueId: string }>;
}

export async function GET(_: Request, context: RouteContext) {
  try {
    const requestContext = await getRequestContext();
    authorize(requestContext.actorRole, ["owner", "admin", "qa", "developer", "viewer"]);

    const { issueId } = await context.params;
    const payload = await service.execute(requestContext.organizationSlug, issueId);

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
