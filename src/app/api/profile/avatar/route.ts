import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const MAX_DATA_URL_LENGTH = 1_500_000;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await req.json();
  const dataUrl = body.dataUrl as string | undefined;

  if (!dataUrl || !/^data:image\/(png|jpeg|jpg|webp|gif);base64,/.test(dataUrl)) {
    return NextResponse.json({ error: "Choose a valid image file" }, { status: 400 });
  }
  if (dataUrl.length > MAX_DATA_URL_LENGTH) {
    return NextResponse.json({ error: "Image is too large (max ~1MB)" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: dataUrl },
  });

  return NextResponse.json({ ok: true });
}
