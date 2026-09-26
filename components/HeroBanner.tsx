export default function HeroBanner({
  eyebrow,
  line1,
  line2,
  description,
  actions
}: {
  eyebrow: string;
  line1: string;
  line2: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <section className="heroBanner">
      <div className="heroShade" />
      <div className="heroContent">
        <p className="heroEyebrow">{eyebrow}</p>
        <h1>{line1}<br/><span>{line2}</span></h1>
        <p>{description}</p>
        {actions && <div className="heroActions">{actions}</div>}
      </div>
      <div className="heroSignals">
        <span>♧ <b>VERIFIED IMPACT</b></span>
        <span>▥ <b>LIQUID MARKETS</b></span>
        <span>◎ <b>ONCHAIN RECORDS</b></span>
        <em>Capital<br/>for a Cleaner<br/>Tomorrow</em>
      </div>
    </section>
  );
}
