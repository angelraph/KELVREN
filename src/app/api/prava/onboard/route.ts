import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createSession, PravaApiError } from "@/lib/prava/client";
import { DeadlineCategory } from "@/generated/prisma/enums";
import { CATEGORY_LABEL } from "@/lib/categories";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await req.json();
  const category = body.category as DeadlineCategory;
  const monthlyLimit = Number(body.monthlyLimit);
  const currency = (body.currency as string) || "USD";

  if (!DeadlineCategory[category] || !Number.isFinite(monthlyLimit) || monthlyLimit <= 0) {
    return NextResponse.json({ error: "Invalid category or limit" }, { status: 400 });
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });

  const pravaCustomerId = user.pravaCustomerId ?? user.id;
  if (!user.pravaCustomerId) {
    await prisma.user.update({
      where: { id: user.id },
      data: { pravaCustomerId },
    });
  }

  const baseUrl = process.env.NEXTAUTH_URL;
  if (!baseUrl) {
    throw new Error("NEXTAUTH_URL is not set");
  }

  const label = CATEGORY_LABEL[category];
  const amount = monthlyLimit.toFixed(2);

  const callbackUrl = new URL("/api/prava/callback", baseUrl);
  callbackUrl.searchParams.set("category", category);
  callbackUrl.searchParams.set("userId", user.id);

  try {
    const result = await createSession({
      user_id: pravaCustomerId,
      user_email: user.email,
      total_amount: amount,
      currency,
      integration_type: "full_checkout",
      callback_url: callbackUrl.toString(),
      purchase_context: [
        {
          merchant_details: {
            name: `Kelvren - ${label}`,
            url: baseUrl,
            country_code_iso2: "US",
          },
          product_details: [
            {
              description: `${label} auto-renewal authorization`,
              unit_price: amount,
              quantity: 1,
            },
          ],
        },
      ],
      mandate_setup: {
        intent: "mandate_setup",
        recurring_frequency: "monthly",
        merchant_scope: "any",
      },
    });

    return NextResponse.json({ iframeUrl: result.iframe_url });
  } catch (err) {
    if (err instanceof PravaApiError) {
      const body = err.body as { error?: { message?: string; details?: { fieldErrors?: Record<string, string[]> } } } | undefined;
      const fieldError = Object.values(body?.error?.details?.fieldErrors ?? {})[0]?.[0];
      const message = fieldError ?? body?.error?.message ?? err.message;
      return NextResponse.json({ error: message }, { status: err.status });
    }
    throw err;
  }
}
