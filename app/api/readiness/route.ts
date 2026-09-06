import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const databaseConfigured = Boolean(process.env.DATABASE_URL);

  if (!databaseConfigured) {
    return NextResponse.json(
      {
        ok: false,
        service: "rug-pull-lab",
        checks: {
          database: "NOT_CONFIGURED",
          destructiveExecution: "DISABLED",
          productionSigning: "DISABLED",
        },
        readiness: "NOT_READY",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }

  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      ok: true,
      service: "rug-pull-lab",
      checks: {
        database: "READY",
        destructiveExecution: "DISABLED",
        productionSigning: "DISABLED",
      },
      readiness: "READY_FOR_SERVER_RUNTIME",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        service: "rug-pull-lab",
        checks: {
          database: "UNAVAILABLE",
          destructiveExecution: "DISABLED",
          productionSigning: "DISABLED",
        },
        readiness: "NOT_READY",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
