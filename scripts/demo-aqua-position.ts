import { ethers } from "hardhat";

const e18 = (n: string | number) => ethers.parseUnits(String(n), 18);

async function main() {
  const [owner, maker, taker] = await ethers.getSigners();

  console.log("Tora-x125 / 1inch Aqua + SwapVM local onchain demo");
  console.log("maker:", maker.address);
  console.log("taker:", taker.address);

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

  const aquaAddress = await aqua.getAddress();
  const routerAddress = await router.getAddress();

  await tokenA.mint(maker.address, e18(1_000_000));
  await tokenB.mint(maker.address, e18(1_000_000));
  await tokenA.mint(taker.address, e18(25_000));

  await tokenA.connect(maker).approve(aquaAddress, ethers.MaxUint256);
  await tokenB.connect(maker).approve(aquaAddress, ethers.MaxUint256);
  await tokenA.connect(taker).approve(routerAddress, ethers.MaxUint256);

  const config = {
    sqrtPriceMin: e18("0.8"),
    sqrtPriceMax: e18("1.2"),
    decayPeriod: 300,
    lpFeeBps: 30_000,
    riskPremiumBps: 500,
    impactDiscountBps: 750,
    deadline: 0,
    salt: 125
  };

  const order = await builder.buildOrder(
    maker.address,
    await tokenA.getAddress(),
    await tokenB.getAddress(),
    config
  );

  const encodedOrder = ethers.AbiCoder.defaultAbiCoder().encode(
    ["tuple(address maker,uint256 traits,bytes data)"],
    [[order.maker, order.traits, order.data]]
  );
  const orderHash = await router.hash(order);

  const shipTx = await aqua.connect(maker).ship(
    routerAddress,
    encodedOrder,
    [await tokenA.getAddress(), await tokenB.getAddress()],
    [e18(100_000), e18(100_000)]
  );
  const shipReceipt = await shipTx.wait();

  console.log("\nOfficial Aqua:", aquaAddress);
  console.log("Custom AquaSwapVM app:", routerAddress);
  console.log("Aqua strategy/order hash:", orderHash);
  console.log("Ship tx:", shipReceipt?.hash);

  const amountIn = e18(1_000);
  const takerData = await builder.buildTakerData(
    taker.address,
    true,
    true,
    0,
    0
  );
  const quote = await router.quote.staticCall(order, amountIn, takerData);

  console.log("\nSwapVM quote");
  console.log("amount in :", ethers.formatUnits(quote.amountIn, 18));
  console.log("amount out:", ethers.formatUnits(quote.amountOut, 18));

  const before = {
    takerIn: await tokenA.balanceOf(taker.address),
    takerOut: await tokenB.balanceOf(taker.address),
    makerIn: await tokenA.balanceOf(maker.address),
    makerOut: await tokenB.balanceOf(maker.address)
  };

  const swapTx = await router.connect(taker).swap(order, amountIn, takerData);
  const swapReceipt = await swapTx.wait();

  const after = {
    takerIn: await tokenA.balanceOf(taker.address),
    takerOut: await tokenB.balanceOf(taker.address),
    makerIn: await tokenA.balanceOf(maker.address),
    makerOut: await tokenB.balanceOf(maker.address)
  };

  console.log("\nOnchain SwapVM execution");
  console.log("swap tx:", swapReceipt?.hash);
  console.log(
    "taker tokenIn delta :",
    ethers.formatUnits(after.takerIn - before.takerIn, 18)
  );
  console.log(
    "taker tokenOut delta:",
    ethers.formatUnits(after.takerOut - before.takerOut, 18)
  );
  console.log(
    "maker tokenIn delta :",
    ethers.formatUnits(after.makerIn - before.makerIn, 18)
  );
  console.log(
    "maker tokenOut delta:",
    ethers.formatUnits(after.makerOut - before.makerOut, 18)
  );

  const [aquaIn] = await aqua.rawBalances(
    maker.address,
    routerAddress,
    orderHash,
    await tokenA.getAddress()
  );
  const [aquaOut] = await aqua.rawBalances(
    maker.address,
    routerAddress,
    orderHash,
    await tokenB.getAddress()
  );

  console.log("\nAqua virtual balances after execution");
  console.log("tokenIn :", ethers.formatUnits(aquaIn, 18));
  console.log("tokenOut:", ethers.formatUnits(aquaOut, 18));
  console.log("\nResult: real ERC-20 transfers settled through official Aqua + SwapVM.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
