import { NextRequest, NextResponse } from "next/server";
import { publicWorldStatus, WORLD_SESSION_COOKIE } from "@/lib/worldid-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return NextResponse.json(
    publicWorldStatus(request.cookies.get(WORLD_SESSION_COOKIE)?.value),
    { headers: { "cache-control": "no-store" } }
  );
}
