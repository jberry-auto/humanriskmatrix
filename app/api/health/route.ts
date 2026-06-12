import { NextResponse } from "next/server";

import { healthStatus } from "@/lib/health";

// Health must always reflect current process state — never cache it.
export const dynamic = "force-dynamic";

export function GET(): NextResponse {
  return NextResponse.json(healthStatus());
}
