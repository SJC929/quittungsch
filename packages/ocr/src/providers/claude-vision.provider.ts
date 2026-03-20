import Anthropic from "@anthropic-ai/sdk";
import type { ExtractedExpense, OcrProvider } from "@spezo/types";

/**
 * Claude Vision Provider – Layer 2 of the OCR pipeline
 *
 * Semantic extraction using Claude's multimodal capabilities.
 * Called when:
 *  1. Google Vision returns confidence < 0.90, OR
 *  2. Google Vision is unavailable (no API key)
 *
 * Input options:
 *  A) Raw OCR text from Layer 1 (preferred, saves Claude tokens)
 *  B) Direct image as Base64 (fallback when Layer 1 has no text)
 *
 * Model: claude-sonnet-4-6 (latest, multimodal)
 * Cost: ~$0.003 per image (Layer 1 text input) / ~$0.01 per image (direct)
 */

const SYSTEM_PROMPT = `Du bist ein Schweizer Buchhaltungsassistent. Extrahiere Daten aus Belegen präzise und antworte NUR mit validem JSON, ohne Markdown.
Schweizer Kontext: MwSt ist 8.1% (Standard), 3.8% (Beherbergung), 2.5% (Reduziert). Datum immer als ISO 8601. Betrag immer als Zahl.`;

const VALID_CATEGORIES = [
  "restaurant",
  "tankstelle",
  "buero",
  "telefon",
  "transport",
  "unterkunft",
  "versicherung",
  "weiterbildung",
  "diverses",
] as const;

type ValidCategory = (typeof VALID_CATEGORIES)[number];

interface ClaudeExtractedData {
  merchant?: string;
  date?: string;
  total?: number;
  currency?: string;
  subtotal?: number;
  vat_rate?: number;
  vat_amount?: number;
  category?: string;
  receipt_type?: string;
  payment_method?: string;
  line_items?: Array<{ description: string; amount: number }>;
  confidence?: number;
  missing_fields?: string[];
}

export class ClaudeVisionProvider {
  private client: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.warn(
        "[ClaudeVisionProvider] ANTHROPIC_API_KEY not set. " +
          "Semantic OCR (Layer 2) will be unavailable."
      );
    }
    this.client = new Anthropic({ apiKey });
  }

  get isAvailable(): boolean {
    return Boolean(process.env.ANTHROPIC_API_KEY);
  }

  /**
   * Extract expense data from a receipt.
   * Prefers OCR text (faster/cheaper); falls back to direct image analysis.
   */
  async extractFromReceipt(options: {
    ocrText?: string;
    imageBase64?: string;
    mimeType?: string;
  }): Promise<ExtractedExpense> {
    const { ocrText, imageBase64, mimeType = "image/jpeg" } = options;

    if (!ocrText && !imageBase64) {
      throw new Error(
        "[ClaudeVisionProvider] Either ocrText or imageBase64 must be provided."
      );
    }

    const userPrompt = this.buildUserPrompt(ocrText);

    // Build message content
    const content: Anthropic.MessageParam["content"] = imageBase64
      ? [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: imageBase64,
            },
          },
          { type: "text", text: userPrompt },
        ]
      : [{ type: "text", text: userPrompt }];

    const message = await this.client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content }],
    });

    const responseText =
      message.content[0]?.type === "text" ? message.content[0].text : "";

    return this.parseResponse(responseText, ocrText);
  }

  private buildUserPrompt(ocrText?: string): string {
    const ocrSection = ocrText
      ? `Analysiere diesen Beleg. OCR-Rohtext:\n<ocr_text>${ocrText}</ocr_text>\n\n`
      : "Analysiere dieses Belegbild.\n\n";

    return (
      ocrSection +
      `Extrahiere folgende Felder und gib NUR dieses JSON zurück:
{
  "merchant": string,
  "date": string,
  "total": number,
  "currency": string,
  "subtotal": number,
  "vat_rate": number,
  "vat_amount": number,
  "category": string,
  "receipt_type": string,
  "payment_method": string,
  "line_items": [{ "description": string, "amount": number }],
  "confidence": number,
  "missing_fields": string[]
}

Kategorien (nur diese): 'restaurant' | 'tankstelle' | 'buero' | 'telefon' | 'transport' | 'unterkunft' | 'versicherung' | 'weiterbildung' | 'diverses'
receipt_type: 'kassenbon' | 'rechnung' | 'tankbeleg' | 'qr_rechnung'
payment_method: 'cash' | 'card' | 'twint' | 'unknown'
vat_rate: 8.1 | 3.8 | 2.5 | 0
date: ISO 8601 (YYYY-MM-DD)
total, subtotal, vat_amount: Zahl (CHF)
confidence: 0.0-1.0`
    );
  }

  private parseResponse(
    responseText: string,
    ocrText?: string
  ): ExtractedExpense {
    let parsed: ClaudeExtractedData;

    try {
      // Strip any accidental markdown code fences
      const cleaned = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      parsed = JSON.parse(cleaned) as ClaudeExtractedData;
    } catch {
      console.error(
        "[ClaudeVisionProvider] Failed to parse Claude response:",
        responseText.slice(0, 200)
      );
      return this.fallbackResult(ocrText);
    }

    const category = this.normaliseCategory(parsed.category);

    return {
      merchant: parsed.merchant,
      date: parsed.date,
      total: parsed.total,
      currency: parsed.currency ?? "CHF",
      subtotal: parsed.subtotal,
      vatRate: parsed.vat_rate,
      vatAmount: parsed.vat_amount,
      category,
      receiptType: parsed.receipt_type,
      paymentMethod: parsed.payment_method,
      lineItems: parsed.line_items,
      confidence: Math.min(Math.max(parsed.confidence ?? 0.5, 0), 1),
      missingFields: parsed.missing_fields ?? [],
      ocrProvider: "CLAUDE" as OcrProvider,
      rawText: ocrText,
    };
  }

  private normaliseCategory(raw?: string): ValidCategory {
    if (!raw) return "diverses";
    const lower = raw.toLowerCase().trim() as ValidCategory;
    return VALID_CATEGORIES.includes(lower) ? lower : "diverses";
  }

  private fallbackResult(ocrText?: string): ExtractedExpense {
    return {
      confidence: 0.1,
      missingFields: [
        "merchant",
        "date",
        "total",
        "category",
        "vatRate",
      ],
      ocrProvider: "CLAUDE" as OcrProvider,
      rawText: ocrText,
      currency: "CHF",
    };
  }
}
