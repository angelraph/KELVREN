import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { listBillers } from "@/lib/reloadly/client";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { content } = await listBillers("NG");
  const billers = content
    .filter((b) => b.type === "ELECTRICITY_BILL_PAYMENT")
    .map((b) => ({
      id: b.id,
      name: b.name,
      serviceType: b.serviceType,
      minLocalTransactionAmount: b.minLocalTransactionAmount,
      maxLocalTransactionAmount: b.maxLocalTransactionAmount,
      localTransactionCurrencyCode: b.localTransactionCurrencyCode,
    }));

  return NextResponse.json({ billers });
}
