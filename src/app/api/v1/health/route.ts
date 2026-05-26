import { NextResponse } from "next/server";

import { healthResponseSchema } from "@/shared/contracts/health";

export function GET() {
  const payload = healthResponseSchema.parse({
    ok: true,
    timestamp: new Date().toISOString(),
    service: "qapybara-api",
  });

  return NextResponse.json(payload, { status: 200 });
}
