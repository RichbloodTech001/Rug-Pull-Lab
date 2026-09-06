import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin, createServerSession, verifyPassword } from "@/lib/server-auth";
import { normalizeEmail } from "@/lib/auth";
import { parseJsonObject, requireText } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    assertSameOrigin();
    const body = parseJsonObject(await request.json());
    const email = normalizeEmail(requireText(body.email, "email", 320));
    const password = requireText(body.password, "password", 256);
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ ok: false, error: "Invalid email or password." }, { status: 401 });
    }

    if (user.emailVerifiedAt === null) {
      return NextResponse.json({ ok: false, error: "Email verification is required before sign-in." }, { status: 403 });
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json({ ok: false, error: "Two-factor verification is required before a session can be issued.", twoFactorRequired: true }, { status: 403 });
    }

    await createServerSession(user.id);
    await prisma.auditEvent.create({
      data: { userId: user.id, action: "USER_LOGIN", target: user.id },
    });

    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, role: user.role },
      session: "ESTABLISHED",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
