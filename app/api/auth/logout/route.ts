import { NextResponse } from "next/server";
import { assertSameOrigin, destroyServerSession, getServerSession } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    assertSameOrigin();
    const session = await getServerSession();
    if (session) {
      await prisma.auditEvent.create({
        data: { userId: session.user.id, action: "USER_LOGOUT", target: session.user.id },
      });
    }
    await destroyServerSession();
    return NextResponse.json({ ok: true, authenticated: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Logout failed.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
