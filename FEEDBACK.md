# Uniswap Developer Feedback — Tora-x125

Repository: https://github.com/veritas-repo/Tora-x125

Feedback file: https://github.com/veritas-repo/Tora-x125/blob/main/FEEDBACK.md

Developer Feedback Form: https://developers.uniswap.org/hackathon-feedback

> **Submission status:** the repository-side feedback is complete. The external Uniswap Developer Feedback Form must still be submitted with the FEEDBACK.md URL above. Do not mark the form complete until the browser submission has been confirmed.

## What we built with Uniswap

Tora-x125 is a secondary market for verified, tokenised impact investments. Uniswap v4 is the programmable AMM layer for secondary liquidity.

The implementation includes:

- a real `beforeSwap` v4 hook: `contracts/uniswap/ToraImpactHook.sol`;
- per-pool market liveness and maximum-swap controls;
- a project-verification hash committed into the pool policy for audit correlation;
- CREATE2 hook deployment with correct Uniswap v4 permission bits;
- official v4 `PoolManager` integration through `@uniswap/v4-core`;
- Universal Router execution support in `lib/uniswap.ts`;
- Sepolia and Base Sepolia deployment support;
- Hardhat tests that mine a valid hook address and exercise allowed and denied swap-policy paths.

## Time to first success

The first repository CI run with the new Uniswap v4 hook compiled the official `@uniswap/v4-core` dependency, passed the hook tests, and completed the Next.js production build on **26 September 2026**.

We did not track the exact elapsed minutes from the first line of implementation to CI success, so we are intentionally not inventing a number. The useful milestone for us was getting from an architecture-only Universal Router adapter to an actual v4 `beforeSwap` hook with permission-bit-aware CREATE2 deployment and passing tests in one implementation cycle.

## What worked well

1. **The hook model is expressive.** A single `beforeSwap` hook is enough to add asset-specific market controls without forking or modifying the AMM.
2. **PoolKey / PoolId are clean integration primitives.** They make per-pool policy state straightforward to model.
3. **The permission-bit design is explicit.** Once understood, it makes it easy to see exactly which lifecycle callbacks a hook can receive.
4. **The v4-core package is easy to consume from Solidity.** Importing `IHooks`, `Hooks`, `PoolKey`, `PoolIdLibrary`, `SwapParams`, and `BeforeSwapDelta` gave us a small and direct integration surface.
5. **Universal Router complements the hook layer.** It gives the frontend an execution boundary while the hook carries pool-specific policy.

## Friction encountered

1. **Hook address permissions add a non-obvious deployment step.** A hook can compile perfectly but still revert in its constructor if the deployed address does not match the callback flags. We added a CREATE2 factory and salt miner to make this explicit and reproducible.
2. **The recommended BaseHook location has moved over time.** Current official examples point developers to `v4-hooks-public`, while older material and some ecosystem examples refer to different paths. This creates avoidable uncertainty when starting from npm/Hardhat rather than Foundry.
3. **Testnet deployment information is distributed across repositories.** We found the Sepolia and Base Sepolia v4 PoolManager values in the official Universal Router deployment parameter files rather than one obvious testnet integration page.
4. **Router construction is a separate learning surface from hooks.** A developer building both a custom hook and Universal Router execution has to understand permission bits, PoolManager, Permit2, V4 swap command encoding, and deployment addresses at the same time.

## Missing capability or documentation

The biggest documentation gap for our use case is an end-to-end **Hardhat + TypeScript v4 hook starter** that includes:

- npm package versions;
- a minimal `beforeSwap` hook;
- CREATE2 salt mining for the hook permission bits;
- a local test that calls the hook through a PoolManager-compatible path;
- current Sepolia/Base Sepolia PoolManager, Permit2, PositionManager and Universal Router references;
- a small Universal Router v4 swap example using the same pool.

Most building blocks exist individually, but putting them together is the time-consuming part for a hackathon team.

## One improvement with the greatest impact

Provide an official **“v4 hook to first testnet swap” starter repository** for Hardhat/TypeScript as well as Foundry. The ideal starter would deploy a one-callback hook at the correct CREATE2 address, initialize a pool, seed small test liquidity, encode a Permit2 + `V4_SWAP` Universal Router transaction, and link directly to the relevant explorer transactions.

That would let teams spend more time on differentiated hook behavior and less time reconstructing deployment plumbing.

## Security / design feedback

For a real-world-asset market, hooks are powerful but should not be treated as the sole compliance layer. Tora-x125 uses the hook for **pool market policy**—for example, active/suspended state and swap-size limits—while identity, jurisdictional eligibility and legally required transfer restrictions remain separate application or asset-layer controls.

This separation was important for us because the router or hook caller is not necessarily the end investor, and arbitrary `hookData` should not be treated as authenticated identity by itself.

## Code references

- Tora v4 hook: https://github.com/veritas-repo/Tora-x125/blob/main/contracts/uniswap/ToraImpactHook.sol
- CREATE2 hook deployer: https://github.com/veritas-repo/Tora-x125/blob/main/contracts/uniswap/HookCreate2Factory.sol
- Hook deployment script: https://github.com/veritas-repo/Tora-x125/blob/main/scripts/deploy-uniswap-hook.ts
- Universal Router helper: https://github.com/veritas-repo/Tora-x125/blob/main/lib/uniswap.ts
- Hook tests: https://github.com/veritas-repo/Tora-x125/blob/main/test/ToraImpactHook.js
