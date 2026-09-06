import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ ok: false, authenticated: false }, { status: 401 });

    return NextResponse.json({
      ok: true,
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        emailVerified: Boolean(session.user.emailVerifiedAt),
        twoFactorEnabled: session.user.twoFactorEnabled,
      },
      expiresAt: session.expiresAt.toISOString(),
    });
  } catch {
    return NextResponse.json({ ok: false, authenticated: false }, { status: 503 });
  }
}
