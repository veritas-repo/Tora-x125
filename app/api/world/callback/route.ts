import { NextRequest, NextResponse } from "next/server";
import {
  completeWorldVerification,
  WORLD_FLOW_COOKIE,
  WORLD_SESSION_COOKIE
} from "@/lib/worldid-server";

export const runtime = "nodejs";

function redirect(request: NextRequest, status: string, detail?: string) {
  const url = new URL("/world-agents", request.url);
  url.searchParams.set("world", status);
  if (detail) url.searchParams.set("detail", detail.slice(0, 120));
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const error = request.nextUrl.searchParams.get("error");
  const state = request.nextUrl.searchParams.get("state") || "";

  if (error) {
    const response = redirect(request, error === "access_denied" ? "cancelled" : "denied", error);
    response.cookies.delete(WORLD_FLOW_COOKIE);
    response.cookies.delete(WORLD_SESSION_COOKIE);
    return response;
  }

  const code = request.nextUrl.searchParams.get("code");
  if (!code || !state) {
    const response = redirect(request, "denied", "missing_code_or_state");
    response.cookies.delete(WORLD_FLOW_COOKIE);
    response.cookies.delete(WORLD_SESSION_COOKIE);
    return response;
  }

  try {
    const result = await completeWorldVerification({
      code,
      state,
      flowCookie: request.cookies.get(WORLD_FLOW_COOKIE)?.value
    });

    if (!result.ok) {
      const status = result.reason === "expired" ? "expired" : "denied";
      const response = redirect(request, status, result.reason);
      response.cookies.delete(WORLD_FLOW_COOKIE);
      response.cookies.delete(WORLD_SESSION_COOKIE);
      return response;
    }

    const response = redirect(request, "verified");
    response.cookies.delete(WORLD_FLOW_COOKIE);
    response.cookies.set(WORLD_SESSION_COOKIE, result.sessionCookie, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: Math.max(30, Math.floor((result.publicSession.expiresAt - Date.now()) / 1000))
    });
    return response;
  } catch (error) {
    const response = redirect(
      request,
      "denied",
      error instanceof Error ? error.message : "verification_failed"
    );
    response.cookies.delete(WORLD_FLOW_COOKIE);
    response.cookies.delete(WORLD_SESSION_COOKIE);
    return response;
  }
}
