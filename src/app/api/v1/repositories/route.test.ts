import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/v1/repositories/route";
import { ApiError } from "@/server/http/api-error";

const { mockAuthorize, mockGetRequestContext } = vi.hoisted(() => ({
  mockAuthorize: vi.fn(),
  mockGetRequestContext: vi.fn(),
}));

vi.mock("@/server/auth/request-context", () => ({
  authorize: mockAuthorize,
  getRequestContext: mockGetRequestContext,
}));

describe("GET /api/v1/repositories", () => {
  beforeEach(() => {
    mockAuthorize.mockReset();
    mockGetRequestContext.mockReset();
    mockAuthorize.mockImplementation(() => undefined);
    mockGetRequestContext.mockResolvedValue({
      organizationSlug: "default-org",
      actorRole: "admin",
      userId: "test-user",
    });
  });

  it("returns repository summaries", async () => {
    const response = await GET();
    const json = (await response.json()) as { data: Array<{ id: string; name: string }> };

    expect(response.status).toBe(200);
    expect(json.data.length).toBeGreaterThan(0);
    expect(json.data[0]).toHaveProperty("id");
    expect(json.data[0]).toHaveProperty("name");
  });

  it("returns unauthorized when request context is missing", async () => {
    mockGetRequestContext.mockRejectedValueOnce(
      new ApiError("UNAUTHORIZED", "Authentication is required"),
    );

    const response = await GET();
    const json = (await response.json()) as { error: { code: string } };

    expect(response.status).toBe(401);
    expect(json.error.code).toBe("UNAUTHORIZED");
  });
});
