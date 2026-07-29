import { z } from "zod";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { DeadlineCategory } from "@/generated/prisma/enums";
import type { GmailMessage } from "./client";

const CATEGORY_VALUES = Object.values(DeadlineCategory) as [DeadlineCategory, ...DeadlineCategory[]];

const DeadlineExtractionSchema = z.object({
  isRelevant: z.boolean(),
  category: z.enum(CATEGORY_VALUES).nullable(),
  title: z.string().nullable(),
  dueDate: z.string().nullable(),
  merchantName: z.string().nullable(),
  estimatedAmount: z.number().nullable(),
  currency: z.string().nullable(),
});

const SYSTEM_PROMPT = `You read one email at a time for a bill-and-renewal watcher. Its only job is
catching recurring payments and official documents that will auto-renew, come due, or expire -
things a real person pays or files for, on a schedule. Be strict: when in doubt, isRelevant is false.

Relevant categories, matched exactly:
- SUBSCRIPTION: a paid subscription/service that will auto-renew or convert from trial to paid on a
  specific date, where the sender is the actual billing party (e.g. "Your Slack Pro trial converts
  to a paid plan on <date>", "Your ScreenRec subscription renews for $X on <date>")
- UTILITY: an electricity, water, gas, or other utility bill with a payment due date
- PHONE_INTERNET: a mobile phone or internet/broadband bill with a payment due date
- RENT_MORTGAGE: a rent or mortgage payment reminder with a specific due date
- MEMBERSHIP: a gym, club, or membership renewal/payment notice
- DOMAIN: a domain name registration renewal notice from a registrar
- PASSPORT: a passport expiration/renewal notice from a government authority
- VEHICLE_REGISTRATION: a vehicle registration renewal notice from a DMV/authority
- INSURANCE: an insurance premium renewal or payment due notice from an insurer
- PROFESSIONAL_LICENSE: a professional license/certification renewal notice from a licensing body
- PERMIT: a permit renewal notice from an issuing authority
- OTHER: a different but still genuine, dated recurring bill or renewal that doesn't fit any category
  above

isRelevant MUST be false for all of the following, even if they contain a date or the word
"deadline"/"due":
- Project, task, competition, or submission deadlines (hackathons, work items, issue trackers) -
  these are not bills
- Investment offers, "opportunities", pitches, or anything promotional/soliciting money from the
  recipient rather than billing an existing service the recipient already uses
- Newsletters, marketing, or generic notifications with no renewal/billing action
- Anything that reads as spam, phishing, or an unsolicited financial pitch

Only set isRelevant to true if the email is from a service/authority the recipient has an existing
account or document with, states a specific concrete due/expiration/renewal date, and describes an
actual renewal, charge, or required filing - not just an arbitrary deadline mentioned in passing.

If a due date is present, convert it to an ISO 8601 date (YYYY-MM-DD). If an amount is mentioned,
extract it as a plain number with its currency code (default "USD" if only a $ sign is shown and no
other currency is implied). merchantName is the company or service the deadline is with. title is a
short (under 60 characters) human-readable summary, e.g. "example.com domain renewal".`;

let client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

export interface ExtractedDeadline {
  category: DeadlineCategory;
  title: string;
  dueDate: string;
  merchantName: string | null;
  estimatedAmount: number | null;
  currency: string | null;
}

export async function extractDeadline(email: GmailMessage): Promise<ExtractedDeadline | null> {
  const completion = await getClient().chat.completions.parse({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Subject: ${email.subject}\nFrom: ${email.from}\nDate: ${email.date}\n\n${email.bodyText}`,
      },
    ],
    response_format: zodResponseFormat(DeadlineExtractionSchema, "deadline_extraction"),
  });

  const parsed = completion.choices[0]?.message.parsed;
  if (!parsed || !parsed.isRelevant || !parsed.category || !parsed.dueDate) {
    return null;
  }

  const dueDate = new Date(parsed.dueDate);
  if (Number.isNaN(dueDate.getTime())) {
    return null;
  }

  return {
    category: parsed.category,
    title: parsed.title?.trim() || email.subject,
    dueDate: parsed.dueDate,
    merchantName: parsed.merchantName,
    estimatedAmount: parsed.estimatedAmount,
    currency: parsed.currency,
  };
}
