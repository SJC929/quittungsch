import type { QrRechnungData } from "@spezo/types";

/**
 * Swiss QR-Rechnung (QR Invoice) Handler
 *
 * Swiss QR invoices follow the SPC (Swiss Payments Code) standard.
 * They contain a QR code that can be decoded to extract all payment data.
 *
 * QR content format (line-separated):
 *   Line 1:  SPC (header – identifies Swiss QR invoice)
 *   Line 2:  0200 (version)
 *   Line 3:  1 (coding type: UTF-8)
 *   Line 4:  IBAN (CH or LI)
 *   Line 5-10: Creditor address
 *   Line 11: Amount (or empty if open)
 *   Line 12: Currency (CHF or EUR)
 *   ...
 *   Line 28: Reference type (QRR, SCOR, or NON)
 *   Line 29: Reference number
 *   Line 30: Additional info / Zahlungszweck
 *
 * Confidence = 1.0 (structured format, no ambiguity)
 *
 * Docs: https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/ig-qr-bill-v2.3-de.pdf
 */

/**
 * Parse a QR-Rechnung payload string (already decoded from QR code).
 * Returns null if the payload is not a valid Swiss QR invoice.
 */
export function parseQrRechnungPayload(
  payload: string
): QrRechnungData | null {
  const lines = payload.split(/\r?\n/);

  // Must start with 'SPC' header
  if (lines[0]?.trim() !== "SPC") return null;

  const iban = lines[3]?.trim() ?? "";
  if (!iban.startsWith("CH") && !iban.startsWith("LI")) return null;

  const amountStr = lines[18]?.trim() ?? "";
  const amount = amountStr ? parseFloat(amountStr) : undefined;

  const currency = lines[19]?.trim() ?? "CHF";

  // Creditor info (lines 5-10: name, addr type, addr1, addr2, postal, country)
  const creditorName = lines[5]?.trim() ?? "";
  const creditorStreet = lines[7]?.trim() ?? "";
  const creditorPostal = lines[8]?.trim() ?? "";
  const creditorCountry = lines[10]?.trim() ?? "CH";
  const creditorAddress = [creditorStreet, creditorPostal, creditorCountry]
    .filter(Boolean)
    .join(", ");

  // Reference (lines 27-28)
  const referenceType = lines[27]?.trim() ?? "";
  const referenceNumber =
    referenceType !== "NON" ? (lines[28]?.trim() ?? "") : "";

  const paymentPurpose = lines[29]?.trim() ?? "";

  return {
    iban,
    amount,
    currency,
    creditorName,
    creditorAddress: creditorAddress || undefined,
    referenceNumber: referenceNumber || undefined,
    paymentPurpose: paymentPurpose || undefined,
    confidence: 1.0,
  };
}

/**
 * Detect if an image buffer contains a Swiss QR-Rechnung.
 * Uses jsQR to decode the QR code from the image.
 *
 * Returns the parsed QR data, or null if no QR-Rechnung found.
 */
export async function detectQrRechnung(
  imageBuffer: Buffer
): Promise<QrRechnungData | null> {
  try {
    // Lazy import – jsqr is optional
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const jsQR = require("jsqr") as (
      data: Uint8ClampedArray,
      width: number,
      height: number
    ) => { data: string } | null;

    // Use jimp to convert buffer to raw pixel data
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Jimp = require("jimp") as {
      read: (buffer: Buffer) => Promise<{
        bitmap: { data: Buffer; width: number; height: number };
        grayscale: () => { bitmap: { data: Buffer; width: number; height: number } };
      }>;
    };

    const image = await Jimp.read(imageBuffer);
    // Grayscale improves QR detection
    const gray = image.grayscale();
    const { data, width, height } = gray.bitmap;

    const qrResult = jsQR(
      new Uint8ClampedArray(data),
      width,
      height
    );

    if (!qrResult) return null;

    return parseQrRechnungPayload(qrResult.data);
  } catch (err) {
    // jsqr or jimp not installed – skip QR detection
    console.warn("[QrRechnungHandler] QR detection unavailable:", err);
    return null;
  }
}

/**
 * Convert QrRechnungData to a partial Expense-compatible object.
 */
export function qrRechnungToExpense(qr: QrRechnungData) {
  return {
    merchantName: qr.creditorName,
    amount: qr.amount,
    currency: qr.currency,
    receiptType: "QR_RECHNUNG" as const,
    paymentMethod: "BANK_TRANSFER" as const,
    notes: [qr.paymentPurpose, qr.referenceNumber]
      .filter(Boolean)
      .join(" | "),
    ocrProvider: "QR" as const,
    ocrConfidence: 1.0,
    needsReview: false,
  };
}
