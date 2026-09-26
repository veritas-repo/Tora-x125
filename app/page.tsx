"use client";

import { useMemo, useState } from "react";
import { BrowserProvider } from "ethers";

const projects = [
  {
    id: 1,
    name: "Tokyo Bay Solar Bond",
    issuer: "tokyobay.tora.eth",
    type: "Renewable Energy",
    location: "Japan",
    network: "Ethereum",
    price: "$1,012",
    yield: "7.4%",
    maturity: "Sep 2027",
    impact: 88,
    risk: 24,
    liquidity: "$420k",
    metric: "1,840 tCO₂e avoided / yr",
    repayment: "Quarterly"
  },
  {
    id: 2,
    name: "Queensland Biochar Removal",
    issuer: "biochar.tora.eth",
    type: "Carbon Removal",
    location: "Australia",
    network: "Base",
    price: "$987",
    yield: "8.1%",
    maturity: "Mar 2028",
    impact: 93,
    risk: 31,
    liquidity: "$265k",
    metric: "12,500 tCO₂e contracted",
    repayment: "Semi-annual"
  },
  {
    id: 3,
    name: "Osaka Efficiency Retrofit",
    issuer: "osaka.tora.eth",
    type: "Energy Efficiency",
    location: "Japan",
    network: "Base",
    price: "$1,004",
    yield: "6.8%",
    maturity: "Dec 2027",
    impact: 81,
    risk: 19,
    liquidity: "$310k",
    metric: "22% energy reduction",
    repayment: "Quarterly"
  }
];

declare global {
  interface Window {
    ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };
  }
}

export default function Home() {
  const [account, setAccount] = useState("");
  const [chain, setChain] = useState("");
  const [selected, setSelected] = useState(projects[0]);
  const [status, setStatus] = useState("Ready");

  const shortAccount = useMemo(
    () => (account ? account.slice(0, 6) + "…" + account.slice(-4) : "Connect wallet"),
    [account]
  );

  async function connectWallet() {
    if (!window.ethereum) {
      setStatus("Install MetaMask or another EIP-1193 wallet.");
      return;
    }
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      setAccount(await signer.getAddress());
      setChain(network.name === "unknown" ? network.chainId.toString() : network.name);
      setStatus("Wallet connected");
    } catch {
      setStatus("Wallet connection cancelled.");
    }
  }

  async function previewSwap() {
    setStatus(
      "Trade preview: Uniswap v4 provides programmable liquidity; 1inch optimises routing and stablecoin settlement."
    );
  }

  return (
    <main>
      <header className="topbar">
        <div className="brand">
          <div className="mark">T</div>
          <div>
            <strong>Tora-x125</strong>
            <span>Verified · Tokenised · Liquid</span>
          </div>
        </div>
        <button className="wallet" onClick={connectWallet}>{shortAccount}</button>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">SECONDARY MARKET FOR VERIFIED IMPACT INVESTMENTS</p>
          <h1>Turn verified impact assets into programmable liquidity.</h1>
          <p className="lead">
            Tora-x125 fractionalises green investments into tradable tokens with project,
            financial and impact data linked onchain across Ethereum and Base.
          </p>
          <div className="heroActions">
            <button className="primary" onClick={() => document.getElementById("market")?.scrollIntoView()}>
              Explore market
            </button>
            <span>{account ? `Connected · ${chain}` : "Ethereum + Base testnet MVP"}</span>
          </div>
        </div>
        <div className="heroCard">
          <span>PROGRAMMABLE MARKET</span>
          <strong>$995k</strong>
          <small>Demo liquidity across verified impact assets</small>
          <div className="metricRow"><b>v4</b><span>Uniswap liquidity + hooks</span></div>
          <div className="metricRow"><b>1inch</b><span>Optimised routing</span></div>
          <div className="metricRow"><b>World ID</b><span>Private verification</span></div>
        </div>
      </section>

      <section id="market" className="section">
        <div className="sectionHead">
          <div><p className="eyebrow">MARKET</p><h2>Tokenised impact investments</h2></div>
          <span className="pill">Uniswap v4 + 1inch</span>
        </div>
        <div className="marketGrid">
          <div className="table">
            <div className="row header">
              <span>Asset</span><span>Price</span><span>Yield</span><span>Liquidity</span>
            </div>
            {projects.map((project) => (
              <button key={project.id} className={"row assetRow " + (selected.id === project.id ? "active" : "")} onClick={() => setSelected(project)}>
                <span><b>{project.name}</b><small>{project.type} · {project.location} · {project.network}</small></span>
                <span>{project.price}</span>
                <span>{project.yield}</span>
                <span>{project.liquidity}</span>
              </button>
            ))}
          </div>

          <aside className="detail">
            <p className="eyebrow">VERIFIED ASSET #{selected.id}</p>
            <h3>{selected.name}</h3>
            <p>{selected.issuer} · {selected.network}</p>
            <div className="scoreGrid">
              <div><span>Impact</span><strong>{selected.impact}/100</strong></div>
              <div><span>Risk</span><strong>{selected.risk}/100</strong></div>
            </div>
            <dl>
              <div><dt>Verified outcome</dt><dd>{selected.metric}</dd></div>
              <div><dt>Repayment</dt><dd>{selected.repayment}</dd></div>
              <div><dt>Maturity</dt><dd>{selected.maturity}</dd></div>
              <div><dt>Identity</dt><dd>ENS</dd></div>
              <div><dt>Investor verification</dt><dd>World ID</dd></div>
              <div><dt>Token standard</dt><dd>ERC-1155</dd></div>
            </dl>
            <button className="primary full" onClick={previewSwap}>Preview secondary trade</button>
          </aside>
        </div>
      </section>

      <section className="flow section">
        <p className="eyebrow">PROGRAMMABLE SECONDARY LIQUIDITY</p>
        <h2>From verified project to tradable impact asset</h2>
        <div className="steps">
          <div><b>01</b><h3>Tokenise</h3><p>Solidity and OpenZeppelin fractionalise impact investments into ERC-1155 units.</p></div>
          <div><b>02</b><h3>Verify</h3><p>ENS provides readable identities while World ID supports privacy-preserving investor verification.</p></div>
          <div><b>03</b><h3>Trade</h3><p>Uniswap v4 provides programmable liquidity and 1inch optimises routing and stablecoin settlement.</p></div>
        </div>
      </section>

      <footer>
        <span>{status}</span>
        <span>Ethereum · Base · Sui architecture explored</span>
      </footer>
    </main>
  );
}
