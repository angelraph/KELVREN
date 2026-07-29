import { OAuth2Client } from "google-auth-library";
import { prisma } from "@/lib/prisma";

const GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1/users/me";

export class GmailNotConnectedError extends Error {
  constructor() {
    super("No Google account with a refresh token found for this user.");
    this.name = "GmailNotConnectedError";
  }
}

export async function getValidAccessToken(userId: string): Promise<string> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });

  if (!account?.refresh_token) {
    throw new GmailNotConnectedError();
  }

  const client = new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  });
  client.setCredentials({
    refresh_token: account.refresh_token,
    access_token: account.access_token,
    expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
  });

  const { token } = await client.getAccessToken();
  if (!token) {
    throw new Error("Google did not return an access token.");
  }

  const newExpiryDate =
    typeof client.credentials.expiry_date === "number" ? client.credentials.expiry_date : undefined;

  if (token !== account.access_token) {
    await prisma.account.update({
      where: { id: account.id },
      data: {
        access_token: token,
        expires_at: newExpiryDate ? Math.floor(newExpiryDate / 1000) : account.expires_at,
      },
    });
  }

  return token;
}

async function gmailFetch(accessToken: string, path: string): Promise<unknown> {
  const res = await fetch(`${GMAIL_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gmail API request failed (${res.status}): ${body}`);
  }
  return res.json();
}

export async function searchMessages(
  accessToken: string,
  query: string,
  maxResults = 25
): Promise<string[]> {
  const params = new URLSearchParams({ q: query, maxResults: String(maxResults) });
  const data = (await gmailFetch(accessToken, `/messages?${params.toString()}`)) as {
    messages?: { id: string }[];
  };
  return (data.messages ?? []).map((m) => m.id);
}

export interface GmailMessage {
  id: string;
  subject: string;
  from: string;
  date: string;
  bodyText: string;
}

function decodeBase64Url(data: string): string {
  const normalized = data.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf-8");
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

interface GmailPart {
  mimeType?: string;
  body?: { data?: string };
  parts?: GmailPart[];
}

function extractBody(payload: GmailPart): string {
  if (payload.body?.data && payload.mimeType === "text/plain") {
    return decodeBase64Url(payload.body.data);
  }
  if (payload.body?.data && payload.mimeType === "text/html") {
    return stripHtml(decodeBase64Url(payload.body.data));
  }
  for (const part of payload.parts ?? []) {
    if (part.mimeType === "text/plain" && part.body?.data) {
      return decodeBase64Url(part.body.data);
    }
  }
  for (const part of payload.parts ?? []) {
    if (part.mimeType === "text/html" && part.body?.data) {
      return stripHtml(decodeBase64Url(part.body.data));
    }
  }
  for (const part of payload.parts ?? []) {
    const nested = extractBody(part);
    if (nested) return nested;
  }
  return "";
}

export async function getMessage(accessToken: string, id: string): Promise<GmailMessage> {
  const data = (await gmailFetch(accessToken, `/messages/${id}?format=full`)) as {
    id: string;
    payload: GmailPart & { headers?: { name: string; value: string }[] };
  };

  const headers = data.payload.headers ?? [];
  const header = (name: string) =>
    headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";

  return {
    id: data.id,
    subject: header("Subject"),
    from: header("From"),
    date: header("Date"),
    bodyText: extractBody(data.payload).slice(0, 6000),
  };
}
