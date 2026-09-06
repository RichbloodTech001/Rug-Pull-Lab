import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCompliance } from "@/lib/server-rbac";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const actor = await requireCompliance();
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page") || "1") || 1);
    const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") || "20") || 20));
    const [total, profiles] = await prisma.$transaction([
      prisma.complianceProfile.count(),
      prisma.complianceProfile.findMany({
        orderBy: { updatedAt: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true, userId: true, kyc: true, kyb: true, sanctions: true, pep: true,
          sourceOfFunds: true, riskTier: true, reviewedAt: true, reviewedById: true,
          createdAt: true, updatedAt: true,
          user: { select: { id: true, email: true, createdAt: true } },
        },
      }),
    ]);
    return NextResponse.json({ ok: true, actorRole: actor.role, page, pageSize, total, hasNextPage: page * pageSize < total, profiles });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load compliance queue.";
    const status = message === "Authentication is required." ? 401 : message.includes("not permitted") || message.includes("not authorized") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
