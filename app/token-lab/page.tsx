import TokenCreator from "@/components/token-lab/TokenCreator";

export default function TokenLabPage() {
  return (
    <main className="main">
      <header className="topbar">
        <div>
          <div className="eyebrow">Laboratory / Token Lab</div>
          <h1>SPL Token Research</h1>
        </div>
        <div className="status"><span className="dot" /> DEVNET / LOCALNET ONLY</div>
      </header>
      <TokenCreator />
    </main>
  );
}
