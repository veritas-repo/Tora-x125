import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const Token = await ethers.getContractFactory("ImpactToken");
  const token = await Token.deploy();
  await token.waitForDeployment();

  const Asset = await ethers.getContractFactory("ImpactAsset1155");
  const asset = await Asset.deploy();
  await asset.waitForDeployment();

  const Vault = await ethers.getContractFactory("RepaymentVault");
  const vault = await Vault.deploy(await token.getAddress(), await asset.getAddress());
  await vault.waitForDeployment();

  const now = Math.floor(Date.now() / 1000);
  const createTx = await asset.createProject(
    deployer.address,
    1000,
    "Tokyo Bay Solar Bond",
    "Renewable Energy",
    "Japan",
    "ipfs://tora-x125/tokyo-bay-solar.json",
    ethers.parseUnits("1000", 18),
    now + 365 * 24 * 60 * 60,
    88,
    24
  );
  await createTx.wait();

  console.log("ImpactToken:", await token.getAddress());
  console.log("ImpactAsset1155:", await asset.getAddress());
  console.log("RepaymentVault:", await vault.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
