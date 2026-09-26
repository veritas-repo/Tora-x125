export type WorldIdConfig = {
  appId: string;
  action: string;
};

export function getWorldIdConfig(): WorldIdConfig {
  return {
    appId: process.env.NEXT_PUBLIC_WORLD_ID_APP_ID || "",
    action: process.env.NEXT_PUBLIC_WORLD_ID_ACTION || "verify-investor"
  };
}

/**
 * Client-side configuration boundary only.
 * Proof verification should be performed server-side before granting any
 * eligibility-gated action.
 */
export const WORLD_ID_NOTES = {
  role: "Privacy-preserving investor verification",
  storesPersonalIdentityOnchain: false
};
