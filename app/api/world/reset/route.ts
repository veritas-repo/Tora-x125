import { NextResponse } from "next/server";
import { WORLD_FLOW_COOKIE, WORLD_SESSION_COOKIE } from "@/lib/worldid-server";

export async function POST() {
  const response = NextResponse.json({ ok: true, verified: false });
  response.cookies.delete(WORLD_FLOW_COOKIE);
  response.cookies.delete(WORLD_SESSION_COOKIE);
  return response;
}
