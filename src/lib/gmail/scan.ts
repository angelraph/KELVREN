import { prisma } from "@/lib/prisma";
import { getValidAccessToken, searchMessages, getMessage } from "./client";
import { extractDeadline, type ExtractedDeadline } from "./extract";
import { WatchItemStatus, DeadlineSource } from "@/generated/prisma/enums";

const SEARCH_QUERY =
  '(renew OR renewal OR renewing OR expir* OR "due on" OR "payment due" OR registration OR premium OR license OR permit) newer_than:180d -category:promotions';

export async function scanGmailForUser(userId: string): Promise<{ created: number }> {
  const accessToken = await getValidAccessToken(userId);
  const messageIds = await searchMessages(accessToken, SEARCH_QUERY, 30);

  if (messageIds.length === 0) {
    return { created: 0 };
  }

  const existing = await prisma.watchItem.findMany({
    where: { userId, gmailMessageId: { in: messageIds } },
    select: { gmailMessageId: true },
  });
  const seen = new Set(existing.map((w) => w.gmailMessageId));
  const toProcess = messageIds.filter((id) => !seen.has(id));

  if (toProcess.length === 0) {
    return { created: 0 };
  }

  // Fetching + extracting one message at a time (up to 30, each a Gmail
  // call plus an OpenAI call) routinely ran past Vercel's function time
  // limit, which cuts the response off mid-stream - the client then sees
  // a truncated, non-JSON body and throws "Unexpected end of JSON input".
  // Running them concurrently keeps the whole scan within a few seconds
  // regardless of how many messages matched.
  const results = await Promise.all(
    toProcess.map(async (id): Promise<{ id: string; deadline: ExtractedDeadline } | null> => {
      const message = await getMessage(accessToken, id);
      const deadline = await extractDeadline(message);
      return deadline ? { id, deadline } : null;
    })
  );

  const found = results.filter((r): r is { id: string; deadline: ExtractedDeadline } => r !== null);
  if (found.length === 0) {
    return { created: 0 };
  }

  await prisma.watchItem.createMany({
    data: found.map(({ id, deadline }) => ({
      userId,
      category: deadline.category,
      title: deadline.title,
      dueDate: new Date(deadline.dueDate),
      source: DeadlineSource.GMAIL_SCAN,
      gmailMessageId: id,
      merchantName: deadline.merchantName,
      estimatedAmount: deadline.estimatedAmount,
      currency: deadline.currency,
      status: WatchItemStatus.PENDING,
    })),
  });

  return { created: found.length };
}
