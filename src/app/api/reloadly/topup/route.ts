import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { chargeMandate } from "@/lib/prava/client";
import { sendTopup, ReloadlyApiError } from "@/lib/reloadly/client";
import {
  DeadlineCategory,
  DeadlineSource,
  WatchItemStatus,
  ChargeStatus,
  MandateStatus,
} from "@/generated/prisma/enums";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await req.json();
  const operatorId = Number(body.operatorId);
  const operatorName = (body.operatorName as string) ?? "Reloadly operator";
  const amount = Number(body.amount);
  const phoneNumber = (body.phoneNumber as string)?.trim();

  if (!Number.isFinite(operatorId) || !Number.isFinite(amount) || amount <= 0 || !phoneNumber) {
    return NextResponse.json({ error: "Invalid top-up details" }, { status: 400 });
  }

  const mandate = await prisma.mandate.findFirst({
    where: {
      userId: session.user.id,
      category: DeadlineCategory.PHONE_INTERNET,
      status: MandateStatus.ACTIVE,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!mandate) {
    return NextResponse.json(
      { error: "Set an active Phone & Internet limit first" },
      { status: 400 }
    );
  }

  if (amount > Number(mandate.approvedAmount)) {
    return NextResponse.json(
      { error: `That's over your ${mandate.currency} ${mandate.approvedAmount} Phone & Internet limit` },
      { status: 400 }
    );
  }

  const watchItem = await prisma.watchItem.create({
    data: {
      userId: session.user.id,
      category: DeadlineCategory.PHONE_INTERNET,
      title: `Airtime/data top-up for ${phoneNumber}`,
      dueDate: new Date(),
      source: DeadlineSource.MANUAL,
      merchantName: operatorName,
      estimatedAmount: amount,
      currency: mandate.currency,
      status: WatchItemStatus.AWAITING_APPROVAL,
      mandateId: mandate.id,
    },
  });

  let chargeResult;
  try {
    chargeResult = await chargeMandate(mandate.pravaMandateId, {
      amount: amount.toFixed(2),
      reference: watchItem.id,
    });
  } catch (err) {
    await prisma.watchItem.update({
      where: { id: watchItem.id },
      data: { status: WatchItemStatus.FAILED, decisionRationale: "Prava charge failed to initiate" },
    });
    const message = err instanceof Error ? err.message : "Charge failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  if (chargeResult.status === "failed") {
    await prisma.watchItem.update({
      where: { id: watchItem.id },
      data: { status: WatchItemStatus.FAILED, decisionRationale: chargeResult.errorMessage ?? "Charge declined" },
    });
    return NextResponse.json(
      { error: chargeResult.errorMessage ?? "Charge was declined" },
      { status: 402 }
    );
  }

  const charge = await prisma.charge.create({
    data: {
      watchItemId: watchItem.id,
      mandateId: mandate.id,
      pravaTransactionId: chargeResult.transactionId,
      pravaOrderId: chargeResult.orderId,
      amount,
      currency: mandate.currency,
      merchantName: operatorName,
      status: ChargeStatus.AWAITING_RESULT,
      rationale: `Airtime/data top-up of ${amount} to ${phoneNumber} via ${operatorName}`,
    },
  });

  try {
    const topup = await sendTopup({
      operatorId,
      amount,
      recipientPhone: { countryCode: "NG", number: phoneNumber },
      customIdentifier: charge.id,
    });

    await prisma.$transaction([
      prisma.charge.update({
        where: { id: charge.id },
        data: { status: ChargeStatus.COMPLETED, reportedAt: new Date() },
      }),
      prisma.watchItem.update({
        where: { id: watchItem.id },
        data: { status: WatchItemStatus.EXECUTED },
      }),
    ]);

    return NextResponse.json({ ok: true, reloadlyTransactionId: topup.transactionId });
  } catch (err) {
    await prisma.$transaction([
      prisma.charge.update({
        where: { id: charge.id },
        data: { status: ChargeStatus.FAILED, reportedAt: new Date() },
      }),
      prisma.watchItem.update({
        where: { id: watchItem.id },
        data: {
          status: WatchItemStatus.FAILED,
          decisionRationale:
            "Your card was charged but the top-up to the phone failed - contact support for a refund.",
        },
      }),
    ]);
    const message =
      err instanceof ReloadlyApiError ? err.message : "Top-up failed after the card was charged";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
