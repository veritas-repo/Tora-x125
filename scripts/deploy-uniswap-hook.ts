import { ethers, network } from "hardhat";

const OFFICIAL_V4_POOL_MANAGERS: Record<string, string> = {
  sepolia: "0xE03A1074c86CFeDd5C142C4F04F1a1536e203543",
  baseSepolia: "0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408"
};

// Uniswap v4 hook permission bits occupy the low 14 bits.
// ToraImpactHook enables BEFORE_SWAP only (1 << 7).
const ALL_HOOK_MASK = (1n << 14n) - 1n;
const BEFORE_SWAP_FLAG = 1n << 7n;

function toSalt(value: bigint) {
  return ethers.zeroPadValue(ethers.toBeHex(value), 32);
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const poolManager =
    process.env.UNISWAP_V4_POOL_MANAGER_ADDRESS ||
    OFFICIAL_V4_POOL_MANAGERS[network.name];

  if (!poolManager) {
    throw new Error(
      "Set UNISWAP_V4_POOL_MANAGER_ADDRESS for this network."
    );
  }

  console.log("Network:", network.name);
  console.log("Deployer:", deployer.address);
  console.log("Uniswap v4 PoolManager:", poolManager);

  const Factory = await ethers.getContractFactory("HookCreate2Factory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();

  const Hook = await ethers.getContractFactory("ToraImpactHook");
  const deployTx = await Hook.getDeployTransaction(poolManager, deployer.address);
  if (!deployTx.data) throw new Error("Unable to construct hook init code.");

  const initCode = deployTx.data;
  const initCodeHash = ethers.keccak256(initCode);

  let salt: string | undefined;
  let predicted: string | undefined;

  for (let i = 0n; i < 500_000n; i++) {
    const candidateSalt = toSalt(i);
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

  if (!salt || !predicted) {
    throw new Error("Unable to mine a CREATE2 salt for BEFORE_SWAP hook flags.");
  }

  console.log("Hook CREATE2 salt:", salt);
  console.log("Predicted hook:", predicted);

  const tx = await factory.deploy(salt, initCode);
  await tx.wait();

  const code = await ethers.provider.getCode(predicted);
  if (code === "0x") throw new Error("Hook deployment did not produce bytecode.");

  console.log("\nUniswap v4 integration deployed");
  console.log("HookCreate2Factory:", factoryAddress);
  console.log("ToraImpactHook:", predicted);
  console.log("Permission flags: BEFORE_SWAP only");
  console.log(
    JSON.stringify(
      {
        network: network.name,
        chainId: (await ethers.provider.getNetwork()).chainId.toString(),
        poolManager,
        hookCreate2Factory: factoryAddress,
        toraImpactHook: predicted,
        hookFlags: "BEFORE_SWAP",
        salt
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
