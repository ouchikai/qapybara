import { NextResponse } from "next/server";
import { listIssuesQuerySchema } from "@/features/issues/schemas/issue-summary.schema";
import { ListIssuesService } from "@/features/issues/services/list-issues.service";
import { authorize, getRequestContext } from "@/server/auth/request-context";
import { ApiError, toErrorResponse } from "@/server/http/api-error";

const service = new ListIssuesService();

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const requestContext = await getRequestContext();
    authorize(requestContext.actorRole, ["owner", "admin", "qa", "developer", "viewer"]);

    const { projectId } = await context.params;
    const url = new URL(request.url);
    const queryParse = listIssuesQuerySchema.safeParse({
      status: url.searchParams.get("status") ?? undefined,
      assigneeId: url.searchParams.get("assigneeId") ?? undefined,
    });

    if (!queryParse.success) {
      throw new ApiError("VALIDATION_ERROR", "Invalid issue list query parameters");
    }

    const payload = await service.execute(
      requestContext.organizationSlug,
      projectId,
      queryParse.data,
    );

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
