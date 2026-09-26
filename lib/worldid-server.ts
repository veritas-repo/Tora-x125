import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";

export const WORLD_SANDBOX_ISSUER = "https://sandbox.auth.world.org";
export const WORLD_FLOW_COOKIE = "tora_world_flow";
export const WORLD_SESSION_COOKIE = "tora_world_session";

const FLOW_TTL_SECONDS = 10 * 60;
const DEFAULT_SESSION_TTL_SECONDS = 5 * 60;

export type ProtectedTradeOrder = {
  asset: string;
  side: "Buy" | "Sell";
  amount: string;
};

type WorldDiscovery = {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  jwks_uri: string;
};

type FlowCookie = {
  v: 1;
  state: string;
  nonce: string;
  verifier: string;
  requestId: string;
  binding: string;
  order: ProtectedTradeOrder;
  startedAt: number;
  expiresAt: number;
};

type SessionCookie = {
  v: 1;
  issuer: string;
  subjectHash: string;
  requestId: string;
  binding: string;
  order: ProtectedTradeOrder;
  authTime: number;
  verifiedAt: number;
  expiresAt: number;
};

type WorldConfig = {
  issuer: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  sessionSecret: string;
  sessionTtlSeconds: number;
  acrValues?: string;
};

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

export function worldAgentsConfigured() {
  return Boolean(
    process.env.WORLD_ID_CLIENT_ID &&
    process.env.WORLD_ID_CLIENT_SECRET &&
    process.env.WORLD_ID_REDIRECT_URI &&
    process.env.WORLD_ID_SESSION_SECRET
  );
}

export function getWorldConfig(): WorldConfig {
  const redirectUri = required("WORLD_ID_REDIRECT_URI");
  if (!redirectUri.startsWith("https://")) {
    throw new Error("WORLD_ID_REDIRECT_URI must be an exact public HTTPS callback URL for the event sandbox.");
  }

  const sessionTtlSeconds = Number(process.env.WORLD_ID_SESSION_TTL_SECONDS || DEFAULT_SESSION_TTL_SECONDS);
  if (!Number.isFinite(sessionTtlSeconds) || sessionTtlSeconds < 30 || sessionTtlSeconds > 3600) {
    throw new Error("WORLD_ID_SESSION_TTL_SECONDS must be between 30 and 3600.");
  }

  return {
    issuer: (process.env.WORLD_ID_ISSUER || WORLD_SANDBOX_ISSUER).replace(/\/$/, ""),
    clientId: required("WORLD_ID_CLIENT_ID"),
    clientSecret: required("WORLD_ID_CLIENT_SECRET"),
    redirectUri,
    sessionSecret: required("WORLD_ID_SESSION_SECRET"),
    sessionTtlSeconds,
    acrValues: process.env.WORLD_ID_ACR_VALUES?.trim() || undefined
  };
}

async function discover(config: WorldConfig): Promise<WorldDiscovery> {
  const response = await fetch(`${config.issuer}/.well-known/openid-configuration`, {
    cache: "no-store",
    signal: AbortSignal.timeout(10_000)
  });
  if (!response.ok) throw new Error(`World ID discovery failed (${response.status}).`);

  const metadata = (await response.json()) as WorldDiscovery;
  if (metadata.issuer !== config.issuer) throw new Error("World ID discovery issuer mismatch.");
  if (!metadata.authorization_endpoint || !metadata.token_endpoint || !metadata.jwks_uri) {
    throw new Error("World ID discovery response is incomplete.");
  }
  return metadata;
}

function base64url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

function sha256(input: string) {
  return createHash("sha256").update(input).digest();
}

function stableJson(value: ProtectedTradeOrder) {
  return JSON.stringify({ asset: value.asset, side: value.side, amount: value.amount });
}

function signCookie<T>(payload: T, secret: string) {
  const encoded = base64url(JSON.stringify(payload));
  const signature = createHmac("sha256", secret).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

function readSignedCookie<T>(value: string | undefined, secret: string): T | null {
  if (!value) return null;
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) return null;

  const expected = createHmac("sha256", secret).update(encoded).digest();
  let provided: Buffer;
  try {
    provided = Buffer.from(signature, "base64url");
  } catch {
    return null;
  }
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) return null;

  try {
    return JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

export function validateTradeOrder(input: unknown): ProtectedTradeOrder {
  const body = (input || {}) as Partial<ProtectedTradeOrder>;
  const asset = String(body.asset || "TORA-GB01").trim().slice(0, 40);
  const side = body.side === "Sell" ? "Sell" : "Buy";
  const amount = String(body.amount || "1000").trim().slice(0, 32);

  if (!asset) throw new Error("Asset is required.");
  if (!/^\d+(\.\d+)?$/.test(amount) || Number(amount) <= 0) throw new Error("Amount must be a positive number.");
  return { asset, side, amount };
}

export async function beginWorldVerification(order: ProtectedTradeOrder) {
  const config = getWorldConfig();
  const metadata = await discover(config);
  const verifier = randomBytes(32).toString("base64url");
  const challenge = sha256(verifier).toString("base64url");
  const state = randomBytes(24).toString("base64url");
  const requestId = randomBytes(16).toString("hex");
  const binding = sha256(stableJson(order)).toString("hex");
  const nonce = sha256(`tora-x125/world-agents/v1|${requestId}|${binding}|${randomBytes(16).toString("hex")}`).toString("hex");
  const startedAt = Date.now();
  const expiresAt = startedAt + FLOW_TTL_SECONDS * 1000;

  const url = new URL(metadata.authorization_endpoint);
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: "openid",
    state,
    nonce,
    code_challenge: challenge,
    code_challenge_method: "S256",
    max_age: "0",
    prompt: "login"
  });
  if (config.acrValues) params.set("acr_values", config.acrValues);
  url.search = params.toString();

  const flow: FlowCookie = {
    v: 1,
    state,
    nonce,
    verifier,
    requestId,
    binding,
    order,
    startedAt,
    expiresAt
  };

  return {
    authorizeUrl: url.toString(),
    requestId,
    expiresAt,
    flowCookie: signCookie(flow, config.sessionSecret)
  };
}

function readFlowCookie(value: string | undefined, config: WorldConfig) {
  const flow = readSignedCookie<FlowCookie>(value, config.sessionSecret);
  if (!flow || flow.v !== 1) return null;
  return flow;
}

export async function completeWorldVerification(input: {
  code: string;
  state: string;
  flowCookie?: string;
}) {
  const config = getWorldConfig();
  const flow = readFlowCookie(input.flowCookie, config);
  if (!flow) return { ok: false as const, reason: "missing_or_invalid_flow" };
  if (flow.state !== input.state) return { ok: false as const, reason: "state_mismatch" };
  if (Date.now() > flow.expiresAt) return { ok: false as const, reason: "expired" };

  const metadata = await discover(config);
  const basic = Buffer.from(`${encodeURIComponent(config.clientId)}:${encodeURIComponent(config.clientSecret)}`).toString("base64");
  const tokenResponse = await fetch(metadata.token_endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      authorization: `Basic ${basic}`
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: input.code,
      redirect_uri: config.redirectUri,
      code_verifier: flow.verifier
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000)
  });

  const tokenBody = (await tokenResponse.json().catch(() => ({}))) as {
    id_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!tokenResponse.ok || !tokenBody.id_token) {
    return {
      ok: false as const,
      reason: tokenBody.error || "token_exchange_failed",
      detail: tokenBody.error_description
    };
  }

  const jwks = createRemoteJWKSet(new URL(metadata.jwks_uri));
  const { payload } = await jwtVerify(tokenBody.id_token, jwks, {
    issuer: metadata.issuer,
    audience: config.clientId,
    algorithms: ["RS256"],
    requiredClaims: ["sub", "exp", "iat", "nonce", "auth_time"],
    clockTolerance: 5
  });

  if (payload.nonce !== flow.nonce) return { ok: false as const, reason: "nonce_mismatch" };
  if (!payload.sub) return { ok: false as const, reason: "missing_subject" };

  const authTime = typeof payload.auth_time === "number" ? payload.auth_time : 0;
  const startedAtSeconds = Math.floor(flow.startedAt / 1000);
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (!authTime || authTime < startedAtSeconds - 5 || authTime > nowSeconds + 30) {
    return { ok: false as const, reason: "verification_not_fresh" };
  }

  const verifiedAt = Date.now();
  const expiresAt = verifiedAt + config.sessionTtlSeconds * 1000;
  const subjectHash = sha256(`${metadata.issuer}|${payload.sub}`).toString("hex");

  const session: SessionCookie = {
    v: 1,
    issuer: metadata.issuer,
    subjectHash,
    requestId: flow.requestId,
    binding: flow.binding,
    order: flow.order,
    authTime,
    verifiedAt,
    expiresAt
  };

  return {
    ok: true as const,
    sessionCookie: signCookie(session, config.sessionSecret),
    publicSession: {
      verified: true,
      issuer: session.issuer,
      subjectHash: `sha256:${session.subjectHash.slice(0, 16)}…`,
      requestId: session.requestId,
      order: session.order,
      verifiedAt: session.verifiedAt,
      expiresAt: session.expiresAt
    }
  };
}

export function readWorldSession(value: string | undefined) {
  if (!worldAgentsConfigured()) return null;
  const config = getWorldConfig();
  const session = readSignedCookie<SessionCookie>(value, config.sessionSecret);
  if (!session || session.v !== 1) return null;
  if (Date.now() > session.expiresAt) return null;
  return session;
}

export function publicWorldStatus(sessionCookie?: string) {
  if (!worldAgentsConfigured()) {
    return {
      configured: false,
      verified: false,
      issuer: WORLD_SANDBOX_ISSUER,
      reason: "Set the server-only World ID for Agents sandbox credentials."
    };
  }

  const session = readWorldSession(sessionCookie);
  if (!session) {
    return {
      configured: true,
      verified: false,
      issuer: getWorldConfig().issuer
    };
  }

  return {
    configured: true,
    verified: true,
    issuer: session.issuer,
    subjectHash: `sha256:${session.subjectHash.slice(0, 16)}…`,
    requestId: session.requestId,
    order: session.order,
    verifiedAt: session.verifiedAt,
    expiresAt: session.expiresAt
  };
}

export function issueProtectedTradeAuthorization(sessionCookie?: string) {
  const session = readWorldSession(sessionCookie);
  if (!session) {
    return { ok: false as const, reason: "fresh_world_verification_required" };
  }

  const config = getWorldConfig();
  const issuedAt = Date.now();
  const expiresAt = issuedAt + 2 * 60 * 1000;
  const authorizationId = randomBytes(16).toString("hex");
  const authorization = {
    v: 1,
    type: "tora-protected-trade",
    authorizationId,
    requestId: session.requestId,
    subjectHash: session.subjectHash,
    binding: session.binding,
    order: session.order,
    issuedAt,
    expiresAt
  };

  return {
    ok: true as const,
    actionExecuted: true,
    authorizationId,
    expiresAt,
    order: session.order,
    authorizationToken: signCookie(authorization, config.sessionSecret),
    nextStep: "Compare 1inch and Uniswap v4 routes, then require wallet signature before settlement."
  };
}
