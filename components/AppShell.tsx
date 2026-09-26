"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { BrowserProvider } from "ethers";

const nav = [
  { href: "/", label: "Dashboard", icon: "⌂" },
  { href: "/assets/emerald-horizons", label: "Invest", icon: "◒" },
  { href: "/market", label: "Secondary Market", icon: "▥" },
  { href: "/aqua-position", label: "Aqua Position", icon: "≈" },
  { href: "/impact", label: "Impact", icon: "♧" },
  { href: "/portfolio", label: "Portfolio", icon: "▣" },
  { href: "/analytics", label: "Analytics", icon: "⌁" },
  { href: "/projects", label: "Projects", icon: "▦" },
  { href: "/world-agents", label: "World Agent", icon: "◎" }
];

declare global {
  interface Window {
    ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };
  }
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [account, setAccount] = useState("");
  const [message, setMessage] = useState("Ethereum + Base");

  const shortAccount = useMemo(
    () => account ? account.slice(0, 6) + "…" + account.slice(-4) : "Connect",
    [account]
  );

  async function connect() {
    if (!window.ethereum) {
      setMessage("Install MetaMask");
      return;
    }
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      setAccount(await signer.getAddress());
      const network = await provider.getNetwork();
      setMessage(network.name === "unknown" ? `Chain ${network.chainId}` : network.name);
    } catch {
      setMessage("Connection cancelled");
    }
  }

  return (
    <div className="appShell">
      <aside className="sidebar">
        <Link href="/" className="logoWrap" aria-label="Tora-x125 home">
          <img src="/tora-x125-logo.svg" alt="Tora-x125 logo" className="logo" />
        </Link>

        <nav className="nav">
          {nav.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link href={item.href} className={active ? "navItem active" : "navItem"} key={item.href}>
                <span className="navIcon">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="sideDivider" />
        <div className="nav secondary">
          <button className="navItem ghost"><span className="navIcon">♢</span>Notifications <b className="badge">3</b></button>
          <button className="navItem ghost"><span className="navIcon">⚙</span>Settings</button>
        </div>

        <div className="brandCard">
          <span className="leaf">♧</span>
          <strong>Real Assets.<br/>Real Impact.<br/>A Greener Tomorrow.</strong>
          <i />
        </div>
      </aside>

      <section className="contentArea">
        <header className="topbar">
          <div className="search">⌕ <span>Search assets, projects, or tokens...</span></div>
          <div className="topActions">
            <span>◎ USD⌄</span>
            <button className="walletBtn" onClick={connect}>◉ {shortAccount}</button>
            <span className="avatar">TK</span>
          </div>
        </header>
        <div className="networkNote">{message}</div>
        {children}
      </section>
    </div>
  );
}
