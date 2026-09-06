"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <main className="main"><div className="topbar"><div><div className="eyebrow">Rug Pull Lab · Recovery</div><h1>Something went wrong</h1></div><div className="status"><span className="dot" /> RECOVERABLE ERROR</div></div><section className="card"><p className="muted">The research surface encountered an unexpected error. No blockchain transaction is initiated by this error page.</p><button className="primary-button" onClick={() => reset()}>Retry</button><a className="secondary" href="/">Return to Research Console</a></section></main>;
}
