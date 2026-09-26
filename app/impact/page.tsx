import HeroBanner from "@/components/HeroBanner";
import { Panel, StatCard } from "@/components/UI";
import { portfolio } from "@/lib/mock-data";

export default function ImpactPage() {
  return <main className="page">
    <HeroBanner eyebrow="IMPACT ANALYTICS" line1="Your Portfolio." line2="A Cleaner, Brighter Tomorrow." description="Track financial performance and real-world impact from verified green assets." />
    <section className="statsGrid five">
      <StatCard icon="▥" label="Portfolio Value" value="$125,420.50" change="+12.6%" tone="gold"/>
      <StatCard icon="♧" label="Total Impact (tCO₂e)" value="328,450" change="+18.9%"/>
      <StatCard icon="ϟ" label="Renewable Capacity" value="85.4 MW" change="+22.1%" tone="gold"/>
      <StatCard icon="♟" label="Households Powered" value="142,300" change="+19.4%" tone="gold"/>
      <StatCard icon="▲" label="Habitat Protected" value="8,240 ha" change="+14.2%"/>
    </section>
    <section className="threeCol impactTop">
      <Panel title="Portfolio Allocation"><div className="donut"><div><b>$125.4M</b><small>Total Value</small></div></div><div className="legend"><span>● Green Bonds <b>38%</b></span><span>● Renewable Energy <b>34%</b></span><span>● Carbon Removal <b>22%</b></span><span>● Cash & Others <b>6%</b></span></div></Panel>
      <Panel title="Impact Over Time" className="chartPanel"><div className="chartValue"><b>328,450 tCO₂e</b><span className="positive">↗ +18.9%</span></div><div className="lineChart"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></Panel>
      <Panel title="Impact by Asset Type"><div className="progressList"><label>Green Bonds <b>46%</b></label><progress value="46" max="100"/><label>Renewable Energy <b>30%</b></label><progress value="30" max="100"/><label>Carbon Removal <b>24%</b></label><progress value="24" max="100"/></div></Panel>
    </section>
    <section className="twoCol">
      <Panel title="Portfolio Holdings"><div className="dataTable">{portfolio.map(r=><div className="holdingRow" key={r[0]}><b>{r[0]}</b><span>{r[1]}</span><span>{r[2]}</span><b className="positive">{r[4]}</b><span>{r[5]} tCO₂e</span><TagStub/></div>)}</div></Panel>
      <Panel title="Global Impact Map"><div className="worldMap">● &nbsp;&nbsp;&nbsp;&nbsp; ●<br/><br/> &nbsp;&nbsp; ● &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ●<br/><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ● &nbsp;&nbsp; ●</div><div className="miniMetrics"><div><b>24</b><small>Projects</small></div><div><b>18</b><small>Countries</small></div><div><b>328K</b><small>tCO₂e Impact</small></div></div></Panel>
    </section>
  </main>;
}

function TagStub(){ return <span className="statusTag">✓ Verified</span>; }
