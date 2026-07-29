export type PravaMerchantScope = "any" | "listed";
export type PravaRecurringFrequency = "one_time" | "weekly" | "monthly" | "yearly";

export interface PravaMerchantDetails {
  name: string;
  url: string;
  country_code_iso2: string;
  mcc?: string;
  category_description?: string;
}

export interface PravaProductDetail {
  description: string;
  unit_price: string;
  external_product_id?: string;
  quantity: number;
}

export interface PravaPurchaseContext {
  merchant_details: PravaMerchantDetails;
  product_details: PravaProductDetail[];
  mandate_duration_minutes?: number;
}

export interface PravaMandateSetup {
  intent: "mandate_setup";
  recurring_frequency: PravaRecurringFrequency;
  merchant_scope: PravaMerchantScope;
  valid_until?: string;
  max_charges?: number;
}

export interface CreateSessionInput {
  user_id: string;
  user_email: string;
  total_amount: string;
  currency: string;
  purchase_context: [PravaPurchaseContext];
  user_phone?: string;
  user_country_code_iso2?: string;
  external_order_ref?: string;
  description?: string;
  integration_type?: "full_checkout" | "embedding";
  callback_url?: string;
  card?: { card_id?: string; vault_ref_id?: string };
  mandate_setup?: PravaMandateSetup;
}

export interface CreateSessionResponse {
  session_id: string;
  session_token: string;
  iframe_url: string;
  order_id: string;
  expires_at: string;
  authorizeOnly?: boolean;
}

export interface PravaCard {
  card_id: string;
  card_last4: string;
  card_brand: string | null;
  card_exp_month: number | null;
  card_exp_year: number | null;
  masked_card_number: string | null;
  is_default: boolean;
  status: "active" | "deleted";
  card_art_url: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface ListCardsResponse {
  cards: PravaCard[];
  count: number;
}

export interface PravaLineItemProduct {
  product_ref_id: string;
  external_product_id: string | null;
  name: string;
  unit_price: string;
  quantity: number;
}

export interface PravaLineItem {
  txn_ref_id: string;
  merchant_name: string | null;
  merchant_url: string | null;
  total_amount: string;
  status: string;
  token: string | null;
  dynamic_cvv: string | null;
  expiry_month: string | null;
  expiry_year: string | null;
  products: PravaLineItemProduct[];
  error?: { code: string; message: string };
}

export interface PravaTransaction {
  txn_id: string;
  status: string;
  line_items: PravaLineItem[];
}

export interface PaymentResultResponse {
  session_id: string;
  order_id: string | null;
  status: "pending" | "processing" | "awaiting_result" | "completed" | "failed";
  transactions: PravaTransaction[];
}

export interface ReportStatusInput {
  txn_ref_id: string;
  txn_status: "APPROVED" | "DECLINED";
  txn_type?: string;
  authorization_code?: string;
  response_code?: string;
  amount_paid?: string;
  product_statuses?: { product_id?: string; product_ref_id?: string; status: string }[];
}

export interface ReportStatusResponse {
  status: "confirmed";
  txn_ref_id: string;
  txn_status: "APPROVED" | "DECLINED";
  visa_confirmation: "SUCCESS" | "FAILURE";
}

export interface DeleteCardInput {
  customer_id: string;
  card_id: string;
  reason?:
    | "CUSTOMER_CONFIRMED"
    | "LOST"
    | "STOLEN"
    | "SUSPECTED_FRAUD"
    | "CLOSED_ACCOUNT"
    | "OTHER";
}

export interface DeleteCardResponse {
  success: boolean;
  card_id: string;
  was_default: boolean;
  network_token_deleted: boolean;
}

export type PravaMandateState = "available" | "consumed" | "expired";
export type PravaMandateStatus =
  | "pending"
  | "active"
  | "paused"
  | "consumed"
  | "cancelled"
  | "expired";

export interface PravaMandate {
  id: string;
  agentId: string;
  customerId: string;
  externalUserId: string;
  state: PravaMandateState;
  status: PravaMandateStatus;
  recurringFrequency: PravaRecurringFrequency;
  merchantScope: PravaMerchantScope;
  merchantName: string;
  approvedAmount: string;
  remaining: string;
  currency: string;
  validUntil: string | null;
  renewsAt: string | null;
  lastCharge: { status: string; at: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface PravaMandateCharge {
  transactionId: string;
  amount: string;
  currency: string;
  status: string;
  reference: string | null;
  createdAt: string;
}

export interface PravaMandateDetail extends PravaMandate {
  spent: string;
  chargeCount: number;
  charges: PravaMandateCharge[];
}

export interface ListMandatesResponse {
  mandates: PravaMandate[];
}

export interface ChargeMandateInput {
  amount: string;
  reference?: string;
  purchase_context?: PravaPurchaseContext[];
}

export interface ChargeMandateResponse {
  mandateId: string;
  instructionId: string;
  transactionId: string;
  orderId: string;
  status: "awaiting_result" | "failed";
  fetchStatus: "SUCCESS" | "FAILURE";
  credentials?: {
    token: string;
    dynamicCvv: string;
    expiryMonth: string;
    expiryYear: string;
  };
  encrypted_payload?: {
    ephemeral_public_key: string;
    iv: string;
    auth_tag: string;
    data: string;
  };
  errorCode?: string;
  errorMessage?: string;
  deduplicated: boolean;
}

export interface ReportMandateChargeInput {
  txn_status: "APPROVED" | "DECLINED";
  txn_type: "PURCHASE";
  authorization_code?: string;
  response_code?: string;
  amount_paid?: string;
}

export interface ReportMandateChargeResponse {
  mandateId: string;
  transactionId: string;
  orderId: string;
  status: "completed" | "failed";
  mandateStatus: string;
  visaConfirmation: "SUCCESS" | "FAILURE";
}
