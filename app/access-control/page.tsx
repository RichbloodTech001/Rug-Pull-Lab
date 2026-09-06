"use client";

import { useState } from "react";
import { AuthUser, UserRole, canAccessAdmin, canAccessCompliance, canAccessFinancialOperations } from "@/lib/auth";

const roles: UserRole[] = ["USER", "SUPPORT", "COMPLIANCE", "FINANCE", "ADMIN", "SUPER_ADMIN"];
const capabilities = [
  ["Research modules", "All authenticated users"],
  ["Support operations", "SUPPORT / ADMIN / SUPER_ADMIN"],
  ["Compliance cases", "COMPLIANCE / ADMIN / SUPER_ADMIN"],
  ["Financial operations", "FINANCE / ADMIN / SUPER_ADMIN"],
  ["Administrative controls", "ADMIN / SUPER_ADMIN"],
  ["Production custody", "Not enabled in Phase 11"],
];

export default function AccessControlPage() {
  const [role, setRole] = useState<UserRole>("USER");
  const user: AuthUser = { id: "phase11-preview", email: "preview@local", role, emailVerified: true, twoFactorEnabled: true };
  return <main className="main"><header className="topbar"><div><div className="eyebrow">Phase 11 · Identity & Access</div><h1>RBAC Control Matrix</h1></div><div className="status"><span className="dot" /> IDENTITY FOUNDATION</div></header><section className="card"><div className="card-title"><span>Role preview</span><span className="badge">SAFE PREVIEW</span></div><label className="role-picker">Test role<select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>{roles.map((item) => <option key={item}>{item}</option>)}</select></label><div className="list"><div className="list-row"><span>Admin access</span><strong>{canAccessAdmin(user) ? "Allowed" : "Denied"}</strong></div><div className="list-row"><span>Financial operations</span><strong>{canAccessFinancialOperations(user) ? "Allowed" : "Denied"}</strong></div><div className="list-row"><span>Compliance</span><strong>{canAccessCompliance(user) ? "Allowed" : "Denied"}</strong></div></div></section><section className="card access-matrix"><div className="card-title"><span>Capability matrix</span><span className="badge">SERVER ENFORCEMENT REQUIRED</span></div>{capabilities.map(([capability, access]) => <div className="list-row" key={capability}><span>{capability}</span><strong>{access}</strong></div>)}</section><p className="footer-note">This matrix is a development preview. Client-side role selection is not an authorization boundary. Before custody, enforce roles on the server with secure sessions and database-backed permissions.</p></main>;
}
