const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ToraImpactHook", function () {
  const ALL_HOOK_MASK = (1n << 14n) - 1n;
  const BEFORE_SWAP_FLAG = 1n << 7n;

  async function deployHook() {
    const [poolManager, other] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("HookCreate2Factory");
    const factory = await Factory.deploy();
    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();

    const Hook = await ethers.getContractFactory("ToraImpactHook");
    const deployTx = await Hook.getDeployTransaction(
      poolManager.address,
      poolManager.address
    );
    const initCode = deployTx.data;
    const initCodeHash = ethers.keccak256(initCode);

    let salt;
    let predicted;
    for (let i = 0n; i < 100_000n; i++) {
      const candidateSalt = ethers.zeroPadValue(ethers.toBeHex(i), 32);
      const candidate = ethers.getCreate2Address(
        factoryAddress,
        candidateSalt,
        initCodeHash
      );
      if ((BigInt(candidate) & ALL_HOOK_MASK) === BEFORE_SWAP_FLAG) {
        salt = candidateSalt;
        predicted = candidate;
        break;
      }
    }

    expect(predicted).to.not.equal(undefined);
    await (await factory.deploy(salt, initCode)).wait();

    const hook = await ethers.getContractAt("ToraImpactHook", predicted);
    return { hook, poolManager, other };
  }

  function poolKey(hookAddress) {
    return {
      currency0: ethers.ZeroAddress,
      currency1: "0x0000000000000000000000000000000000001000",
      fee: 3000,
      tickSpacing: 60,
      hooks: hookAddress
    };
  }

  function swapParams(amountSpecified) {
    return {
      zeroForOne: true,
      amountSpecified,
      sqrtPriceLimitX96: 4295128740n
    };
  }

  it("deploys at a valid BEFORE_SWAP-only v4 hook address", async function () {
    const { hook } = await deployHook();
    const address = await hook.getAddress();
    expect(BigInt(address) & ALL_HOOK_MASK).to.equal(BEFORE_SWAP_FLAG);
  });

  it("enforces active-market and maximum-swap policy before a v4 swap", async function () {
    const { hook, poolManager } = await deployHook();
    const key = poolKey(await hook.getAddress());
    const verificationHash = ethers.keccak256(
      ethers.toUtf8Bytes("verified-project-state-v1")
    );

    await hook.setMarketPolicy(key, true, 1_000n, verificationHash);

    const preview = await hook.previewSwapPolicy(key, swapParams(-500n));
    expect(preview.allowed).to.equal(true);
    expect(preview.absoluteSwapAmount).to.equal(500n);

    await expect(
      hook
        .connect(poolManager)
        .beforeSwap(poolManager.address, key, swapParams(-500n), "0x")
    ).to.emit(hook, "SwapPolicyChecked");

    await expect(
      hook
        .connect(poolManager)
        .beforeSwap(poolManager.address, key, swapParams(-1_001n), "0x")
    ).to.be.revertedWithCustomError(hook, "SwapSizeExceeded");
  });

  it("fails closed for disabled markets and non-PoolManager callers", async function () {
    const { hook, poolManager, other } = await deployHook();
    const key = poolKey(await hook.getAddress());

    await hook.setMarketPolicy(key, false, 1_000n, ethers.ZeroHash);

    await expect(
      hook
        .connect(poolManager)
        .beforeSwap(poolManager.address, key, swapParams(-100n), "0x")
    ).to.be.revertedWithCustomError(hook, "MarketDisabled");

    await expect(
      hook
        .connect(other)
        .beforeSwap(other.address, key, swapParams(-100n), "0x")
    ).to.be.revertedWithCustomError(hook, "OnlyPoolManager");
  });
});
