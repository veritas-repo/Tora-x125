import HeroBanner from "@/components/HeroBanner";
import { Panel, StatCard } from "@/components/UI";
import { portfolio } from "@/lib/mock-data";

export default function PortfolioPage() {
  return <main className="page">
    <HeroBanner eyebrow="YOUR PORTFOLIO" line1="Build a Verified" line2="Impact Portfolio." description="Tokenised real-world investments. Measurable climate impact. A cleaner, brighter tomorrow." />
    <section className="statsGrid four">
      <StatCard icon="◉" label="Total Portfolio Value" value="$125,420.50" change="+12.6%" tone="gold"/>
      <StatCard icon="▥" label="Total Return" value="+$18,540.32" change="+17.3%" tone="gold"/>
      <StatCard icon="♧" label="Yield Earned (All Time)" value="$8,720.15" change="+28.4%"/>
      <StatCard icon="▲" label="Real-World Impact Generated" value="328,450 tCO₂e" change="+18.9%"/>
    </section>
    <section className="threeCol portfolioTop">
      <Panel title="Portfolio Allocation"><div className="donut"><div><b>$125.4M</b><small>Total Value</small></div></div><div className="legend"><span>● Green Bonds <b>38%</b></span><span>● Renewable Energy <b>34%</b></span><span>● Carbon Removal <b>22%</b></span><span>● Water Infrastructure <b>6%</b></span></div></Panel>
      <Panel title="Wallet Balances" action="View on Explorer"><div className="dataTable compact">{[["USDC","24,850.32","$24,850.32"],["TORA-GB01","12,500.00","$12,500.00"],["TORA-SOLAR","8,400.00","$10,584.00"],["TORA-CARBON","2,300.00","$56,350.00"],["TORA-WATER","7,750.00","$7,135.00"]].map(r=><div className="holdingRow" key={r[0]}><b>{r[0]}</b><span>{r[1]}</span><span>{r[2]}</span><b className="positive">+1.8%</b></div>)}</div></Panel>
      <Panel title="Upcoming Payouts" action="View All"><div className="dataTable compact">{[["Jan 15, 2027","Emerald Horizons","Coupon","$1,240"],["Feb 10, 2027","Sunrise Solar","Distribution","$980"],["Mar 1, 2027","Borneo Forest","Yield","$1,560"],["Mar 15, 2027","AquaClean Water","Distribution","$420"]].map(r=><div className="holdingRow" key={r[0]}><span>{r[0]}</span><b>{r[1]}</b><span>{r[2]}</span><strong>{r[3]}</strong></div>)}</div></Panel>
    </section>
    <section className="twoCol wideLeft">
      <Panel title="Portfolio Holdings"><div className="dataTable">{portfolio.map(r=><div className="holdingRow" key={r[0]}><b>{r[0]}</b><span>{r[1]}</span><span>{r[2]}</span><b className="positive">{r[4]}</b><span>{r[5]}</span><span className="statusTag">✓ Verified</span></div>)}</div></Panel>
      <Panel title="Portfolio Actions"><div className="actionGrid"><button>＋<b>Deposit Funds</b><small>Add USDC or tokens</small></button><button>→<b>Withdraw Funds</b><small>Send funds to wallet</small></button><button>◔<b>Rebalance Portfolio</b><small>Optimise allocation</small></button><button>♢<b>Claim Rewards</b><small>Collect yield distributions</small></button></div></Panel>
    </section>
  </main>;
}
