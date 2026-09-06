import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser } from "@/lib/server-rbac";
import { requireText, parseJsonObject } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    const events = await prisma.auditEvent.findMany({
      where: user.role === "ADMIN" || user.role === "SUPER_ADMIN" ? undefined : { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ ok: true, events });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load audit events.";
    const status = message === "Authentication is required." ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const body = parseJsonObject(await request.json());
    const action = requireText(body.action, "action", 128);
    const target = requireText(body.target, "target", 256);
    const metadata = body.metadata === undefined ? undefined : body.metadata === null ? undefined : body.metadata;

    const event = await prisma.auditEvent.create({
      data: { userId: user.id, action, target, ...(metadata === undefined ? {} : { metadata }) },
    });
    return NextResponse.json({ ok: true, event }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create audit event.";
    const status = message === "Authentication is required." ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
