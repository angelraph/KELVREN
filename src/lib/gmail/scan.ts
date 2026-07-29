import { prisma } from "@/lib/prisma";
import { getValidAccessToken, searchMessages, getMessage } from "./client";
import { extractDeadline } from "./extract";
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

  let created = 0;
  for (const id of messageIds) {
    if (seen.has(id)) continue;

    const message = await getMessage(accessToken, id);
    const deadline = await extractDeadline(message);
    if (!deadline) continue;

    await prisma.watchItem.create({
      data: {
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
      },
    });
    created++;
  }

  return { created };
}
