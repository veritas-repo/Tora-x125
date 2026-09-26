import HeroBanner from "@/components/HeroBanner";
import { Panel, StatCard, Tag } from "@/components/UI";
import { auditTrail } from "@/lib/mock-data";

export default function ProjectsPage() {
  return (
    <main className="page">
      <HeroBanner eyebrow="PROJECT VERIFICATION" line1="Verify Real Assets." line2="Trust Real Impact." description="Transparent due diligence, on-chain auditability, and verified project data for a cleaner, brighter tomorrow." />
      <section className="projectHeader">
        <div className="projectThumb forest">▲</div>
        <div className="projectIntro"><div><Tag>CARBON</Tag> <Tag green>✓ VERIFIED IMPACT</Tag></div><h1>Borneo Forest Carbon Credits</h1><p>Nature-based carbon removal through verified reforestation and forest conservation in Indonesia.</p><div className="metaLine">⌖ Kalimantan, Indonesia · ▲ 152,400 ha · ◫ 2023–2043 · ▣ TORA-CARBON</div></div>
        <button className="goldBtn">Invest in Project →</button>
      </section>

      <section className="statsGrid four">
        <StatCard icon="♧" label="Total Carbon Removal" value="328,450 tCO₂e" change="+18.9%" />
        <StatCard icon="▲" label="Forest Protected" value="152,400 ha" change="+14.2%" />
        <StatCard icon="♟" label="Local Households" value="12,480" change="+16.7%" tone="gold" />
        <StatCard icon="⚘" label="Biodiversity Species" value="24" change="+9.1%" />
      </section>

      <section className="threeCol">
        <Panel title="Project Overview"><p className="bodyCopy">The Borneo Forest Carbon Credits project protects and restores critical forest ecosystems, generating high-integrity carbon credits through avoided deforestation, reforestation, and community-led conservation.</p><ul className="checkList"><li>▲ Nature-based solution</li><li>♟ Community led</li><li>♧ Biodiversity protection</li><li>◎ Long-term impact</li></ul></Panel>
        <Panel title="Due Diligence Checklist"><ul className="dueList"><li>✓ Legal Structure Review <b>Approved</b></li><li>✓ KYC / AML Verification <b>Approved</b></li><li>✓ Methodology Review <b>Approved</b></li><li>✓ Third-Party Validation <b>Approved</b></li><li>✓ Token Issuance Approval <b>Approved</b></li></ul></Panel>
        <Panel title="On-Chain Audit Trail" action="View on Explorer"><div className="timeline">{auditTrail.map(([d,t,s])=><div className="timelineItem" key={t}><i/><span><small>{d}</small><b>{t}</b><p>{s}</p></span></div>)}</div></Panel>
      </section>

      <section className="threeCol lower">
        <Panel title="Impact & MRV Metrics"><div className="miniMetrics"><div><b>328,450</b><small>tCO₂e removed</small></div><div><b>152,400</b><small>hectares protected</small></div><div><b>12,480</b><small>households supported</small></div><div><b>24</b><small>biodiversity species</small></div></div></Panel>
        <Panel title="Project Location"><div className="mapMock">Kalimantan, Indonesia <span>●</span></div></Panel>
        <Panel title="Compliance & Verification"><div className="verifyGrid"><Tag green>Verified Impact</Tag><Tag>Audit Trail</Tag><Tag>On-chain Record</Tag><Tag>Oracle Data</Tag></div></Panel>
      </section>
    </main>
  );
}
