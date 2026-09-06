export type UserRole = "USER" | "SUPPORT" | "COMPLIANCE" | "FINANCE" | "ADMIN" | "SUPER_ADMIN";

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
};

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function validatePassword(password: string) {
  return password.length >= 12 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
}

export function hasRole(user: AuthUser, allowed: UserRole[]) {
  return allowed.includes(user.role);
}

export function canAccessAdmin(user: AuthUser) {
  return hasRole(user, ["ADMIN", "SUPER_ADMIN"]);
}

export function canAccessFinancialOperations(user: AuthUser) {
  return hasRole(user, ["FINANCE", "ADMIN", "SUPER_ADMIN"]);
}

export function canAccessCompliance(user: AuthUser) {
  return hasRole(user, ["COMPLIANCE", "ADMIN", "SUPER_ADMIN"]);
}

export function createUserRecord(email: string, role: UserRole = "USER"): AuthUser {
  const normalized = normalizeEmail(email);
  if (!normalized || !normalized.includes("@")) throw new Error("A valid email address is required.");
  return { id: crypto.randomUUID(), email: normalized, role, emailVerified: false, twoFactorEnabled: false };
}
