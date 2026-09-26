import Link from "next/link";
import HeroBanner from "@/components/HeroBanner";
import { Panel, StatCard, Tag } from "@/components/UI";
import { assets } from "@/lib/mock-data";

export default function Dashboard() {
  return (
    <main className="page">
      <HeroBanner
        eyebrow="TOKENISED REAL-WORLD ASSETS"
        line1="Invest in a Cleaner,"
        line2="Brighter Tomorrow."
        description="Tokenised impact investments. A transparent secondary market for verified green assets."
        actions={<><Link className="goldBtn" href="/assets/emerald-horizons">Browse Assets →</Link><Link className="outlineBtn" href="/projects">Learn More</Link></>}
      />

      <section className="statsGrid four">
        <StatCard icon="◉" label="Total Tokenised Assets" value="$125.4M" change="+12.6%" tone="gold" />
        <StatCard icon="▥" label="24h Trading Volume" value="$8.7M" change="+28.3%" tone="gold" />
        <StatCard icon="♧" label="Impact Verified" value="328,450 tCO₂e" change="+18.9%" />
        <StatCard icon="♟" label="Active Investors" value="12,486" change="+14.2%" tone="gold" />
      </section>

      <section className="twoCol wideLeft">
        <Panel title="Featured Assets" action="View All Assets">
          <div className="assetCards">
            {assets.slice(0,3).map((a, i) => (
              <article className="assetCard" key={a.symbol}>
                <div className={`assetVisual visual${i+1}`}><Tag green>✓ VERIFIED IMPACT</Tag><span className="assetIconBig">{a.icon}</span></div>
                <div className="assetBody">
                  <h3>{a.name}</h3><p>{a.type} investment with verified onchain project and impact data.</p>
                  <div className="triple"><span><b>{a.yield}</b><small>Est. Yield</small></span><span><b>{i===0?"3.2 years":i===1?"8.4 years":"Live"}</b><small>{i===2?"Market":"Term"}</small></span><span><b>{i===0?"$25.0M":i===1?"$18.5M":a.price}</b><small>{i===2?"Current Price":"Total Size"}</small></span></div>
                  <Link href={i===0?"/assets/emerald-horizons":"/market"} className="darkBtn">View Details →</Link>
                </div>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="Market Overview" action="View Full Market">
          <div className="marketList">
            {assets.map(a => <div className="marketRow" key={a.symbol}><span className="marketSymbol">{a.icon}</span><span><b>{a.symbol}</b><small>{a.type}</small></span><strong>{a.price}</strong><b className={a.change.startsWith("-")?"negative":"positive"}>{a.change}</b><span>{a.volume}</span></div>)}
          </div>
        </Panel>
      </section>

      <section className="twoCol">
        <Panel title="Recent Activity"><div className="activityTable">
          <div className="tableRow headerRow"><span>Time</span><span>Type</span><span>Asset</span><span>Amount</span><span>Price</span></div>
          <div className="tableRow"><span>2 mins ago</span><span className="positive">Buy</span><span>TORA-SOLAR</span><span>12,500 TOKENS</span><span>$1.24</span></div>
          <div className="tableRow"><span>8 mins ago</span><span>Listing</span><span>TORA-GB01</span><span>4,200 TOKENS</span><span>$100.25</span></div>
        </div></Panel>
        <Panel title="Impact Highlights" action="View Impact"><div className="highlightGrid"><div><b>♧ 328,450</b><small>tonnes CO₂e verified</small></div><div><b>▲ 8,240</b><small>hectares habitat protected</small></div></div></Panel>
      </section>
    </main>
  );
}
