import HeroBanner from "@/components/HeroBanner";
import { AQUA_DEMO_PROOF, TORA_AQUA_POSITION } from "@/lib/aqua";

export default function AquaPositionPage() {
  return (
    <main className="page">
      <HeroBanner
        eyebrow="1INCH AQUA + SWAPVM"
        line1="Impact-Adjusted."
        line2="Programmable Liquidity."
        description="A custom Aqua app implementing a concentrated, fee-bearing, inventory-aware impact-asset position with a Tora-specific SwapVM pricing instruction."
      />

      <section className="aquaJudgeGrid">
        <div className="panel aquaPositionCard">
          <span className="aquaEyebrow">CUSTOM AQUA APP</span>
          <h2>{TORA_AQUA_POSITION.name}</h2>
          <p>
            <b>{TORA_AQUA_POSITION.app}</b> extends the official 1inch
            AquaSwapVMRouter and adds opcode <code>{TORA_AQUA_POSITION.customOpcode}</code>.
            The position is shipped through Aqua as immutable strategy data and settled
            through SwapVM.
          </p>

          <div className="aquaMetrics">
            <div><small>Virtual liquidity</small><b>{TORA_AQUA_POSITION.example.virtualLiquidityPerSide} / side</b></div>
            <div><small>Example swap</small><b>{TORA_AQUA_POSITION.example.swapInput}</b></div>
            <div><small>Price range</small><b>{TORA_AQUA_POSITION.example.priceRange}</b></div>
            <div><small>Decay</small><b>{TORA_AQUA_POSITION.example.decayPeriod}</b></div>
          </div>
        </div>

        <div className="panel aquaProofCard">
          <span className="aquaEyebrow">DEMONSTRATION PROOF</span>
          <h2>Tests + executable local position</h2>
          <code className="aquaCommand">{AQUA_DEMO_PROOF.command}</code>
          <div className="aquaProofList">
            {AQUA_DEMO_PROOF.checks.map((item) => (
              <div key={item}><span>✓</span><p>{item}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel aquaProgramPanel">
        <div className="panelHead">
          <h2>Position program</h2>
          <span className="tag">Official + custom SwapVM instructions</span>
        </div>
        <div className="aquaProgram">
          {TORA_AQUA_POSITION.program.map((item, index) => (
            <div className={item.kind === "custom" ? "aquaStep custom" : "aquaStep"} key={item.step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <small>{item.kind === "custom" ? "TORA CUSTOM OPCODE" : "OFFICIAL SWAPVM"}</small>
                <b>{item.step}</b>
                <p>{item.purpose}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="threeCol aquaDetails">
        <div className="panel">
          <h3>Risk + impact pricing</h3>
          <p>
            <code>ImpactRiskAdjuster</code> modifies SwapVM&apos;s virtual input balance
            before downstream AMM pricing. A risk premium worsens execution while a
            verified-impact discount improves it, without fabricating Aqua token balances.
          </p>
        </div>
        <div className="panel">
          <h3>Concentrated liquidity</h3>
          <p>
            The official <code>XYCConcentrateSwap</code> instruction creates a bounded
            constant-product position. <code>Decay</code> adds temporary inventory
            pressure after fills and <code>FeeFlatIn</code> captures LP fees.
          </p>
        </div>
        <div className="panel">
          <h3>Settlement demonstration</h3>
          <p>
            The automated test and demo script deploy official Aqua locally, ship the
            position, execute a SwapVM trade, verify real ERC-20 maker/taker balance
            changes, and confirm Aqua virtual balances after settlement.
          </p>
        </div>
      </section>

      <section className="panel aquaSourcePanel">
        <h3>Judge source map</h3>
        <div className="aquaSourceGrid">
          <span><b>Custom Aqua app</b><code>contracts/oneinch/ToraImpactAquaRouter.sol</code></span>
          <span><b>Custom opcode</b><code>contracts/oneinch/ImpactRiskAdjuster.sol</code></span>
          <span><b>Position builder</b><code>contracts/oneinch/ToraAquaPositionBuilder.sol</code></span>
          <span><b>Position tests</b><code>{AQUA_DEMO_PROOF.test}</code></span>
          <span><b>Executable demo</b><code>{AQUA_DEMO_PROOF.script}</code></span>
          <span><b>CI execution</b><code>{AQUA_DEMO_PROOF.ci}</code></span>
        </div>
      </section>
    </main>
  );
}
