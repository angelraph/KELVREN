import type {
  CreateSessionInput,
  CreateSessionResponse,
  DeleteCardInput,
  DeleteCardResponse,
  ListCardsResponse,
  ListMandatesResponse,
  PaymentResultResponse,
  ChargeMandateInput,
  ChargeMandateResponse,
  PravaMandate,
  PravaMandateDetail,
  ReportMandateChargeInput,
  ReportMandateChargeResponse,
  ReportStatusInput,
  ReportStatusResponse,
} from "./types";

const SANDBOX_BASE_URL = "https://sandbox.api.prava.space";
const PRODUCTION_BASE_URL = "https://api.prava.space";

export class PravaApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body: unknown
  ) {
    super(message);
    this.name = "PravaApiError";
  }
}

function baseUrl(): string {
  return process.env.PRAVA_ENV === "production" ? PRODUCTION_BASE_URL : SANDBOX_BASE_URL;
}

function secretKey(): string {
  const key = process.env.PRAVA_SECRET_KEY;
  if (!key) {
    throw new Error(
      "PRAVA_SECRET_KEY is not set. Create a sandbox key at dashboard.prava.space and add it to .env before calling Prava."
    );
  }
  return key;
}

async function request<T>(
  method: "GET" | "POST",
  path: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(`${baseUrl()}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : undefined;

  if (!res.ok) {
    throw new PravaApiError(
      `Prava API ${method} ${path} failed with status ${res.status}`,
      res.status,
      json
    );
  }

  return json as T;
}

export function createSession(input: CreateSessionInput) {
  return request<CreateSessionResponse>("POST", "/v1/sessions", input);
}

export function revokeSession(sessionId: string) {
  return request<{ success: boolean }>("POST", `/v1/sessions/${sessionId}/revoke`);
}

export function listCards(
  customerId: string,
  opts?: { status?: "active" | "all"; includeCardArt?: boolean }
) {
  const params = new URLSearchParams({ customer_id: customerId });
  if (opts?.status) params.set("status", opts.status);
  if (opts?.includeCardArt !== undefined)
    params.set("include_card_art", String(opts.includeCardArt));
  return request<ListCardsResponse>("GET", `/v1/listCards?${params.toString()}`);
}

export function getPaymentResult(sessionId: string) {
  return request<PaymentResultResponse>(
    "GET",
    `/v1/sessions/${sessionId}/payment-result`
  );
}

export function reportStatus(sessionId: string, input: ReportStatusInput) {
  return request<ReportStatusResponse>(
    "POST",
    `/v1/sessions/${sessionId}/report-status`,
    input
  );
}

export function deleteCard(input: DeleteCardInput) {
  return request<DeleteCardResponse>("POST", "/v1/deleteCard", input);
}

export function listMandates(opts?: { customerId?: string; standingOnly?: boolean }) {
  const params = new URLSearchParams();
  if (opts?.customerId) params.set("customer_id", opts.customerId);
  if (opts?.standingOnly !== undefined)
    params.set("standing_only", String(opts.standingOnly));
  const qs = params.toString();
  return request<ListMandatesResponse>("GET", `/v1/mandates${qs ? `?${qs}` : ""}`);
}

export function getMandate(mandateId: string) {
  return request<PravaMandateDetail>("GET", `/v1/mandates/${mandateId}`);
}

export function chargeMandate(mandateId: string, input: ChargeMandateInput) {
  return request<ChargeMandateResponse>(
    "POST",
    `/v1/mandates/${mandateId}/charge`,
    input
  );
}

export function reportMandateCharge(
  mandateId: string,
  transactionId: string,
  input: ReportMandateChargeInput
) {
  return request<ReportMandateChargeResponse>(
    "POST",
    `/v1/mandates/${mandateId}/charges/${transactionId}/report`,
    input
  );
}

export function pauseMandate(mandateId: string) {
  return request<PravaMandate>("POST", `/v1/mandates/${mandateId}/pause`);
}

export function resumeMandate(mandateId: string) {
  return request<PravaMandate>("POST", `/v1/mandates/${mandateId}/resume`);
}

export function cancelMandate(mandateId: string) {
  return request<PravaMandate>("POST", `/v1/mandates/${mandateId}/cancel`);
}
