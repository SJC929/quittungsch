import type { OcrRawResult } from "@quittungsch/types";

/**
 * PDF Handler
 *
 * Two strategies depending on PDF type:
 *
 * 1. Digital PDF (text-based):
 *    → pdf-parse extracts text directly (free, fast, no OCR needed)
 *    → Send extracted text directly to Claude (Layer 2)
 *    → Confidence typically ~0.95
 *
 * 2. Scanned PDF (image-based):
 *    → pdf-parse returns <50 chars (mostly empty)
 *    → Convert PDF pages to images (pdf2pic)
 *    → Send images through Layer 1 OCR pipeline
 */

const DIGITAL_PDF_MIN_CHARS = 50;

export interface PdfExtractionResult {
  text: string;
  isDigital: boolean;
  pageCount: number;
}

/**
 * Extract text from a PDF buffer.
 * Returns text + flag indicating if it's a digital or scanned PDF.
 */
export async function extractPdfText(
  pdfBuffer: Buffer
): Promise<PdfExtractionResult> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse") as (
    buffer: Buffer,
    options?: { max?: number }
  ) => Promise<{ text: string; numpages: number }>;

  const result = await pdfParse(pdfBuffer, { max: 10 }); // limit to 10 pages

  const text = result.text.trim();
  const isDigital = text.length >= DIGITAL_PDF_MIN_CHARS;

  return {
    text,
    isDigital,
    pageCount: result.numpages,
  };
}

/**
 * Convert a scanned PDF to image buffers (one per page).
 * Uses pdf2pic for conversion.
 *
 * Returns an array of JPEG image buffers (one per page, max 5 pages).
 */
export async function pdfToImages(pdfBuffer: Buffer): Promise<Buffer[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { fromBuffer } = require("pdf2pic") as {
      fromBuffer: (
        buffer: Buffer,
        options: {
          density: number;
          format: string;
          width: number;
          height: number;
        }
      ) => {
        bulk: (pages: number[], options: { responseType: string }) => Promise<Array<{ buffer: Buffer }>>;
      };
    };

    const converter = fromBuffer(pdfBuffer, {
      density: 200,
      format: "jpeg",
      width: 2000,
      height: 2800,
    });

    // Convert first 5 pages max (Swiss receipts are usually 1-2 pages)
    const results = await converter.bulk([1, 2, 3, 4, 5], {
      responseType: "buffer",
    });

    return results
      .map((r) => r.buffer)
      .filter((b): b is Buffer => Buffer.isBuffer(b));
  } catch {
    throw new Error(
      "[PdfHandler] pdf2pic not available. " +
        "Install pdf2pic and GraphicsMagick to process scanned PDFs: " +
        "npm install pdf2pic"
    );
  }
}

/**
 * Create a synthetic OcrRawResult from extracted PDF text.
 * Used when skipping OCR for digital PDFs.
 */
export function textToOcrResult(text: string): OcrRawResult {
  return {
    fullText: text,
    blocks: [{ text, confidence: 0.98 }],
    confidence: 0.95,
  };
}
