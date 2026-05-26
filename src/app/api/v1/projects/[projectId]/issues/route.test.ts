import { describe, expect, it } from "vitest";

import { GET } from "@/app/api/v1/projects/[projectId]/issues/route";

describe("GET /api/v1/projects/[projectId]/issues", () => {
  it("returns issues", async () => {
    const request = new Request("http://localhost/api/v1/projects/project_v2_5_release/issues");
    const response = await GET(request, {
      params: Promise.resolve({ projectId: "project_v2_5_release" }),
    });

    const json = (await response.json()) as { data: Array<{ id: string; title: string }> };

    expect(response.status).toBe(200);
    expect(json.data.length).toBeGreaterThan(0);
    expect(json.data[0]).toHaveProperty("id");
    expect(json.data[0]).toHaveProperty("title");
  });

  it("returns validation error for invalid status", async () => {
    const request = new Request(
      "http://localhost/api/v1/projects/project_v2_5_release/issues?status=UNKNOWN",
    );
    const response = await GET(request, {
      params: Promise.resolve({ projectId: "project_v2_5_release" }),
    });

    const json = (await response.json()) as { error: { code: string } };

    expect(response.status).toBe(400);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });
});
