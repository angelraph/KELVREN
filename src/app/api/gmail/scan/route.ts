import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { scanGmailForUser } from "@/lib/gmail/scan";
import { GmailNotConnectedError } from "@/lib/gmail/client";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  try {
    const { created } = await scanGmailForUser(session.user.id);
    return NextResponse.json({ created });
  } catch (err) {
    if (err instanceof GmailNotConnectedError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
