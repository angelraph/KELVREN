const TOPUPS_BASE =
  process.env.RELOADLY_ENV === "production"
    ? "https://topups.reloadly.com"
    : "https://topups-sandbox.reloadly.com";

const UTILITIES_BASE =
  process.env.RELOADLY_ENV === "production"
    ? "https://utilities.reloadly.com"
    : "https://utilities-sandbox.reloadly.com";

export class ReloadlyApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body: unknown
  ) {
    super(message);
    this.name = "ReloadlyApiError";
  }
}

interface CachedToken {
  token: string;
  expiresAt: number;
}

const tokenCache = new Map<string, CachedToken>();

async function getAccessToken(audience: string): Promise<string> {
  const cached = tokenCache.get(audience);
  if (cached && cached.expiresAt > Date.now() + 30_000) {
    return cached.token;
  }

  const clientId = process.env.RELOADLY_CLIENT_ID;
  const clientSecret = process.env.RELOADLY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("RELOADLY_CLIENT_ID / RELOADLY_CLIENT_SECRET are not set.");
  }

  const res = await fetch("https://auth.reloadly.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
      audience,
    }),
    cache: "no-store",
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : undefined;
  if (!res.ok) {
    throw new ReloadlyApiError("Reloadly auth failed", res.status, json);
  }

  tokenCache.set(audience, {
    token: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  });
  return json.access_token;
}

async function request<T>(
  base: string,
  method: "GET" | "POST",
  path: string,
  accept: string,
  body?: unknown
): Promise<T> {
  const token = await getAccessToken(base);
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: accept,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : undefined;
  if (!res.ok) {
    throw new ReloadlyApiError(
      `Reloadly ${method} ${path} failed with status ${res.status}`,
      res.status,
      json
    );
  }
  return json as T;
}

function topupRequest<T>(method: "GET" | "POST", path: string, body?: unknown) {
  return request<T>(TOPUPS_BASE, method, path, "application/com.reloadly.topups-v1+json", body);
}

function utilityRequest<T>(method: "GET" | "POST", path: string, body?: unknown) {
  return request<T>(UTILITIES_BASE, method, path, "application/com.reloadly.utilities-v1+json", body);
}

export interface ReloadlyOperator {
  id: number;
  name: string;
  bundle: boolean;
  data: boolean;
  minAmount: number;
  maxAmount: number;
  senderCurrencyCode: string;
  destinationCurrencyCode: string;
  country: { isoName: string; name: string };
  fx: { rate: number; currencyCode: string };
  status: string;
}

export function listOperators(countryCode: string) {
  return topupRequest<ReloadlyOperator[]>("GET", `/operators/countries/${countryCode}`);
}

export function detectOperator(phone: string, countryCode: string) {
  return topupRequest<ReloadlyOperator>(
    "GET",
    `/operators/auto-detect/phone/${encodeURIComponent(phone)}/countries/${countryCode}`
  );
}

export interface ReloadlyTopupResult {
  transactionId: number;
  status: string;
  operatorTransactionId?: string;
  customIdentifier?: string;
  recipientPhone: string;
  amount: number;
  currencyCode: string;
  deliveredAmount?: number;
  deliveredAmountCurrencyCode?: string;
}

export function sendTopup(input: {
  operatorId: number;
  amount: number;
  recipientPhone: { countryCode: string; number: string };
  customIdentifier: string;
}) {
  return topupRequest<ReloadlyTopupResult>("POST", "/topups", {
    operatorId: input.operatorId,
    amount: input.amount,
    useLocalAmount: false,
    customIdentifier: input.customIdentifier,
    recipientPhone: input.recipientPhone,
  });
}

export interface ReloadlyBiller {
  id: number;
  name: string;
  countryCode: string;
  type: string;
  serviceType: string;
  localTransactionCurrencyCode: string;
  minLocalTransactionAmount: number;
  maxLocalTransactionAmount: number;
}

export function listBillers(countryCode: string) {
  return utilityRequest<{ content: ReloadlyBiller[] }>(
    "GET",
    `/billers?countryISOCode=${countryCode}`
  );
}

export interface ReloadlyBillPaymentResult {
  transactionId: number;
  status: string;
  billerName: string;
  subscriberAccountNumber: string;
  amount: number;
}

export function payBill(input: {
  billerId: number;
  subscriberAccountNumber: string;
  amount: number;
  useLocalAmount: boolean;
  referenceId: string;
}) {
  return utilityRequest<ReloadlyBillPaymentResult>("POST", "/pay", {
    billerId: input.billerId,
    subscriberAccountNumber: input.subscriberAccountNumber,
    amount: input.amount,
    useLocalAmount: input.useLocalAmount,
    referenceId: input.referenceId,
  });
}
