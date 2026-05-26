import { describe, expect, it } from "vitest";

import { healthResponseSchema } from "@/shared/contracts/health";

describe("healthResponseSchema", () => {
  it("accepts valid payload", () => {
    const payload = {
      ok: true,
      timestamp: new Date().toISOString(),
      service: "qapybara-api" as const,
    };

    expect(healthResponseSchema.parse(payload)).toEqual(payload);
  });

  it("rejects invalid payload", () => {
    expect(() =>
      healthResponseSchema.parse({
        ok: true,
        timestamp: "invalid",
        service: "qapybara-api",
      }),
    ).toThrow();
  });
});
