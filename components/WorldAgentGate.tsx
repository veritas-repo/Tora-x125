"use client";

import { useEffect, useState } from "react";
import type { WorldAgentStatus } from "@/lib/worldid";

type ActionResult = {
  ok?: boolean;
  actionExecuted?: boolean;
  authorizationId?: string;
  expiresAt?: number;
  order?: { asset: string; side: "Buy" | "Sell"; amount: string };
  nextStep?: string;
  error?: string;
  message?: string;
};

const initialStatus: WorldAgentStatus = {
  configured: false,
  verified: false,
  issuer: "https://sandbox.auth.world.org"
};

export default function WorldAgentGate() {
  const [status, setStatus] = useState<WorldAgentStatus>(initialStatus);
  const [journey, setJourney] = useState("Ready to request fresh human verification.");
  const [busy, setBusy] = useState(false);
  const [action, setAction] = useState<ActionResult | null>(null);
  const [asset, setAsset] = useState("TORA-GB01");
  const [side, setSide] = useState<"Buy" | "Sell">("Buy");
  const [amount, setAmount] = useState("1000");

  async function refreshStatus() {
    const response = await fetch("/api/world/status", { cache: "no-store" });
    const data = (await response.json()) as WorldAgentStatus;
    setStatus(data);
    return data;
  }

  useEffect(() => {
    void refreshStatus();
    const params = new URLSearchParams(window.location.search);
    const result = params.get("world");
    const detail = params.get("detail");
    if (result === "verified") setJourney("World completed the request; the backend validated the signed ID token.");
    if (result === "cancelled") setJourney("User cancelled World verification. Protected action remains blocked.");
    if (result === "expired") setJourney("World verification expired. Protected action remains blocked.");
    if (result === "denied") setJourney(`World verification was denied or invalid${detail ? `: ${detail}` : "."}`);
  }, []);

  async function startVerification() {
    setBusy(true);
    setAction(null);
    setJourney("Creating a request bound to this exact trade order...");
    try {
      const response = await fetch("/api/world/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ asset, side, amount })
      });
      const data = await response.json();
      if (!response.ok || !data.authorizeUrl) throw new Error(data.error || "Unable to start verification.");
      setJourney("Request created. Redirecting to the official World ID for Agents sandbox...");
      window.location.assign(data.authorizeUrl);
    } catch (error) {
      setJourney(error instanceof Error ? error.message : "Unable to start verification.");
      setBusy(false);
    }
  }

  async function runProtectedAction() {
    setBusy(true);
    setAction(null);
    setJourney("Asking the backend to authorize the protected Trade Agent action...");
    try {
      const response = await fetch("/api/world/protected-action", { method: "POST" });
      const data = (await response.json()) as ActionResult;
      setAction(data);
      setJourney(
        response.ok
          ? "Validated World session accepted. The backend issued a short-lived trade authorization."
          : "Protected action denied. No trade authorization was created."
      );
    } finally {
      setBusy(false);
      await refreshStatus();
    }
  }

  async function demonstrateDeniedPath() {
    setBusy(true);
    setAction(null);
    setJourney("Clearing the verified session, then attempting the protected action...");
    await fetch("/api/world/reset", { method: "POST" });
    const response = await fetch("/api/world/protected-action", { method: "POST" });
    const data = (await response.json()) as ActionResult;
    setAction(data);
    setJourney("Denied path demonstrated: backend returned 403 and actionExecuted=false.");
    setBusy(false);
    await refreshStatus();
  }

  const expiresIn =
    status.verified && status.expiresAt
      ? Math.max(0, Math.ceil((status.expiresAt - Date.now()) / 1000))
      : 0;

  return (
    <section className="worldAgentDemo">
      <div className="worldAgentHeader">
        <div>
          <span className="worldEyebrow">WORLD ID FOR AGENTS · EVENT SANDBOX</span>
          <h2>Human approval before the Tora Trade Agent can act</h2>
          <p>
            A fresh World authentication is bound to one proposed trade. Only the backend can validate the
            callback and issue the short-lived authorization used by the protected agent action.
          </p>
        </div>
        <div className={status.verified ? "worldStatus verified" : "worldStatus"}>
          <b>{status.verified ? "✓ VERIFIED" : status.configured ? "○ NOT VERIFIED" : "⚙ CONFIG REQUIRED"}</b>
          <small>{status.issuer}</small>
        </div>
      </div>

      <div className="worldJourney">
        <div><b>1</b><span>Request</span><small>PKCE + state + nonce + exact trade binding</small></div>
        <div><b>2</b><span>User completes</span><small>Official sandbox authentication UI</small></div>
        <div><b>3</b><span>Backend validates</span><small>Code exchange + JWKS + issuer + audience + nonce + auth_time</small></div>
        <div><b>4</b><span>Protected action</span><small>Issue 2-minute Trade Agent authorization</small></div>
      </div>

      <div className="worldOrder">
        <label>
          Asset
          <input value={asset} onChange={(e) => setAsset(e.target.value)} disabled={busy || status.verified} />
        </label>
        <label>
          Side
          <select value={side} onChange={(e) => setSide(e.target.value as "Buy" | "Sell")} disabled={busy || status.verified}>
            <option>Buy</option>
            <option>Sell</option>
          </select>
        </label>
        <label>
          Amount
          <input value={amount} onChange={(e) => setAmount(e.target.value)} disabled={busy || status.verified} />
        </label>
      </div>

      <div className="worldActions">
        <button className="goldBtn" onClick={startVerification} disabled={busy || !status.configured}>
          {busy ? "Working..." : "1 · Request World verification"}
        </button>
        <button className="darkBtn worldActionBtn" onClick={runProtectedAction} disabled={busy}>
          2 · Run protected Trade Agent
        </button>
        <button className="worldDenyBtn" onClick={demonstrateDeniedPath} disabled={busy}>
          Test denied path
        </button>
      </div>

      <div className="worldResult">
        <div>
          <small>Journey state</small>
          <b>{journey}</b>
        </div>
        <div>
          <small>Validated identity</small>
          <b>{status.verified ? status.subjectHash : "None"}</b>
          {status.verified && <em>Fresh session · ~{expiresIn}s remaining</em>}
        </div>
        <div>
          <small>Protected action</small>
          <b>{action?.actionExecuted ? "EXECUTED" : action ? "BLOCKED" : "Not attempted"}</b>
          {action?.authorizationId && <em>ID {action.authorizationId.slice(0, 12)}…</em>}
          {action?.message && <em>{action.message}</em>}
        </div>
      </div>

      {!status.configured && (
        <div className="worldConfigNote">
          Configure the confidential sandbox client in the server environment before the live demo:
          <code> WORLD_ID_CLIENT_ID</code>, <code>WORLD_ID_CLIENT_SECRET</code>,
          <code> WORLD_ID_REDIRECT_URI</code>, and <code>WORLD_ID_SESSION_SECRET</code>.
          No client secret is exposed to this page.
        </div>
      )}
    </section>
  );
}
