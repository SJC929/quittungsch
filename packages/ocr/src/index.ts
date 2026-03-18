import type { ExtractedExpense, OcrProvider, ReceiptInput } from "@quittungsch/types";
import { OCR_CONFIDENCE } from "@quittungsch/types";
import { GoogleVisionProvider } from "./providers/google-vision.provider";
import { ClaudeVisionProvider } from "./providers/claude-vision.provider";
import { TesseractProvider } from "./providers/tesseract.provider";
import { detectQrRechnung, qrRechnungToExpense } from "./handlers/qr-rechnung.handler";
import { extractPdfText, pdfToImages, textToOcrResult } from "./handlers/pdf.handler";

export { GoogleVisionProvider } from "./providers/google-vision.provider";
export { ClaudeVisionProvider } from "./providers/claude-vision.provider";
export { AwsTextractProvider } from "./providers/aws-textract.provider";
export { TesseractProvider } from "./providers/tesseract.provider";
export { detectQrRechnung, parseQrRechnungPayload, qrRechnungToExpense } from "./handlers/qr-rechnung.handler";
export { extractPdfText, pdfToImages } from "./handlers/pdf.handler";

/**
 * Main OCR entry point – 3-Layer Pipeline
 *
 * Layer 1: Google Cloud Vision (primary – structured text extraction)
 * Layer 2: Claude Vision (semantic understanding)
 * Layer 3: Manual fallback (returned when confidence < LOW threshold)
 *
 * The pipeline stops as soon as confidence >= OCR_CONFIDENCE.HIGH (0.90).
 *
 * Special cases handled before the pipeline:
 *  - Swiss QR-Rechnung: decoded from QR code → confidence = 1.0
 *  - Digital PDF: text extracted directly → feeds into Layer 2
 *  - Scanned PDF: converted to images → feeds into Layer 1
 */
export async function processReceipt(
  input: ReceiptInput
): Promise<ExtractedExpense> {
  const googleVision = new GoogleVisionProvider();
  const claudeVision = new ClaudeVisionProvider();
  const tesseract = new TesseractProvider();

  // ── Pre-check: Swiss QR-Rechnung ─────────────────────────────────────────
  if (input.type === "image") {
    const qrData = await detectQrRechnung(input.buffer).catch(() => null);
    if (qrData) {
      const expense = qrRechnungToExpense(qrData);
      return {
        merchant: expense.merchantName,
        total: expense.amount,
        currency: expense.currency,
        receiptType: expense.receiptType,
        paymentMethod: expense.paymentMethod,
        notes: expense.notes,
        confidence: 1.0,
        missingFields: [],
        ocrProvider: "QR" as OcrProvider,
      };
    }
  }

  // ── PDF handling ──────────────────────────────────────────────────────────
  if (input.type === "pdf") {
    return await processPdf(input.buffer, claudeVision, googleVision, tesseract);
  }

  // ── Image pipeline ────────────────────────────────────────────────────────
  return await processImage(input.buffer, googleVision, claudeVision, tesseract);
}

// ─── Image pipeline ───────────────────────────────────────────────────────────

async function processImage(
  imageBuffer: Buffer,
  googleVision: GoogleVisionProvider,
  claudeVision: ClaudeVisionProvider,
  tesseract: TesseractProvider
): Promise<ExtractedExpense> {
  let ocrText: string | undefined;

  // ── Layer 1: Google Vision ────────────────────────────────────────────────
  if (googleVision.isAvailable) {
    try {
      console.log("[OCR] Layer 1: Google Vision");
      const ocrResult = await googleVision.extractText(imageBuffer);
      ocrText = ocrResult.fullText;

      // If Google Vision has high confidence on pure text extraction,
      // still run Claude for semantic extraction (Google gives raw text only)
      // Pass both the text and confidence to Claude
      if (claudeVision.isAvailable && ocrText.length > 10) {
        console.log("[OCR] Layer 2: Claude Vision (with OCR text)");
        const extracted = await claudeVision.extractFromReceipt({ ocrText });

        if (extracted.confidence >= OCR_CONFIDENCE.HIGH) {
          return { ...extracted, rawText: ocrText };
        }

        // Medium confidence – return as-is (user will review)
        if (extracted.confidence >= OCR_CONFIDENCE.MEDIUM) {
          return { ...extracted, rawText: ocrText };
        }
      }
    } catch (err) {
      console.error("[OCR] Layer 1 failed:", err);
    }
  }

  // ── Layer 2: Claude Vision (direct image) ─────────────────────────────────
  if (claudeVision.isAvailable) {
    try {
      console.log("[OCR] Layer 2: Claude Vision (direct image)");
      const imageBase64 = imageBuffer.toString("base64");
      const extracted = await claudeVision.extractFromReceipt({
        ocrText,
        imageBase64,
        mimeType: "image/jpeg",
      });

      if (extracted.confidence >= OCR_CONFIDENCE.MEDIUM) {
        return { ...extracted, rawText: ocrText };
      }
    } catch (err) {
      console.error("[OCR] Layer 2 failed:", err);
    }
  }

  // ── Offline fallback: Tesseract ───────────────────────────────────────────
  if (tesseract.isAvailable && !ocrText) {
    try {
      console.log("[OCR] Offline fallback: Tesseract");
      const ocrResult = await tesseract.extractText(imageBuffer);
      ocrText = ocrResult.fullText;
    } catch (err) {
      console.error("[OCR] Tesseract fallback failed:", err);
    }
  }

  // ── Layer 3: Manual fallback ──────────────────────────────────────────────
  console.log("[OCR] Layer 3: Manual fallback required");
  return {
    confidence: 0.1,
    missingFields: ["merchant", "date", "total", "category", "vatRate"],
    ocrProvider: "MANUAL" as OcrProvider,
    rawText: ocrText,
    currency: "CHF",
  };
}

// ─── PDF pipeline ─────────────────────────────────────────────────────────────

async function processPdf(
  pdfBuffer: Buffer,
  claudeVision: ClaudeVisionProvider,
  googleVision: GoogleVisionProvider,
  tesseract: TesseractProvider
): Promise<ExtractedExpense> {
  const { text, isDigital } = await extractPdfText(pdfBuffer);

  if (isDigital) {
    // Digital PDF: send text directly to Claude
    console.log("[OCR] PDF: Digital – sending text to Claude");
    if (claudeVision.isAvailable) {
      const extracted = await claudeVision.extractFromReceipt({ ocrText: text });
      return { ...extracted, rawText: text };
    }
    // Claude unavailable – return raw text for manual entry
    return {
      confidence: 0.3,
      missingFields: ["merchant", "date", "total", "category"],
      ocrProvider: "MANUAL" as OcrProvider,
      rawText: text,
      currency: "CHF",
    };
  }

  // Scanned PDF: convert to images and run image pipeline
  console.log("[OCR] PDF: Scanned – converting to images");
  try {
    const images = await pdfToImages(pdfBuffer);
    if (images.length === 0) throw new Error("No images extracted from PDF");

    // Process first page (most receipts are single-page)
    return await processImage(images[0]!, googleVision, claudeVision, tesseract);
  } catch (err) {
    console.error("[OCR] PDF to image conversion failed:", err);
    return {
      confidence: 0.1,
      missingFields: ["merchant", "date", "total", "category"],
      ocrProvider: "MANUAL" as OcrProvider,
      currency: "CHF",
    };
  }
}

// ─── Confidence helpers ───────────────────────────────────────────────────────

export function getConfidenceLevel(
  confidence: number
): "high" | "medium" | "low" {
  if (confidence >= OCR_CONFIDENCE.HIGH) return "high";
  if (confidence >= OCR_CONFIDENCE.MEDIUM) return "medium";
  return "low";
}

export function shouldAutoSave(confidence: number): boolean {
  return confidence >= OCR_CONFIDENCE.HIGH;
}

export function needsReview(confidence: number): boolean {
  return confidence < OCR_CONFIDENCE.HIGH;
}
