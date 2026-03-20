import type { OcrRawResult } from "@spezo/types";

/**
 * Tesseract OCR Provider – Offline Fallback
 *
 * Used when both Google Vision and AWS Textract are unavailable.
 * Runs entirely offline – no external API calls.
 * Accuracy is lower than cloud providers but works without internet.
 *
 * Setup:
 *   npm install tesseract.js
 *   OCR_OFFLINE_FALLBACK=tesseract  in .env
 *
 * Language packs used: deu (German), fra (French), ita (Italian), eng (English)
 */
export class TesseractProvider {
  get isAvailable(): boolean {
    return process.env.OCR_OFFLINE_FALLBACK === "tesseract";
  }

  /**
   * Extract text from image buffer using Tesseract.js (offline).
   * Supports DE/FR/IT/EN for Swiss receipts.
   */
  async extractText(imageBuffer: Buffer): Promise<OcrRawResult> {
    // Lazy import – tesseract.js is optional dependency
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createWorker } = require("tesseract.js") as {
      createWorker: (lang: string) => Promise<{
        recognize: (buffer: Buffer) => Promise<{
          data: { text: string; confidence: number; words: Array<{ text: string; confidence: number; bbox: { x0: number; y0: number; x1: number; y1: number } }> };
        }>;
        terminate: () => Promise<void>;
      }>;
    };

    const worker = await createWorker("deu+fra+ita+eng");

    try {
      const result = await worker.recognize(imageBuffer);
      const { text, confidence, words } = result.data;

      return {
        fullText: text,
        blocks: words.map((w) => ({
          text: w.text,
          confidence: w.confidence / 100,
          boundingBox: {
            x: w.bbox.x0,
            y: w.bbox.y0,
            width: w.bbox.x1 - w.bbox.x0,
            height: w.bbox.y1 - w.bbox.y0,
          },
        })),
        confidence: confidence / 100,
      };
    } finally {
      await worker.terminate();
    }
  }
}
