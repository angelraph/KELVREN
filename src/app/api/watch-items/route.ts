import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DeadlineCategory, DeadlineSource, WatchItemStatus } from "@/generated/prisma/enums";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await req.json();
  const category = body.category as DeadlineCategory;
  const title = (body.title as string)?.trim();
  const dueDate = new Date(body.dueDate);
  const merchantName = (body.merchantName as string)?.trim() || null;
  const estimatedAmount =
    body.estimatedAmount !== undefined && body.estimatedAmount !== ""
      ? Number(body.estimatedAmount)
      : null;
  const currency = (body.currency as string) || "USD";

  if (
    !DeadlineCategory[category] ||
    !title ||
    Number.isNaN(dueDate.getTime()) ||
    (estimatedAmount !== null && !Number.isFinite(estimatedAmount))
  ) {
    return NextResponse.json({ error: "Invalid deadline details" }, { status: 400 });
  }

  const watchItem = await prisma.watchItem.create({
    data: {
      userId: session.user.id,
      category,
      title,
      dueDate,
      source: DeadlineSource.MANUAL,
      merchantName,
      estimatedAmount,
      currency: estimatedAmount !== null ? currency : null,
      status: WatchItemStatus.PENDING,
    },
  });

  return NextResponse.json({ id: watchItem.id });
}
