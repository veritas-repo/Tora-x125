import HeroBanner from "@/components/HeroBanner";
import WorldAgentGate from "@/components/WorldAgentGate";

export default function WorldAgentsPage() {
  return (
    <main className="page">
      <HeroBanner
        eyebrow="WORLD ID FOR AGENTS"
        line1="Human Verified."
        line2="Agent Authorized."
        description="Fresh human verification protects high-impact agent actions without exposing identity or client secrets."
      />
      <WorldAgentGate />

      <section className="worldSecurityGrid">
        <div className="panel">
          <h3>Secure backend validation</h3>
          <p>
            The browser never decides authorization. The callback exchanges the authorization code on the server,
            verifies the signed ID token against World&apos;s JWKS, checks issuer, audience, state, nonce,
            freshness and expiry, and stores only a hashed subject in a signed HttpOnly session.
          </p>
        </div>
        <div className="panel">
          <h3>Failure is fail-closed</h3>
          <p>
            Cancelled, expired, invalid, missing-session or unvalidated flows never reach the protected action.
            The demo button deliberately clears the verified session and proves the backend returns
            <code> 403</code> with <code>actionExecuted=false</code>.
          </p>
        </div>
        <div className="panel">
          <h3>Protected Tora action</h3>
          <p>
            After fresh verification, the backend issues a two-minute authorization bound to the exact asset,
            side and amount. That authorization is the gate before the Trade Agent compares 1inch and
            Uniswap v4 execution routes and asks the wallet to sign.
          </p>
        </div>
      </section>
    </main>
  );
}
