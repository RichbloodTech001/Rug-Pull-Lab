"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return <html lang="en"><body style={{ margin: 0, background: "#07090d", color: "#f5f7fa", fontFamily: "Arial, Helvetica, sans-serif" }}><main style={{ maxWidth: 760, margin: "0 auto", padding: 48 }}><p>RUG PULL LAB · RECOVERY</p><h1>Application error</h1><p>The application encountered an unexpected root-level error. No blockchain transaction is initiated by this recovery screen.</p><button onClick={() => reset()} style={{ padding: "11px 15px", cursor: "pointer" }}>Retry</button></main></body></html>;
}
