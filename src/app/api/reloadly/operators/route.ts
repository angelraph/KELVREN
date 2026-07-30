import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { listOperators } from "@/lib/reloadly/client";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const operators = await listOperators("NG");
  const active = operators
    .filter((o) => o.status === "ACTIVE")
    .map((o) => ({
      id: o.id,
      name: o.name,
      data: o.data,
      bundle: o.bundle,
      minAmount: o.minAmount,
      maxAmount: o.maxAmount,
      senderCurrencyCode: o.senderCurrencyCode,
    }));

  return NextResponse.json({ operators: active });
}
