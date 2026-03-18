import type { OcrRawResult, TextBlock } from "@quittungsch/types";

/**
 * Google Cloud Vision OCR Provider
 *
 * Primary OCR layer. Excellent for:
 *  - Kassenbons (printed receipts)
 *  - Tankbelege (fuel receipts)
 *  - Any printed Swiss receipt
 *
 * Required env vars:
 *   GOOGLE_VISION_API_KEY – Your Google Cloud Vision API key
 *
 * Cost: ~$1.50 per 1000 images (DOCUMENT_TEXT_DETECTION)
 * Docs: https://cloud.google.com/vision/docs/ocr
 */

interface GoogleVisionResponse {
  responses: Array<{
    fullTextAnnotation?: {
      text: string;
      pages: Array<{
        blocks: Array<{
          paragraphs: Array<{
            words: Array<{
              symbols: Array<{
                text: string;
                confidence?: number;
              }>;
              confidence?: number;
              boundingBox?: {
                vertices: Array<{ x?: number; y?: number }>;
              };
            }>;
            confidence?: number;
          }>;
          confidence?: number;
        }>;
      }>;
    };
    error?: { message: string; code: number };
  }>;
}

export class GoogleVisionProvider {
  private apiKey: string;
  private endpoint = "https://vision.googleapis.com/v1/images:annotate";

  constructor() {
    this.apiKey = process.env.GOOGLE_VISION_API_KEY ?? "";
    if (!this.apiKey) {
      console.warn(
        "[GoogleVisionProvider] GOOGLE_VISION_API_KEY not set. " +
          "OCR will fall back to Claude Vision."
      );
    }
  }

  get isAvailable(): boolean {
    return Boolean(this.apiKey);
  }

  /**
   * Extract text from an image buffer using Google Cloud Vision.
   * Returns full text + bounding-box blocks + confidence score.
   */
  async extractText(imageBuffer: Buffer): Promise<OcrRawResult> {
    if (!this.apiKey) {
      throw new Error(
        "[GoogleVisionProvider] API key not configured. " +
          "Set GOOGLE_VISION_API_KEY in your environment."
      );
    }

    const base64Image = imageBuffer.toString("base64");

    const requestBody = {
      requests: [
        {
          image: { content: base64Image },
          features: [
            {
              type: "DOCUMENT_TEXT_DETECTION",
              maxResults: 1,
            },
          ],
          imageContext: {
            languageHints: ["de", "fr", "it", "en"],
          },
        },
      ],
    };

    const response = await fetch(`${this.endpoint}?key=${this.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(
        `[GoogleVisionProvider] API error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as GoogleVisionResponse;
    const result = data.responses[0];

    if (result?.error) {
      throw new Error(
        `[GoogleVisionProvider] Vision API error: ${result.error.message}`
      );
    }

    const annotation = result?.fullTextAnnotation;
    if (!annotation) {
      return { fullText: "", blocks: [], confidence: 0 };
    }

    // Extract blocks with bounding boxes
    const blocks: TextBlock[] = [];
    let totalConfidence = 0;
    let blockCount = 0;

    for (const page of annotation.pages) {
      for (const block of page.blocks) {
        const blockText = block.paragraphs
          .flatMap((p) => p.words)
          .flatMap((w) => w.symbols.map((s) => s.text))
          .join("");

        const confidence = block.confidence ?? 0.8;
        totalConfidence += confidence;
        blockCount++;

        // Get bounding box from first paragraph's first word
        const firstWord =
          block.paragraphs[0]?.words[0];
        const vertices = firstWord?.boundingBox?.vertices ?? [];
        const [tl, tr, , bl] = vertices;

        blocks.push({
          text: blockText,
          confidence,
          boundingBox:
            tl && tr && bl
              ? {
                  x: tl.x ?? 0,
                  y: tl.y ?? 0,
                  width: (tr.x ?? 0) - (tl.x ?? 0),
                  height: (bl.y ?? 0) - (tl.y ?? 0),
                }
              : undefined,
        });
      }
    }

    const avgConfidence =
      blockCount > 0 ? totalConfidence / blockCount : 0.8;

    return {
      fullText: annotation.text,
      blocks,
      confidence: Math.min(avgConfidence, 1.0),
    };
  }
}
