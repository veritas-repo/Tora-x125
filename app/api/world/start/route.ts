import { NextRequest, NextResponse } from "next/server";
import { beginWorldVerification, validateTradeOrder, WORLD_FLOW_COOKIE } from "@/lib/worldid-server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const order = validateTradeOrder(body);
    const result = await beginWorldVerification(order);

    const response = NextResponse.json({
      ok: true,
      authorizeUrl: result.authorizeUrl,
      requestId: result.requestId,
      expiresAt: result.expiresAt
    });

    response.cookies.set(WORLD_FLOW_COOKIE, result.flowCookie, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 10 * 60
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unable to start World verification." },
      { status: 500 }
    );
  }
}
