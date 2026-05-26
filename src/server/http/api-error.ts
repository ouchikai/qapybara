import { NextResponse } from "next/server";

import {
  type ApiErrorCode,
  type ApiErrorResponse,
  apiErrorResponseSchema,
} from "@/shared/contracts/api-error";

const statusByCode: Record<ApiErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  VALIDATION_ERROR: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

export class ApiError extends Error {
  public constructor(
    public readonly code: ApiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function toErrorResponse(error: unknown): NextResponse<ApiErrorResponse> {
  if (error instanceof ApiError) {
    const payload = apiErrorResponseSchema.parse({
      error: {
        code: error.code,
        message: error.message,
      },
    });

    return NextResponse.json(payload, { status: statusByCode[error.code] });
  }

  const fallback = apiErrorResponseSchema.parse({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Unexpected server error",
    },
  });

  return NextResponse.json(fallback, { status: 500 });
}
