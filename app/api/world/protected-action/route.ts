import { NextRequest, NextResponse } from "next/server";
import { issueProtectedTradeAuthorization, WORLD_SESSION_COOKIE } from "@/lib/worldid-server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const result = issueProtectedTradeAuthorization(
    request.cookies.get(WORLD_SESSION_COOKIE)?.value
  );

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        actionExecuted: false,
        error: result.reason,
        message: "Protected Trade Agent action denied. No trade authorization was issued."
      },
      { status: 403 }
    );
  }

  return NextResponse.json({
    ok: true,
    ...result
  });
}
