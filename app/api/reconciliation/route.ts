import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCompliance } from "@/lib/server-rbac";
import { parseJsonObject, requireIdempotencyKey, requirePositiveMinorUnit, requireText } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireCompliance();
    const records = await prisma.reconciliationRecord.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
    return NextResponse.json({ ok: true, records });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load reconciliation records.";
    return NextResponse.json({ error: message }, { status: message.includes("required") || message.includes("authorized") ? 403 : 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireCompliance();
    const body = parseJsonObject(await request.json());
    const reference = requireText(body.reference, "reference", 128);
    const source = requireText(body.source, "source", 64).toUpperCase();
    const assetCode = requireText(body.assetCode, "assetCode", 32).toUpperCase();
    const amountMinor = requirePositiveMinorUnit(body.amountMinor);
    const idempotencyKey = requireIdempotencyKey(body.idempotencyKey);
    const externalReference = body.externalReference === undefined ? undefined : requireText(body.externalReference, "externalReference", 256);

    const existing = await prisma.reconciliationRecord.findFirst({ where: { reference } });
    if (existing) return NextResponse.json({ ok: true, record: existing, idempotent: true });

    const record = await prisma.$transaction(async (tx) => {
      const created = await tx.reconciliationRecord.create({
        data: { reference, source, assetCode, amountMinor, externalReference },
      });
      await tx.auditEvent.create({
        data: {
          userId: user.id,
          action: "RECONCILIATION_RECORD_CREATED",
          target: reference,
          metadata: { source, idempotencyKey },
        },
      });
      return created;
    });
    return NextResponse.json({ ok: true, record }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create reconciliation record.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
