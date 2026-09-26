export function StatCard({ icon, label, value, change, tone = "green" }: {
  icon: string; label: string; value: string; change?: string; tone?: "green" | "gold" | "blue";
}) {
  return (
    <div className="statCard">
      <span className={`statIcon ${tone}`}>{icon}</span>
      <div><small>{label}</small><strong>{value}</strong>{change && <b className="positive">↗ {change}</b>}</div>
      <span className="spark">⌁⌁⌁</span>
    </div>
  );
}

export function Panel({ title, action, children, className = "" }: {
  title: string; action?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      <div className="panelHead"><h2>{title}</h2>{action && <button>{action} →</button>}</div>
      {children}
    </section>
  );
}

export function Tag({ children, green = false }: { children: React.ReactNode; green?: boolean }) {
  return <span className={green ? "tag greenTag" : "tag"}>{children}</span>;
}
