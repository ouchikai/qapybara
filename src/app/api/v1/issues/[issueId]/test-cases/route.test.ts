import { describe, expect, it } from "vitest";

import { GET } from "@/app/api/v1/issues/[issueId]/test-cases/route";

describe("GET /api/v1/issues/[issueId]/test-cases", () => {
  it("returns test cases and custom field definitions", async () => {
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ issueId: "issue_124" }),
    });

    const json = (await response.json()) as {
      data: {
        customFieldDefinitions: Array<{ name: string }>;
        testCases: Array<{ title: string; customFieldValues: Record<string, string> }>;
      };
    };

    expect(response.status).toBe(200);
    expect(json.data.customFieldDefinitions.length).toBeGreaterThan(0);
    expect(json.data.testCases.length).toBeGreaterThan(0);
    expect(json.data.testCases[0]).toHaveProperty("customFieldValues");
  });
});
