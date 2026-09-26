const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Tora-x125 contracts", function () {
  it("mints ERC-1155 project units with impact/risk metadata", async function () {
    const [, investor] = await ethers.getSigners();
    const Asset = await ethers.getContractFactory("ImpactAsset1155");
    const asset = await Asset.deploy();
    await asset.waitForDeployment();

    const latest = await ethers.provider.getBlock("latest");
    const maturity = latest.timestamp + 86400;

    await asset.createProject(
      investor.address,
      1000,
      "Tokyo Bay Solar Bond",
      "Renewable Energy",
      "Japan",
      "ipfs://project.json",
      ethers.parseEther("1000"),
      maturity,
      88,
      24
    );

    expect(await asset.balanceOf(investor.address, 1)).to.equal(1000n);
    const project = await asset.projects(1);
    expect(project.name).to.equal("Tokyo Bay Solar Bond");
    expect(project.impactScore).to.equal(88n);
    expect(project.riskScore).to.equal(24n);
  });

  it("creates ERC-20 settlement supply for demo liquidity", async function () {
    const [owner] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("ImpactToken");
    const token = await Token.deploy();
    await token.waitForDeployment();

    expect(await token.balanceOf(owner.address)).to.equal(ethers.parseEther("1000000"));
  });
});
