import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin, hashPassword } from "@/lib/server-auth";
import { normalizeEmail, validatePassword } from "@/lib/auth";
import { parseJsonObject, requireText } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    assertSameOrigin();
    const body = parseJsonObject(await request.json());
    const email = normalizeEmail(requireText(body.email, "email", 320));
    const password = requireText(body.password, "password", 256);

    if (!email.includes("@")) throw new Error("A valid email address is required.");
    if (!validatePassword(password)) {
      throw new Error("Password must be at least 12 characters and include upper, lower, number, and symbol characters.");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ ok: false, error: "Account already exists." }, { status: 409 });

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, passwordHash },
      select: { id: true, email: true, role: true, emailVerifiedAt: true, twoFactorEnabled: true },
    });

    await prisma.auditEvent.create({
      data: { userId: user.id, action: "USER_REGISTERED", target: user.id },
    });

    return NextResponse.json({
      ok: true,
      user,
      authentication: "NOT_AUTHENTICATED",
      verificationRequired: true,
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
