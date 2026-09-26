<p align="center">
  <img src="public/tora-x125-logo.svg" alt="Tora-x125" width="220" />
</p>

# Tora-x125

**A secondary market for verified, tokenised impact investments.**

Tora-x125 is built around tokenised impact assets and programmable secondary liquidity. We use smart contracts to fractionalise green investments into tradable tokens, with project, financial and impact data linked onchain. Uniswap v4 provides liquidity pools and hooks for dynamic trading logic, while 1inch optimises swap routing and stablecoin settlement. ENS gives projects and issuers readable identities, and World ID supports privacy-preserving investor verification.

The core implementation targets **Ethereum and Base**. We also explored a **Sui** implementation using Move, zkLogin and DeepBook as an alternative high-performance secondary-market architecture.

## Hackathon stack

### Ethereum developer tools

- Solidity
- OpenZeppelin
- Uniswap v4
- ethers.js / viem-compatible EVM interfaces
- MetaMask / EIP-1193 wallets
- Ethereum testnets

### Blockchain networks

- Ethereum
- Base

### Programming languages

- Solidity
- TypeScript
- JavaScript

## Architecture

```text
Investor / issuer
      |
      +---- MetaMask / EIP-1193 wallet
      |
      +---- World ID
      |       privacy-preserving investor verification
      |
      v
Next.js / TypeScript dashboard
      |
      +---- ENS
      |       readable issuer and project identities
      |
      +---- Project, financial and impact data
      |       linked to tokenised assets onchain
      |
      v
Ethereum / Base smart contracts
      |
      +---- ImpactAsset1155
      |       fractional project units
      |
      +---- ImpactToken
      |       demo ERC-20 settlement asset
      |
      +---- RepaymentVault
      |       programmable project distributions
      |
      +---- Uniswap v4
      |       liquidity pools + programmable hooks
      |
      +---- 1inch
              route optimisation + stablecoin settlement
```

## What is included

- Next.js + TypeScript investor dashboard
- EIP-1193 / MetaMask wallet connection using ethers.js
- ERC-1155 project-unit tokenisation
- ERC-20 demo settlement/liquidity token
- Repayment vault for project distributions
- Uniswap v4 / Universal Router execution helper
- 1inch routing integration adapter
- ENS name-resolution helper
- World ID integration configuration boundary
- Ethereum Sepolia and Base Sepolia deployment configuration
- Hardhat contract tests and GitHub Actions CI
- Documentation of the explored Sui / Move / zkLogin / DeepBook architecture

## Product use cases

The frontend now implements six hackathon demo views based on the supplied Tora-x125 product concepts. They share the Tora-x125 visual identity, sidebar navigation and wallet connection.

### 1. Investor dashboard — `/`

**Use case:** Give an investor a single overview of tokenised assets, trading activity and verified impact.

- Total tokenised assets, trading volume, verified CO₂e and active investors
- Featured green bonds, renewable-energy projects and carbon-removal assets
- Market overview with prices and 24-hour movement
- Recent activity and impact highlights
- Entry points into asset details and the secondary market

### 2. Project verification — `/projects`

**Use case:** Show why an impact asset is trustworthy before an investor buys it.

- Project overview and location
- Due-diligence checklist including KYC/AML, methodology and issuance approval
- Onchain audit trail for project creation, document anchoring, audits, MRV updates and token minting
- Impact and MRV metrics
- Verification/compliance status and third-party validation

### 3. Impact analytics — `/impact`

**Use case:** Let investors measure financial value alongside real-world outcomes.

- Portfolio value and aggregate verified impact
- Renewable capacity, households powered and habitat protected
- Portfolio allocation by asset type
- Impact-over-time visualisation
- Asset-level impact attribution and global project coverage

### 4. Portfolio management — `/portfolio`

**Use case:** Manage holdings, balances, distributions and portfolio actions in one place.

- Portfolio value, total return, yield earned and impact generated
- Token and stablecoin balances
- Upcoming coupons and distributions
- Verified holdings with returns and impact data
- Deposit, withdrawal, rebalancing and reward actions

### 5. Tokenised asset detail — `/assets/emerald-horizons`

**Use case:** Provide an investment-grade view of one tokenised green asset.

- Asset classification, issuer, token price, yield, maturity and supply
- Price chart and buy/sell interaction
- Impact metrics linked to the project
- Project overview and repayment summary
- Token information, secondary-market status and investor-verification requirement

### 6. Secondary market — `/market`

**Use case:** Demonstrate programmable liquidity and trading for impact assets.

- Multi-asset market ticker and market table
- Buy/sell order interaction
- Illustrative market chart, order book and recent trades
- Liquidity, spread, volume and volatility metrics
- Uniswap v4 positioned as the programmable liquidity layer
- 1inch positioned as the routing and stablecoin-settlement optimiser

The data shown in these screens is illustrative hackathon/demo data. Production deployments should replace it with indexed onchain state, verified MRV feeds, market APIs and authenticated investor data.

## Smart contracts

### ImpactAsset1155.sol

Each verified impact project is represented by an ERC-1155 token ID. Units can represent fractional ownership or economic exposure to an underlying impact investment.

Linked project data includes:

- project name and type
- location
- metadata URI
- face value
- maturity
- impact score
- risk score
- active status

### ImpactToken.sol

ERC-20 demo settlement token (`TID`) representing quote-side liquidity for the MVP.

### RepaymentVault.sol

Allows a project operator to fund per-unit repayments. Token holders can claim distributions based on their ERC-1155 holdings.

## Secondary liquidity

### Uniswap v4

Uniswap v4 is the programmable liquidity layer. The architecture is designed to support pools and hooks for dynamic trading logic, including future rules driven by asset risk, liquidity or verification state.

The repository includes a Universal Router execution helper. Network-specific router and PoolManager addresses are configured at deployment time rather than hard-coded.

### 1inch

The 1inch adapter provides a routing boundary for finding efficient swap paths and stablecoin settlement across available EVM liquidity.

For the hackathon MVP, 1inch and Uniswap v4 are complementary:

- **Uniswap v4** — primary programmable liquidity and hook logic
- **1inch** — route optimisation across available swap liquidity

## Identity and verification

### ENS

ENS is used as the readable identity layer for issuers, projects and counterparties. The frontend helper resolves ENS names through the connected EVM provider.

### World ID

World ID is the privacy-preserving investor-verification layer. The current repository exposes the application/action configuration boundary so the frontend can add proof verification without embedding personal identity data into the project-token contract.

## Networks

The core EVM implementation is designed for:

- **Ethereum** — primary smart-contract and liquidity ecosystem
- **Base** — low-cost EVM execution and secondary-market deployment

Testnet configuration is provided for:

- Ethereum Sepolia
- Base Sepolia

## Explored Sui architecture

We also explored an alternative implementation using:

- **Move** for asset and market logic
- **zkLogin** for wallet onboarding
- **DeepBook** for high-performance onchain order-book liquidity

This is an explored architecture rather than the primary implementation in this repository.

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

## Testnet deployment

Copy the environment template:

```bash
cp .env.example .env
```

### Ethereum Sepolia

```bash
npm run deploy:sepolia
```

### Base Sepolia

```bash
npm run deploy:base-sepolia
```

The deployment script creates:

1. `ImpactToken`
2. `ImpactAsset1155`
3. `RepaymentVault`
4. sample project: **Tokyo Bay Solar Bond**

## Demo flow

1. Connect MetaMask.
2. Browse verified tokenised impact investments.
3. Inspect project, financial, impact, risk and repayment information.
4. Resolve readable issuer/project identity through ENS.
5. Verify investor eligibility through the World ID integration boundary.
6. Preview programmable liquidity through Uniswap v4.
7. Use the 1inch adapter for optimised routing / settlement.
8. Deploy the same EVM contracts to Ethereum Sepolia or Base Sepolia.

## MVP scope

Tora-x125 is a hackathon MVP demonstrating the architecture for a secondary market in verified, tokenised impact investments.

Before production use, add audited transfer restrictions, regulatory/eligibility controls, production Uniswap v4 hook logic, production 1inch API execution, server-side World ID proof verification, verified impact-data oracles, indexing, robust repayment snapshots and a smart-contract security review.

## Commands

```bash
npm run dev
npm run build
npm run contracts:compile
npm run contracts:test
npm run deploy:sepolia
npm run deploy:base-sepolia
```

## License

Hackathon prototype. Add a production license before commercial deployment.
