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

export const UNISWAP_V4_TESTNETS = {
  11155111: {
    name: "Ethereum Sepolia",
    poolManager: "0xE03A1074c86CFeDd5C142C4F04F1a1536e203543",
    permit2: "0x000000000022D473030F116dDEE9F6B43aC78BA3"
  },
  84532: {
    name: "Base Sepolia",
    poolManager: "0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408",
    permit2: "0x000000000022D473030F116dDEE9F6B43aC78BA3"
  }
} as const;

export function getUniswapV4TestnetConfig(chainId: number) {
  return UNISWAP_V4_TESTNETS[chainId as keyof typeof UNISWAP_V4_TESTNETS];
}

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
  integration: "Uniswap v4 PoolManager + ToraImpactHook + Universal Router",
  hook: "contracts/uniswap/ToraImpactHook.sol",
  purpose:
    "Programmable secondary-market liquidity with per-pool liveness and maximum-swap policy checks",
  execution:
    "Universal Router plan execution after application eligibility and route checks",
  productionRequirement:
    "Encode Permit2 + V4_SWAP commands using official Uniswap v4 SDK/contracts for the target chain."
};

export function isConfiguredForV4() {
  return Boolean(process.env.NEXT_PUBLIC_UNISWAP_UNIVERSAL_ROUTER_ADDRESS);
}
