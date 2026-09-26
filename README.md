# Tora-x125

A secondary market MVP for verified impact investments, built for ETHGlobal Tokyo 2026.

Tora-x125 tokenises impact assets such as green bonds, renewable-energy projects and carbon-removal projects, exposes impact/risk/repayment information to investors, and provides an integration boundary for secondary-market liquidity through Uniswap v4.

## What is included

- Next.js + TypeScript investor dashboard
- EIP-1193 wallet connection using ethers.js
- ERC-1155 project-unit tokenisation
- ERC-20 demo settlement/liquidity token
- Repayment vault for project distributions
- Uniswap v4 / Universal Router integration boundary
- Hardhat deployment script for Sepolia
- Contract tests and GitHub Actions CI

## Architecture

```text
Investor wallet
     |
     v
Next.js dashboard
     |
     +---- reads project / market metadata
     |
     +---- Ethereum provider (ethers.js)
                 |
                 +---- ImpactAsset1155
                 |       fractional project units
                 |
                 +---- ImpactToken
                 |       demo settlement / quote token
                 |
                 +---- RepaymentVault
                 |       project distributions
                 |
                 +---- Uniswap Universal Router / v4
                         secondary-market routing layer
```

### Contracts

**ImpactAsset1155.sol**

Each project is represented by an ERC-1155 token ID. Units can represent fractional ownership or economic exposure to an underlying impact investment.

Stored metadata includes:

- project name and type
- location
- metadata URI
- face value
- maturity
- impact score
- risk score
- active status

**ImpactToken.sol**

ERC-20 demo settlement token (`TID`) used to represent quote-side liquidity in the MVP.

**RepaymentVault.sol**

Allows the project operator to fund per-unit repayments. Token holders can claim distributions based on their ERC-1155 balance.

### Uniswap v4

The MVP is structured to route secondary-market liquidity through the Uniswap Universal Router and v4 command path.

The repository deliberately does not hard-code a Universal Router or PoolManager address because these are network-specific. Configure the testnet deployment using:

```bash
NEXT_PUBLIC_UNISWAP_UNIVERSAL_ROUTER_ADDRESS=
```

The current UI exposes the v4 trading layer as a demo integration boundary. For production trading, encode Permit2 + `V4_SWAP` commands using the official Uniswap v4 SDK/contracts for the chosen network, then submit the route from the connected wallet.

A practical production architecture is:

```text
ERC-1155 project units
        |
        v
fungible pool representation / wrapper
        |
        v
Permit2
        |
        v
Universal Router
        |
        v
Uniswap v4 PoolManager
```

## Local setup

### Requirements

- Node.js 20+
- npm
- MetaMask or another EIP-1193-compatible wallet

### Install

```bash
npm install
```

### Run the dashboard

```bash
npm run dev
```

Open `http://localhost:3000`.

### Compile contracts

```bash
npm run contracts:compile
```

### Run contract tests

```bash
npm run contracts:test
```

### Build the frontend

```bash
npm run build
```

## Sepolia deployment

Copy the environment template:

```bash
cp .env.example .env
```

Set:

```bash
SEPOLIA_RPC_URL=
DEPLOYER_PRIVATE_KEY=
NEXT_PUBLIC_CHAIN_ID=11155111
```

Then deploy:

```bash
npm run deploy:sepolia
```

The script deploys:

1. `ImpactToken`
2. `ImpactAsset1155`
3. `RepaymentVault`
4. one sample project: **Tokyo Bay Solar Bond**

Copy the deployed contract addresses into `.env.local` for the frontend.

## Demo flow

1. Connect a wallet.
2. Browse tokenised impact investments.
3. Select a project to inspect yield, maturity, impact, risk and repayment data.
4. Use the secondary-trade action to demonstrate the Uniswap v4 liquidity path.
5. On Sepolia, deploy the contracts and replace demo data with live contract reads.

## MVP scope

The current version is a hackathon MVP. It demonstrates the tokenisation, investor information model, wallet UX, repayment model and Uniswap-v4 integration architecture.

Before production use, add:

- audited issuance and transfer restrictions
- identity / investor eligibility controls where required
- a defined ERC-1155-to-fungible liquidity representation
- production Permit2 + Universal Router transaction encoding
- oracle-backed pricing and verified impact data
- contract indexing
- robust repayment snapshots or record-date mechanics
- smart-contract security review

## Commands

```bash
npm run dev
npm run build
npm run contracts:compile
npm run contracts:test
npm run deploy:sepolia
```

## License

Hackathon prototype. Add a production license before commercial deployment.
