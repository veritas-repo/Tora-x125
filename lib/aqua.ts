export const TORA_AQUA_POSITION = {
  name: "Impact-Adjusted Concentrated Liquidity",
  app: "ToraImpactAquaRouter",
  customOpcode: "0xd0",
  customInstruction: "ImpactRiskAdjuster",
  source: "Official 1inch Aqua + SwapVM",
  program: [
    {
      step: "Deadline",
      kind: "official",
      purpose: "Optional position expiry"
    },
    {
      step: "ImpactRiskAdjuster",
      kind: "custom",
      purpose: "Adjust virtual pricing from project risk and verified-impact parameters"
    },
    {
      step: "Decay",
      kind: "official",
      purpose: "Time-decaying inventory pressure after fills"
    },
    {
      step: "FeeFlatIn",
      kind: "official",
      purpose: "Input-side LP fee"
    },
    {
      step: "XYCConcentrateSwap",
      kind: "official",
      purpose: "Concentrated constant-product liquidity within a configured price range"
    },
    {
      step: "Salt",
      kind: "official",
      purpose: "Unique immutable strategy identity"
    }
  ],
  example: {
    virtualLiquidityPerSide: "100,000",
    swapInput: "1,000",
    priceRange: "0.80–1.20",
    decayPeriod: "300 sec",
    lpFee: "0.30%",
    riskPremium: "5.00%",
    impactDiscount: "7.50%"
  }
} as const;

export const AQUA_DEMO_PROOF = {
  test: "test/ToraAquaSwapVM.js",
  script: "scripts/demo-aqua-position.js",
  command: "npm run demo:aqua",
  ci: ".github/workflows/ci.yml",
  checks: [
    "Builds custom opcode + official SwapVM program",
    "Ships an immutable strategy through official Aqua",
    "Executes ERC-20 transfers through Aqua + SwapVM",
    "Updates Aqua virtual balances after settlement",
    "Shows different pricing for risk-heavy vs impact-heavy positions"
  ]
} as const;
