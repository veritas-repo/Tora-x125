# 1inch Aqua + SwapVM — Tora-x125

## What Tora-x125 built

Tora-x125 implements a custom **Aqua application** for a sophisticated DeFi position called **Impact-Adjusted Concentrated Liquidity**.

The app extends the official 1inch `AquaSwapVMRouter` and uses the official Aqua shared-liquidity contract. It combines a custom Tora SwapVM instruction with official SwapVM instructions:

```text
optional Deadline
      ↓
ImpactRiskAdjuster       custom opcode 0xd0
      ↓
Decay                    official SwapVM
      ↓
FeeFlatIn                official SwapVM
      ↓
XYCConcentrateSwap       official SwapVM
      ↓
Salt                     official SwapVM
```

Official upstreams are pinned in `package.json`:

- `@1inch/aqua` → `github:1inch/aqua#v1.0.0`
- `@1inch/swap-vm` → the official 1inch SwapVM repository at a pinned commit

## Position design

### 1. Custom risk / impact pricing

`ImpactRiskAdjuster.sol` introduces opcode `0xd0`, taken from SwapVM's unallocated `0xd0–0xef` opcode bank.

It encodes:

- `riskPremiumBps` — raises the virtual input balance and worsens the quoted execution rate for risk-heavy impact assets;
- `impactDiscountBps` — lowers the virtual input balance and improves the quoted execution rate for strongly verified impact assets.

Both components are capped at 2,000 bps. The instruction modifies only SwapVM pricing registers; it does not invent Aqua balances or directly move tokens.

### 2. Concentrated AMM liquidity

The official `XYCConcentrateSwap` instruction provides bounded constant-product liquidity between configured square-root price limits.

This allows the impact position to concentrate maker liquidity around a target trading range rather than exposing the full inventory over an unbounded curve.

### 3. Inventory-aware decay

The official `Decay` instruction tracks post-trade offsets and makes immediate counter-trading less favourable. The offset decays over the configured period.

For illiquid real-world-asset markets, this is useful as an inventory-risk control because a rapid reversal can receive less favourable pricing while the position gradually normalises.

### 4. LP fee

The official `FeeFlatIn` instruction applies an input-side maker fee.

### 5. Expiry and immutable strategy identity

`Deadline` can expire the position and `Salt` makes otherwise identical strategies distinct.

## Aqua shared liquidity

The maker ships the strategy through official Aqua:

```text
maker wallet
    │
    ├─ approve Aqua for token A + token B
    │
    └─ Aqua.ship(
           custom Tora app,
           abi.encode(order),
           tokens,
           virtual balances
       )
```

The tokens remain in the maker wallet while Aqua tracks the position's virtual balances.

When SwapVM executes:

1. the taker's input token transfers onchain;
2. Aqua increases the maker position's virtual input balance;
3. Aqua pulls the maker's output token;
4. the output token transfers to the taker;
5. SwapVM emits the final swap event.

## Demonstration

### Automated tests

Run:

```bash
npm run contracts:test
```

`test/ToraAquaSwapVM.js` demonstrates:

- the custom opcode is embedded in an official SwapVM program;
- an immutable strategy is shipped through Aqua;
- a SwapVM quote is produced;
- a trade settles actual ERC-20 maker/taker balances;
- Aqua virtual balances update after settlement;
- impact-heavy and risk-heavy configurations produce different prices.

### Executable position script

Run:

```bash
npm run demo:aqua
```

`scripts/demo-aqua-position.js` deploys the official Aqua contract locally, deploys the custom Tora Aqua/SwapVM app, ships a position, quotes it, executes it, and prints:

- Aqua address;
- custom app address;
- strategy/order hash;
- Aqua `ship` transaction hash;
- SwapVM quote;
- SwapVM execution transaction hash;
- maker/taker ERC-20 balance deltas;
- final Aqua virtual balances.

The command is also executed in GitHub Actions CI so the demonstration is continuously checked.

### Judge UI

Open:

```text
/aqua-position
```

The page shows the position composition, configuration, custom opcode, official instructions, source map and demonstration paths.

## Source map

| Component | File |
| --- | --- |
| Custom Aqua app / SwapVM router | `contracts/oneinch/ToraImpactAquaRouter.sol` |
| Custom opcode | `contracts/oneinch/ImpactRiskAdjuster.sol` |
| Position builder | `contracts/oneinch/ToraAquaPositionBuilder.sol` |
| Official Aqua import | `contracts/oneinch/OfficialAquaImport.sol` |
| Demo ERC-20 | `contracts/oneinch/AquaDemoToken.sol` |
| Automated tests | `test/ToraAquaSwapVM.js` |
| Executable demo | `scripts/demo-aqua-position.js` |
| Judge UI | `app/aqua-position/page.tsx` |
| UI metadata | `lib/aqua.ts` |
| CI demonstration | `.github/workflows/ci.yml` |

## Production boundary

This is a hackathon position, not a production RWA market. Production use would require contract review/audit, asset-specific transfer restrictions, oracle and MRV integrity controls, legal/eligibility checks, liquidity-risk parameters, and deployed-network verification.
