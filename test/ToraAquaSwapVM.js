const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Tora Aqua + SwapVM impact position", function () {
  const e18 = (n) => ethers.parseUnits(String(n), 18);

  async function deployFixture() {
    const [owner, maker, taker] = await ethers.getSigners();

    const Aqua = await ethers.getContractFactory("Aqua");
    const aqua = await Aqua.deploy();
    await aqua.waitForDeployment();

    const Router = await ethers.getContractFactory("ToraImpactAquaRouter");
    const router = await Router.deploy(
      await aqua.getAddress(),
      ethers.ZeroAddress,
      owner.address
    );
    await router.waitForDeployment();

    const Builder = await ethers.getContractFactory("ToraAquaPositionBuilder");
    const builder = await Builder.deploy();
    await builder.waitForDeployment();

    const Token = await ethers.getContractFactory("AquaDemoToken");
    const first = await Token.deploy("Tora Impact Unit", "TIU");
    const second = await Token.deploy("Demo USDC", "dUSDC");
    await first.waitForDeployment();
    await second.waitForDeployment();

    const firstAddress = await first.getAddress();
    const secondAddress = await second.getAddress();
    const [tokenA, tokenB] =
      firstAddress.toLowerCase() < secondAddress.toLowerCase()
        ? [first, second]
        : [second, first];

    await tokenA.mint(maker.address, e18(1_000_000));
    await tokenB.mint(maker.address, e18(1_000_000));
    await tokenA.mint(taker.address, e18(25_000));

    await tokenA.connect(maker).approve(await aqua.getAddress(), ethers.MaxUint256);
    await tokenB.connect(maker).approve(await aqua.getAddress(), ethers.MaxUint256);
    await tokenA.connect(taker).approve(await router.getAddress(), ethers.MaxUint256);

    return { owner, maker, taker, aqua, router, builder, tokenA, tokenB };
  }

  function config(overrides = {}) {
    return {
      sqrtPriceMin: e18("0.8"),
      sqrtPriceMax: e18("1.2"),
      decayPeriod: 300,
      lpFeeBps: 30_000,
      riskPremiumBps: 500,
      impactDiscountBps: 750,
      deadline: 0,
      salt: 125,
      ...overrides
    };
  }

  async function buildAndShip({
    maker,
    aqua,
    router,
    builder,
    tokenA,
    tokenB,
    positionConfig,
    liquidity = e18(100_000)
  }) {
    const builtOrder = await builder.buildOrder(
      maker.address,
      await tokenA.getAddress(),
      await tokenB.getAddress(),
      positionConfig
    );
    const order = {
      maker: builtOrder.maker,
      traits: builtOrder.traits,
      data: builtOrder.data
    };

    const encodedOrder = ethers.AbiCoder.defaultAbiCoder().encode(
      ["tuple(address maker,uint256 traits,bytes data)"],
      [[order.maker, order.traits, order.data]]
    );

    const orderHash = await router.hash(order);
    expect(ethers.keccak256(encodedOrder)).to.equal(orderHash);

    await aqua.connect(maker).ship(
      await router.getAddress(),
      encodedOrder,
      [await tokenA.getAddress(), await tokenB.getAddress()],
      [liquidity, liquidity]
    );

    return { order, orderHash };
  }

  it("builds a custom opcode + official SwapVM concentrated position", async function () {
    const { builder } = await deployFixture();
    const program = await builder.buildProgram(config({ deadline: 0 }));

    // Custom Tora opcode 0xd0 followed by a 4-byte argument payload.
    expect(program.slice(0, 6)).to.equal("0xd004");
    // The rest of the program is built from official SwapVM instructions:
    // Decay -> FeeFlatIn -> XYCConcentrateSwap -> Salt.
    expect(program.length).to.be.greaterThan(20);
  });

  it("executes real Aqua token transfers through the custom SwapVM app", async function () {
    const fixture = await deployFixture();
    const { maker, taker, aqua, router, builder, tokenA, tokenB } = fixture;

    const { order, orderHash } = await buildAndShip({
      ...fixture,
      positionConfig: config()
    });

    const amountIn = e18(1_000);
    const takerData = await builder.buildTakerData(
      taker.address,
      true,
      true,
      0,
      0
    );

    const quote = await router.quote.staticCall(order, amountIn, takerData);
    expect(quote.amountIn).to.equal(amountIn);
    expect(quote.amountOut).to.be.greaterThan(0n);

    const before = {
      takerIn: await tokenA.balanceOf(taker.address),
      takerOut: await tokenB.balanceOf(taker.address),
      makerIn: await tokenA.balanceOf(maker.address),
      makerOut: await tokenB.balanceOf(maker.address)
    };

    await expect(
      router.connect(taker).swap(order, amountIn, takerData)
    ).to.emit(router, "Swapped");

    const after = {
      takerIn: await tokenA.balanceOf(taker.address),
      takerOut: await tokenB.balanceOf(taker.address),
      makerIn: await tokenA.balanceOf(maker.address),
      makerOut: await tokenB.balanceOf(maker.address)
    };

    expect(before.takerIn - after.takerIn).to.equal(quote.amountIn);
    expect(after.takerOut - before.takerOut).to.equal(quote.amountOut);
    expect(after.makerIn - before.makerIn).to.equal(quote.amountIn);
    expect(before.makerOut - after.makerOut).to.equal(quote.amountOut);

    const [virtualIn] = await aqua.rawBalances(
      maker.address,
      await router.getAddress(),
      orderHash,
      await tokenA.getAddress()
    );
    const [virtualOut] = await aqua.rawBalances(
      maker.address,
      await router.getAddress(),
      orderHash,
      await tokenB.getAddress()
    );

    expect(virtualIn).to.equal(e18(100_000) + quote.amountIn);
    expect(virtualOut).to.equal(e18(100_000) - quote.amountOut);
  });

  it("uses the custom SwapVM opcode to price impact and risk differently", async function () {
    const fixture = await deployFixture();
    const { maker, taker, router, builder } = fixture;

    const risk = await buildAndShip({
      ...fixture,
      positionConfig: config({
        riskPremiumBps: 1_500,
        impactDiscountBps: 0,
        salt: 201
      })
    });

    const impact = await buildAndShip({
      ...fixture,
      positionConfig: config({
        riskPremiumBps: 0,
        impactDiscountBps: 1_500,
        salt: 202
      })
    });

    const amountIn = e18(1_000);
    const takerData = await builder.buildTakerData(
      taker.address,
      true,
      true,
      0,
      0
    );

    const riskQuote = await router.quote.staticCall(
      risk.order,
      amountIn,
      takerData
    );
    const impactQuote = await router.quote.staticCall(
      impact.order,
      amountIn,
      takerData
    );

    expect(impactQuote.amountOut).to.be.greaterThan(riskQuote.amountOut);
  });
});
