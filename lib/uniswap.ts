import { Contract, Signer } from "ethers";

const UNIVERSAL_ROUTER_ABI = [
  "function execute(bytes commands, bytes[] inputs, uint256 deadline) payable"
];

export type UniversalRouterExecution = {
  commands: string;
  inputs: string[];
  deadline: bigint;
  value?: bigint;
};

/**
 * Executes a pre-encoded Uniswap Universal Router plan.
 *
 * For a v4 swap, build commands/inputs with the official Uniswap v4 SDK
 * (including Permit2 where required) and pass the resulting payload here.
 */
export async function executeUniversalRouter(
  signer: Signer,
  routerAddress: string,
  plan: UniversalRouterExecution
) {
  if (!routerAddress) throw new Error("Universal Router address is not configured.");

  const router = new Contract(routerAddress, UNIVERSAL_ROUTER_ABI, signer);
  return router.execute(plan.commands, plan.inputs, plan.deadline, {
    value: plan.value ?? 0n
  });
}

export const UNISWAP_V4_NOTES = {
  integration: "Universal Router",
  purpose: "Route secondary-market swaps after project units have a fungible pool representation",
  productionRequirement:
    "Encode Permit2 + V4_SWAP commands using official Uniswap v4 SDK/contracts for the target chain."
};

export function isConfiguredForV4() {
  return Boolean(process.env.NEXT_PUBLIC_UNISWAP_UNIVERSAL_ROUTER_ADDRESS);
}
