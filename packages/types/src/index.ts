// ─── QuittungsCH – Shared TypeScript Types ────────────────────────────────────

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  role: "OWNER" | "ADMIN" | "MEMBER";
  tenantId: string;
  image?: string | null;
}

export interface Session {
  user: AuthUser;
  expires: string;
}

// ─── Tenant ───────────────────────────────────────────────────────────────────

export type Plan = "FREE" | "TRIAL" | "PRO";
export type PaymentProvider = "STRIPE" | "DATATRANS" | "NONE";
export type ExportFormat = "EXCEL" | "CSV" | "PDF" | "GOOGLE_SHEETS";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  uid?: string | null;
  plan: Plan;
  trialEndsAt?: Date | null;
  activeProvider: PaymentProvider;
  ocrEnabled: boolean;
  preferredLanguage: string;
  preferredExportFormat: ExportFormat;
  createdAt: Date;
}

// ─── Expense ──────────────────────────────────────────────────────────────────

export type ExpenseCategory =
  | "RESTAURANT"
  | "TANKSTELLE"
  | "BUERO"
  | "TELEFON"
  | "TRANSPORT"
  | "UNTERKUNFT"
  | "VERSICHERUNG"
  | "WEITERBILDUNG"
  | "DIVERSES";

export type ReceiptType =
  | "KASSENBON"
  | "RECHNUNG"
  | "TANKBELEG"
  | "QR_RECHNUNG"
  | "SONSTIGE";

export type PaymentMethod =
  | "CASH"
  | "CARD"
  | "TWINT"
  | "BANK_TRANSFER"
  | "UNKNOWN";

export type OcrProvider =
  | "GOOGLE_VISION"
  | "AWS_TEXTRACT"
  | "CLAUDE"
  | "TESSERACT"
  | "QR"
  | "MANUAL";

export interface LineItem {
  description: string;
  amount: number;
}

export interface Expense {
  id: string;
  tenantId: string;
  userId: string;
  amount: number;
  currency: string;
  merchantName?: string | null;
  date: Date;
  category: ExpenseCategory;
  vatAmount?: number | null;
  vatRate?: number | null;
  subtotal?: number | null;
  receiptType: ReceiptType;
  paymentMethod: PaymentMethod;
  lineItems?: LineItem[] | null;
  notes?: string | null;
  receiptImageUrl?: string | null;
  ocrRawText?: string | null;
  ocrConfidence?: number | null;
  ocrProvider?: OcrProvider | null;
  needsReview: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExpenseInput {
  amount: number;
  currency?: string;
  merchantName?: string;
  date: Date | string;
  category: ExpenseCategory;
  vatAmount?: number;
  vatRate?: number;
  subtotal?: number;
  receiptType?: ReceiptType;
  paymentMethod?: PaymentMethod;
  lineItems?: LineItem[];
  notes?: string;
  receiptImageUrl?: string;
}

export interface UpdateExpenseInput extends Partial<CreateExpenseInput> {
  id: string;
}

// ─── OCR ──────────────────────────────────────────────────────────────────────

export interface TextBlock {
  text: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface OcrRawResult {
  fullText: string;
  blocks: TextBlock[];
  confidence: number;
}

export interface ExtractedExpense {
  merchant?: string;
  date?: string;
  total?: number;
  currency?: string;
  subtotal?: number;
  vatRate?: number;
  vatAmount?: number;
  category?: string;
  receiptType?: string;
  paymentMethod?: string;
  lineItems?: LineItem[];
  confidence: number;
  missingFields: string[];
  ocrProvider: OcrProvider;
  rawText?: string;
}

export interface ReceiptInput {
  type: "image" | "pdf";
  buffer: Buffer;
  mimeType: string;
  tenantId: string;
}

// QR-Rechnung (Swiss QR Invoice)
export interface QrRechnungData {
  iban: string;
  amount?: number;
  currency: string;
  creditorName: string;
  creditorAddress?: string;
  referenceNumber?: string;
  paymentPurpose?: string;
  confidence: 1.0;
}

// Confidence thresholds
export const OCR_CONFIDENCE = {
  HIGH: 0.9,    // ≥ 0.90: green checkmark, auto-save possible
  MEDIUM: 0.75, // 0.75–0.89: yellow warning, user should check
  LOW: 0,       // < 0.75: red alert, fields highlighted orange
} as const;

// ─── Payments ─────────────────────────────────────────────────────────────────

export type SubscriptionStatus =
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "TRIALING"
  | "INCOMPLETE";

export interface CheckoutSession {
  id: string;
  url: string;
  provider: PaymentProvider;
}

export interface SubscriptionStatusResult {
  status: SubscriptionStatus;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  provider: PaymentProvider;
}

export interface WebhookEvent {
  type:
    | "payment_succeeded"
    | "subscription_deleted"
    | "customer_updated"
    | "invoice_payment_failed";
  tenantId?: string;
  data: Record<string, unknown>;
}

// ─── KilometerLog (Phase 2) ───────────────────────────────────────────────────

export interface KilometerLog {
  id: string;
  tenantId: string;
  userId: string;
  date: Date;
  fromLocation: string;
  toLocation: string;
  distanceKm: number;
  purpose?: string | null;
  ratePerKm: number;
  totalAmount?: number | null;
  createdAt: Date;
}

export interface CreateKilometerLogInput {
  date: Date | string;
  fromLocation: string;
  toLocation: string;
  distanceKm: number;
  purpose?: string;
  ratePerKm?: number;
}

// ─── Export ───────────────────────────────────────────────────────────────────

export interface ExportRequest {
  format: ExportFormat;
  dateFrom: Date | string;
  dateTo: Date | string;
  includeKmLogs?: boolean;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

export interface OnboardingData {
  step: 1 | 2 | 3 | 4;
  businessName?: string;
  uid?: string;
  preferredExportFormat?: ExportFormat;
  language?: string;
}
