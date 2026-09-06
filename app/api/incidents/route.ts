import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server-rbac";
import { parseJsonObject, requireText } from "@/lib/validation";

export const dynamic = "force-dynamic";

const severities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export async function GET() {
  try {
    await requireAdmin();
    const incidents = await prisma.incident.findMany({
      include: { events: { orderBy: { createdAt: "desc" }, take: 25 } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ ok: true, incidents });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load incidents.";
    const status = message === "Authentication is required." ? 401 : message.includes("not authorized") || message.includes("role is not permitted") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAdmin();
    const body = parseJsonObject(await request.json());
    const title = requireText(body.title, "title", 200);
    const description = requireText(body.description, "description", 4000);
    const severity = requireText(body.severity, "severity", 16).toUpperCase();
    if (!severities.includes(severity as (typeof severities)[number])) throw new Error("Invalid incident severity.");

    const incident = await prisma.$transaction(async (tx) => {
      const created = await tx.incident.create({
        data: { title, description, severity: severity as (typeof severities)[number], ownerId: user.id },
      });
      await tx.incidentEvent.create({
        data: { incidentId: created.id, action: "INCIDENT_CREATED", detail: `Incident opened by ${user.email}.` },
      });
      await tx.auditEvent.create({
        data: { userId: user.id, action: "INCIDENT_CREATED", target: created.id, metadata: { severity } },
      });
      return created;
    });
    return NextResponse.json({ ok: true, incident }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create incident.";
    const status = message === "Authentication is required." ? 401 : message.includes("not authorized") || message.includes("role is not permitted") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
