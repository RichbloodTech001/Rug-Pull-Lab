"use client";

import { FormEvent, useState } from "react";
import { normalizeEmail, validatePassword } from "@/lib/auth";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const normalized = normalizeEmail(email);
    if (!normalized || !normalized.includes("@")) return setMessage("Enter a valid email address.");
    if (!validatePassword(password)) return setMessage("Password must be 12+ characters and include upper, lower, number and symbol.");
    setMessage(mode === "register" ? "Registration validated. Server-side account creation is the next integration boundary." : "Credentials validated. Connect a server-side session provider before accepting real accounts.");
  }

  return <main className="auth-shell"><section className="auth-card card"><div className="eyebrow">Phase 11 · Identity & Access</div><h1>{mode === "login" ? "Secure sign in" : "Create research account"}</h1><p className="muted auth-copy">Identity controls are being introduced before any real-money custody features. This client never stores passwords or session secrets.</p><form onSubmit={submit} className="auth-form"><label>Email<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label><label>Password<input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} /></label><button className="primary-button" type="submit">{mode === "login" ? "Sign in" : "Register"}</button></form>{message && <div className="empty-state">{message}</div>}<button className="secondary primary-button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setMessage(""); }}>{mode === "login" ? "Need an account? Register" : "Already registered? Sign in"}</button><div className="auth-security"><strong>Phase 11 security boundary</strong><span>Email verification · TOTP 2FA · server-side sessions · RBAC are required before production custody.</span></div></section></main>;
}
