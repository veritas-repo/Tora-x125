"use client";

import { useMemo, useState } from "react";
import { BrowserProvider, formatUnits } from "ethers";

const projects = [
  {
    id: 1,
    name: "Tokyo Bay Solar Bond",
    type: "Renewable Energy",
    location: "Japan",
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
    type: "Carbon Removal",
    location: "Australia",
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
    type: "Energy Efficiency",
    location: "Japan",
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
      "Uniswap v4 route prepared: ERC-1155 units are wrapped/listed against TID settlement liquidity through the Universal Router integration layer."
    );
  }

  return (
    <main>
      <header className="topbar">
        <div className="brand">
          <div className="mark">T</div>
          <div>
            <strong>Tora-x125</strong>
            <span>Verified impact liquidity</span>
          </div>
        </div>
        <button className="wallet" onClick={connectWallet}>{shortAccount}</button>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">SECONDARY MARKET FOR IMPACT ASSETS</p>
          <h1>Unlock liquidity from verified climate investments.</h1>
          <p className="lead">
            Fractionalised green bonds and carbon-removal projects with transparent impact,
            risk, repayment and onchain market data.
          </p>
          <div className="heroActions">
            <button className="primary" onClick={() => document.getElementById("market")?.scrollIntoView()}>
              Explore market
            </button>
            <span>{account ? `Connected · ${chain}` : "Sepolia-ready MVP"}</span>
          </div>
        </div>
        <div className="heroCard">
          <span>MARKET OVERVIEW</span>
          <strong>$995k</strong>
          <small>Demo liquidity across verified assets</small>
          <div className="metricRow"><b>3</b><span>Live projects</span></div>
          <div className="metricRow"><b>87</b><span>Avg impact score</span></div>
          <div className="metricRow"><b>25</b><span>Avg risk score</span></div>
        </div>
      </section>

      <section id="market" className="section">
        <div className="sectionHead">
          <div><p className="eyebrow">MARKET</p><h2>Impact investments</h2></div>
          <span className="pill">Uniswap v4 liquidity layer</span>
        </div>
        <div className="marketGrid">
          <div className="table">
            <div className="row header">
              <span>Asset</span><span>Price</span><span>Yield</span><span>Liquidity</span>
            </div>
            {projects.map((project) => (
              <button key={project.id} className={"row assetRow " + (selected.id === project.id ? "active" : "")} onClick={() => setSelected(project)}>
                <span><b>{project.name}</b><small>{project.type} · {project.location}</small></span>
                <span>{project.price}</span>
                <span>{project.yield}</span>
                <span>{project.liquidity}</span>
              </button>
            ))}
          </div>

          <aside className="detail">
            <p className="eyebrow">ASSET #{selected.id}</p>
            <h3>{selected.name}</h3>
            <p>{selected.type} · {selected.location}</p>
            <div className="scoreGrid">
              <div><span>Impact</span><strong>{selected.impact}/100</strong></div>
              <div><span>Risk</span><strong>{selected.risk}/100</strong></div>
            </div>
            <dl>
              <div><dt>Verified outcome</dt><dd>{selected.metric}</dd></div>
              <div><dt>Repayment</dt><dd>{selected.repayment}</dd></div>
              <div><dt>Maturity</dt><dd>{selected.maturity}</dd></div>
              <div><dt>Token standard</dt><dd>ERC-1155</dd></div>
            </dl>
            <button className="primary full" onClick={previewSwap}>Preview secondary trade</button>
          </aside>
        </div>
      </section>

      <section className="flow section">
        <p className="eyebrow">HOW IT WORKS</p>
        <h2>From verified project to liquid market</h2>
        <div className="steps">
          <div><b>01</b><h3>Tokenise</h3><p>Impact assets are issued as fractional ERC-1155 units.</p></div>
          <div><b>02</b><h3>Verify</h3><p>Project, impact, risk and repayment metadata travel with the asset record.</p></div>
          <div><b>03</b><h3>Trade</h3><p>Settlement liquidity is designed for routing through Uniswap v4.</p></div>
        </div>
      </section>

      <footer>
        <span>{status}</span>
        <span>Built for ETHGlobal Tokyo 2026</span>
      </footer>
    </main>
  );
}
