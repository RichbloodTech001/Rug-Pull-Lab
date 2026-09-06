import { UserRole } from "@prisma/client";
import { getServerSession } from "@/lib/server-auth";

export class AuthorizationError extends Error {
  status = 403;
  constructor(message = "You are not authorized to perform this action.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export async function requireAuthenticatedUser() {
  const session = await getServerSession();
  if (!session) throw new AuthorizationError("Authentication is required.");
  return session.user;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuthenticatedUser();
  if (!allowedRoles.includes(user.role)) {
    throw new AuthorizationError("Your role is not permitted to perform this action.");
  }
  return user;
}

export async function requireAdmin() {
  return requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);
}

export async function requireFinance() {
  return requireRole([UserRole.FINANCE, UserRole.ADMIN, UserRole.SUPER_ADMIN]);
}

export async function requireCompliance() {
  return requireRole([UserRole.COMPLIANCE, UserRole.ADMIN, UserRole.SUPER_ADMIN]);
}

export function authorizationErrorResponse(error: unknown) {
  if (error instanceof AuthorizationError) {
    return { error: error.message, status: error.status };
  }
  return null;
}
