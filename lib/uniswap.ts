export const UNISWAP_V4_NOTES = {
  integration: "Universal Router",
  purpose: "Route secondary-market swaps once a project unit has a fungible pool representation",
  productionRequirement:
    "Encode Permit2 + V4_SWAP commands using official Uniswap v4 SDK/contracts for the target chain."
};

export function isConfiguredForV4() {
  return Boolean(process.env.NEXT_PUBLIC_UNISWAP_UNIVERSAL_ROUTER_ADDRESS);
}
