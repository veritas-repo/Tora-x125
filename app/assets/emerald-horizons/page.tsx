import Link from "next/link";
import { Panel, StatCard, Tag } from "@/components/UI";

export default function AssetDetailPage() {
  return <main className="page">
    <div className="breadcrumbs">← Back to Assets &nbsp; / &nbsp; Green Bonds &nbsp; / &nbsp; <b>Emerald Horizons Green Bond</b></div>
    <section className="assetHero">
      <div><Tag green>✓ VERIFIED IMPACT</Tag> <Tag green>▥ LIVE ON MARKET</Tag>
        <h1>Emerald Horizons Green Bond</h1>
        <p>Sovereign-grade, tokenised green bond funding renewable energy projects across Southeast Asia.</p>
        <div className="tagRow"><Tag>GREEN BOND</Tag><Tag>RENEWABLE ENERGY</Tag><Tag>SOVEREIGN-GRADE</Tag><Tag>TOKENISED ASSET</Tag></div>
      </div>
      <em>Capital<br/>for a Cleaner<br/>Tomorrow</em>
    </section>

    <section className="statsGrid six">
      <StatCard icon="♧" label="Price (Token)" value="$25.00" change="+2.4% (24h)" />
      <StatCard icon="▥" label="Est. Yield (p.a.)" value="6.5%" tone="gold" />
      <StatCard icon="◫" label="Maturity Date" value="Mar 15, 2030" tone="blue" />
      <StatCard icon="◉" label="Total Issuance" value="3.2M" tone="gold" />
      <StatCard icon="◔" label="Remaining Supply" value="1.8M" tone="blue" />
      <StatCard icon="▰" label="Issuer" value="Emerald Horizons" tone="gold" />
    </section>

    <section className="assetTradeGrid">
      <Panel title="Price Chart">
        <div className="priceChart"><div className="priceAxis">$30<br/><br/>$27.5<br/><br/>$25<br/><br/>$22.5<br/><br/>$20</div><div className="lineChart large"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></div>
      </Panel>
      <Panel title="Buy / Sell Tokens">
        <div className="tabs"><button className="selected">Buy</button><button>Sell</button></div>
        <label className="fieldLabel">Amount</label><div className="inputMock"><span>♧</span><b>1,000</b><small>TOKENS</small></div>
        <div className="quickButtons"><button>25%</button><button>50%</button><button>75%</button><button>Max</button></div>
        <div className="costLine"><span>Total Cost</span><b>$25,000.00</b></div>
        <button className="goldBtn fullBtn">Buy Tokens</button>
      </Panel>
      <Panel title="Impact Metrics">
        <div className="impactStack"><div><span>ϟ</span><b>152,400 MWh</b><small>Renewable energy generated</small></div><div><span>♧</span><b>328,450 tCO₂e</b><small>CO₂ emissions avoided</small></div><div><span>▲</span><b>8,240 hectares</b><small>Forest conservation supported</small></div><div><span>♟</span><b>125,000 people</b><small>Access to clean energy</small></div></div>
      </Panel>
    </section>

    <section className="threeCol lower">
      <Panel title="Project Overview"><p className="bodyCopy">The Emerald Horizons Green Bond is a sovereign-grade, tokenised green bond designed to finance a portfolio of renewable energy projects across Southeast Asia, including solar, wind and storage infrastructure.</p><Link className="outlineGold" href="/projects">View Project Details →</Link></Panel>
      <Panel title="Repayment Summary"><div className="keyValues"><span>Coupon Rate (p.a.) <b>6.5%</b></span><span>Coupon Frequency <b>Semi-annual</b></span><span>Maturity Date <b>Mar 15, 2030</b></span><span>Face Value (Token) <b>$25.00</b></span><span>Repayment Source <b>Project revenues</b></span></div></Panel>
      <Panel title="Token Information"><div className="keyValues"><span>Token Symbol <b>TORA-GB01</b></span><span>Token Standard <b>ERC-1155 / ERC-20 wrapper</b></span><span>Total Issuance <b>3.2M TOKENS</b></span><span>Secondary Market <b className="positive">◆ Live</b></span><span>KYC Required <b className="positive">✓ Yes</b></span></div></Panel>
    </section>
  </main>;
}
