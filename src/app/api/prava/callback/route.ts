import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { listMandates } from "@/lib/prava/client";
import { toMandateStatus } from "@/lib/prava/mandate-status";
import { DeadlineCategory } from "@/generated/prisma/enums";

// Prava's hosted checkout redirects here after the user approves (or declines)
// the mandate via passkey. The exact callback query params aren't fully
// documented, so this reconciles by re-fetching the customer's mandates from
// Prava directly rather than trusting anything in the URL beyond our own
// category/userId state - the mandate itself always comes from a real API call.
export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") as DeadlineCategory | null;
  const userId = req.nextUrl.searchParams.get("userId");

  if (!category || !userId || !DeadlineCategory[category]) {
    return NextResponse.redirect(new URL("/onboarding?error=missing_state", req.url));
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.pravaCustomerId) {
    return NextResponse.redirect(new URL("/onboarding?error=unknown_user", req.url));
  }

  const existingIds = new Set(
    (await prisma.mandate.findMany({ where: { userId }, select: { pravaMandateId: true } })).map(
      (m) => m.pravaMandateId
    )
  );

  const { mandates } = await listMandates({
    customerId: user.pravaCustomerId,
    standingOnly: true,
  });

  const newest = mandates
    .filter((m) => !existingIds.has(m.id))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  if (!newest) {
    return NextResponse.redirect(new URL("/onboarding?error=mandate_not_found", req.url));
  }

  await prisma.mandate.create({
    data: {
      userId,
      category,
      pravaMandateId: newest.id,
      merchantScope: newest.merchantScope,
      merchantName: newest.merchantName,
      approvedAmount: newest.approvedAmount,
      currency: newest.currency,
      recurringFrequency: newest.recurringFrequency,
      status: toMandateStatus(newest.status),
    },
  });

  return NextResponse.redirect(new URL("/dashboard?onboarded=1", req.url));
}
