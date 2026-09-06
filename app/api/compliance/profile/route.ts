import { NextResponse } from "next/server";
import { ComplianceRiskTier, ScreeningStatus, VerificationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin } from "@/lib/server-auth";
import { requireAuthenticatedUser, requireCompliance } from "@/lib/server-rbac";
import { parseJsonObject, requireText } from "@/lib/validation";

export const dynamic = "force-dynamic";

const verificationStatuses = new Set(Object.values(VerificationStatus));
const screeningStatuses = new Set(Object.values(ScreeningStatus));
const riskTiers = new Set(Object.values(ComplianceRiskTier));

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    const profile = await prisma.complianceProfile.findUnique({ where: { userId: user.id } });
    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load compliance profile.";
    return NextResponse.json({ error: message }, { status: message === "Authentication is required." ? 401 : 400 });
  }
}

export async function PUT(request: Request) {
  try {
    assertSameOrigin();
    const actor = await requireCompliance();
    const body = parseJsonObject(await request.json());
    const userId = requireText(body.userId, "userId", 128);
    const kyc = requireText(body.kyc, "kyc", 32).toUpperCase() as VerificationStatus;
    const kyb = requireText(body.kyb, "kyb", 32).toUpperCase() as VerificationStatus;
    const sanctions = requireText(body.sanctions, "sanctions", 16).toUpperCase() as ScreeningStatus;
    const pep = requireText(body.pep, "pep", 16).toUpperCase() as ScreeningStatus;
    const sourceOfFunds = requireText(body.sourceOfFunds, "sourceOfFunds", 32).toUpperCase() as VerificationStatus;
    const riskTier = requireText(body.riskTier, "riskTier", 16).toUpperCase() as ComplianceRiskTier;

    if (!verificationStatuses.has(kyc) || !verificationStatuses.has(kyb) || !verificationStatuses.has(sourceOfFunds)) {
      throw new Error("Invalid verification status.");
    }
    if (!screeningStatuses.has(sanctions) || !screeningStatuses.has(pep)) throw new Error("Invalid screening status.");
    if (!riskTiers.has(riskTier)) throw new Error("Invalid compliance risk tier.");

    const profile = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId }, select: { id: true } });
      if (!user) throw new Error("User was not found.");

      const updated = await tx.complianceProfile.upsert({
        where: { userId },
        create: {
          userId,
          kyc,
          kyb,
          sanctions,
          pep,
          sourceOfFunds,
          riskTier,
          reviewedAt: new Date(),
          reviewedById: actor.id,
        },
        update: {
          kyc,
          kyb,
          sanctions,
          pep,
          sourceOfFunds,
          riskTier,
          reviewedAt: new Date(),
          reviewedById: actor.id,
        },
      });

      await tx.auditEvent.create({
        data: {
          userId: actor.id,
          action: "COMPLIANCE_PROFILE_REVIEWED",
          target: userId,
          metadata: { kyc, kyb, sanctions, pep, sourceOfFunds, riskTier },
        },
      });
      return updated;
    });

    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update compliance profile.";
    const status = message === "Authentication is required." ? 401 : message.includes("not permitted") || message.includes("not authorized") || message.includes("role is not permitted") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
