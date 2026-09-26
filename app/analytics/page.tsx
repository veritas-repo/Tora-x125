import Link from "next/link";
import { Panel, StatCard } from "@/components/UI";

export default function AnalyticsPage(){
  return <main className="page">
    <section className="simpleHero"><p className="heroEyebrow">ANALYTICS</p><h1>Market & Impact Intelligence</h1><p>Track liquidity, portfolio performance, project verification and measurable impact from one view.</p><Link href="/impact" className="goldBtn">Open Impact Analytics →</Link></section>
    <section className="statsGrid four"><StatCard icon="▥" label="Liquidity" value="$20.0M" change="+9.4%" tone="gold"/><StatCard icon="◎" label="Active Markets" value="18" change="+12.5%" tone="blue"/><StatCard icon="♧" label="Verified Impact" value="328K tCO₂e" change="+18.9%"/><StatCard icon="♟" label="Investors" value="12,486" change="+14.2%" tone="gold"/></section>
    <section className="twoCol"><Panel title="Market Depth"><div className="lineChart large"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></Panel><Panel title="Verification Coverage"><div className="progressList"><label>Verified project data <b>96%</b></label><progress value="96" max="100"/><label>Onchain audit trail <b>91%</b></label><progress value="91" max="100"/><label>Third-party MRV <b>88%</b></label><progress value="88" max="100"/></div></Panel></section>
  </main>
}
