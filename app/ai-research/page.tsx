"use client";

import { useMemo, useState } from "react";
import { analyzeResearchQuestion, ResearchContext } from "@/lib/ai-research";

type Message = { role: "user" | "assistant"; text: string };

export default function AIResearchPage() {
  const [question, setQuestion] = useState("");
  const [score, setScore] = useState("0");
  const [level, setLevel] = useState("LOW");
  const [mintAuthority, setMintAuthority] = useState("");
  const [freezeAuthority, setFreezeAuthority] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState("");

  const context: ResearchContext = useMemo(() => ({
    riskScore: Number(score) || 0,
    riskLevel: level,
    token: { mintAuthority: mintAuthority || null, freezeAuthority: freezeAuthority || null }
  }), [score, level, mintAuthority, freezeAuthority]);

  function ask(text = question) {
    try {
      const answer = analyzeResearchQuestion(text, context);
      setMessages((current) => [...current, { role: "user", text }, { role: "assistant", text: `${answer.answer}\n\nRecommended research:\n• ${answer.actions.join("\n• ")}\n\n${answer.safety}` }]);
      setQuestion("");
      setError("");
    } catch (e) { setError(e instanceof Error ? e.message : "Research request rejected."); }
  }

  return <main className="main">
    <div className="topbar"><div><div className="eyebrow">Phase 8 · AI Research Assistant</div><h1>Research Copilot</h1></div><div className="status"><span className="dot" /> DEFENSIVE RESEARCH MODE</div></div>
    <section className="grid">
      <div className="card"><div className="metric-label">Assistant</div><div className="metric">READY</div><div className="metric-note">Local research reasoning</div></div>
      <div className="card"><div className="metric-label">Risk Context</div><div className="metric">{score}/100</div><div className="metric-note">Supplied scan score</div></div>
      <div className="card"><div className="metric-label">Mode</div><div className="metric">READ ONLY</div><div className="metric-note">No asset movement</div></div>
      <div className="card"><div className="metric-label">Execution</div><div className="metric">PAPER</div><div className="metric-note">Replay and strategy research</div></div>
    </section>

    <section className="workspace ai-layout">
      <div className="card"><div className="card-title"><span>Research Copilot</span><span className="badge">NO LIVE EXECUTION</span></div>
        <div className="ai-chat">{messages.length === 0 ? <div className="empty-state">Ask: “What does this risk score mean?”, “Explain the authorities”, “How should I assess holder concentration?”, or “How should I replay this strategy?”</div> : messages.map((message, i) => <div className={`ai-message ${message.role}`} key={`${message.role}-${i}`}><strong>{message.role === "user" ? "You" : "Copilot"}</strong><div>{message.text}</div></div>)}</div>
        <div className="ai-input"><textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask a security research question..." rows={4} /><button className="primary-button" onClick={() => ask()}>Analyze</button></div>
        {error && <div className="error-box">{error}</div>}
      </div>
      <div className="card"><div className="card-title"><span>Research Context</span><span className="badge">OPTIONAL</span></div>
        <div className="form-grid"><label>Risk score<input type="number" min="0" max="100" value={score} onChange={(e) => setScore(e.target.value)} /></label><label>Risk level<select value={level} onChange={(e) => setLevel(e.target.value)}><option>LOW</option><option>MODERATE</option><option>HIGH</option><option>CRITICAL</option></select></label><label>Mint authority<input value={mintAuthority} onChange={(e) => setMintAuthority(e.target.value)} placeholder="address or blank" /></label><label>Freeze authority<input value={freezeAuthority} onChange={(e) => setFreezeAuthority(e.target.value)} placeholder="address or blank" /></label></div>
        <div className="suggestions"><button className="secondary" onClick={() => ask("What does this risk score mean?")}>Interpret risk</button><button className="secondary" onClick={() => ask("Explain the authorities")}>Explain authorities</button><button className="secondary" onClick={() => ask("How should I assess holder concentration?")}>Assess holders</button><button className="secondary" onClick={() => ask("How should I replay this strategy?")}>Plan replay</button></div>
      </div>
    </section>
    <p className="footer-note">Phase 8 provides defensive research reasoning from supplied laboratory context. It does not connect to a live trading agent, move assets, drain liquidity, manipulate markets, or execute destructive token operations.</p>
  </main>;
}
