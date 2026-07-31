import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { scanGmailForUser } from "@/lib/gmail/scan";
import { GmailNotConnectedError } from "@/lib/gmail/client";

// Scanning fans a Gmail fetch + an OpenAI extraction call out per matching
// message. Even running those concurrently, a large inbox can take longer
// than the platform's default function timeout - give it real headroom
// instead of getting cut off mid-response.
export const maxDuration = 60;

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
    // Whatever broke (Gmail API hiccup, OpenAI hiccup, a bad message body),
    // the client must still get a parseable JSON body - an uncaught throw
    // here would otherwise surface as Next's HTML error page, which fails
    // res.json() client-side with a confusing "Unexpected end of JSON input".
    console.error("[gmail/scan] scan failed:", err);
    return NextResponse.json(
      { error: "Gmail scan failed. Try again in a moment." },
      { status: 500 }
    );
  }
}
