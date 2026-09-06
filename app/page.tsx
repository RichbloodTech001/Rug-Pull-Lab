const nav = ["Overview", "Token Lab", "Market Scanner", "Trading Research", "Replay Lab", "Security Research"];

export default function Home() {
  return (
    <div className="lab-shell">
      <aside className="sidebar">
        <div className="brand">RUG <span>PULL</span> LAB</div>
        <div className="nav-label">Laboratory</div>
        {nav.map((item, index) => (
          <a className={`nav-item ${index === 0 ? "active" : ""}`} href="#" key={item}>{item}</a>
        ))}
        <div className="nav-label">System</div>
        <a className="nav-item" href="#">Experiments</a>
        <a className="nav-item" href="#">Audit Log</a>
        <a className="nav-item" href="#">Settings</a>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <div className="eyebrow">Solana security research platform</div>
            <h1>Research Console</h1>
          </div>
          <div className="status"><span className="dot" /> LAB ONLINE · DEVNET</div>
        </header>

        <section className="grid">
          <div className="card"><div className="metric-label">Active Experiments</div><div className="metric">0</div><div className="metric-note">Ready for first experiment</div></div>
          <div className="card"><div className="metric-label">Tokens Observed</div><div className="metric">0</div><div className="metric-note">Local dataset</div></div>
          <div className="card"><div className="metric-label">Security Alerts</div><div className="metric">0</div><div className="metric-note">No unresolved alerts</div></div>
          <div className="card"><div className="metric-label">Environment</div><div className="metric">DEVNET</div><div className="metric-note">Destructive actions isolated</div></div>
        </section>

        <section className="workspace">
          <div className="card">
            <div className="card-title"><span>Market Research</span><span className="badge">LIVE DATA · NEXT PHASE</span></div>
            <div className="chart">Chart workspace reserved for on-chain market data</div>
          </div>
          <div className="card">
            <div className="card-title"><span>Research Environment</span><span className="badge">SAFE MODE</span></div>
            <div className="list">
              <div className="list-row"><span className="muted">Execution network</span><strong>Solana Devnet</strong></div>
              <div className="list-row"><span className="muted">Wallet signing</span><span className="warning">Not connected</span></div>
              <div className="list-row"><span className="muted">Private key storage</span><strong>Disabled</strong></div>
              <div className="list-row"><span className="muted">Research mode</span><strong>Simulation + Devnet</strong></div>
              <div className="list-row"><span className="muted">System status</span><strong>Operational</strong></div>
            </div>
          </div>
        </section>

        <div className="footer-note">Rug Pull Lab is a security research and trading laboratory. Live public-market manipulation and unauthorized asset extraction are not supported.</div>
      </main>
    </div>
  );
}
