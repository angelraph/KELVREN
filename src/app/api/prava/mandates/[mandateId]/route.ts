import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { pauseMandate, resumeMandate, cancelMandate } from "@/lib/prava/client";
import { toMandateStatus } from "@/lib/prava/mandate-status";

const ACTIONS = {
  pause: pauseMandate,
  resume: resumeMandate,
  cancel: cancelMandate,
} as const;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ mandateId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { mandateId } = await params;
  const body = await req.json();
  const action = body.action as keyof typeof ACTIONS;

  if (!ACTIONS[action]) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const mandate = await prisma.mandate.findFirst({
    where: { id: mandateId, userId: session.user.id },
  });
  if (!mandate) {
    return NextResponse.json({ error: "Mandate not found" }, { status: 404 });
  }

  const updated = await ACTIONS[action](mandate.pravaMandateId);

  await prisma.mandate.update({
    where: { id: mandate.id },
    data: { status: toMandateStatus(updated.status) },
  });

  return NextResponse.json({ status: toMandateStatus(updated.status) });
}
