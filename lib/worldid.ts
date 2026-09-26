export const WORLD_AGENTS_ISSUER = "https://sandbox.auth.world.org";

export type WorldAgentStatus = {
  configured: boolean;
  verified: boolean;
  issuer: string;
  subjectHash?: string;
  requestId?: string;
  order?: {
    asset: string;
    side: "Buy" | "Sell";
    amount: string;
  };
  verifiedAt?: number;
  expiresAt?: number;
  reason?: string;
};

export const WORLD_ID_NOTES = {
  environment: "Official ETHGlobal event sandbox",
  issuer: WORLD_AGENTS_ISSUER,
  role: "Fresh human verification before a protected Tora Trade Agent action",
  validation: "Backend OIDC code exchange + JWKS-signed ID token verification",
  storesPersonalIdentityOnchain: false,
  clientSecretsInBrowser: false
};
