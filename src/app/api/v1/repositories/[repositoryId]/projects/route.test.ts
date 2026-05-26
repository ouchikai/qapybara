import { describe, expect, it } from "vitest";

import { GET } from "@/app/api/v1/repositories/[repositoryId]/projects/route";

describe("GET /api/v1/repositories/[repositoryId]/projects", () => {
  it("returns projects", async () => {
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ repositoryId: "repo_finance_portal" }),
    });

    const json = (await response.json()) as { data: Array<{ id: string; name: string }> };

    expect(response.status).toBe(200);
    expect(json.data.length).toBeGreaterThan(0);
    expect(json.data[0]).toHaveProperty("id");
    expect(json.data[0]).toHaveProperty("name");
  });
});
