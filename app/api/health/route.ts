import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "rug-pull-lab",
    environment: process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet",
    destructiveExecution: false,
    productionSigning: false,
    timestamp: new Date().toISOString(),
  });
}
