import type { OcrRawResult } from "@quittungsch/types";

/**
 * AWS Textract OCR Provider – SCAFFOLD ONLY
 *
 * Alternative to Google Vision. Not yet implemented.
 *
 * Required env vars:
 *   AWS_ACCESS_KEY_ID
 *   AWS_SECRET_ACCESS_KEY
 *   AWS_TEXTRACT_REGION  (e.g. eu-central-1)
 *   AWS_S3_BUCKET        (required for async Textract jobs on large docs)
 *
 * Notes:
 *  - AWS does NOT have a Zürich region yet for Textract.
 *    Use eu-central-1 (Frankfurt) as closest alternative.
 *  - For Swiss data residency: prefer Google Vision or offline Tesseract.
 *
 * Docs: https://docs.aws.amazon.com/textract/latest/dg/what-is.html
 */
export class AwsTextractProvider {
  get isAvailable(): boolean {
    return Boolean(
      process.env.AWS_ACCESS_KEY_ID &&
        process.env.AWS_SECRET_ACCESS_KEY &&
        process.env.AWS_TEXTRACT_REGION
    );
  }

  /**
   * TODO: Implement AWS Textract text extraction.
   *
   * Steps:
   * 1. npm install @aws-sdk/client-textract
   * 2. Create TextractClient with region from env
   * 3. Call DetectDocumentText for simple receipts
   * 4. Call AnalyzeDocument with FORMS feature for structured data
   * 5. Map response blocks to OcrRawResult format
   */
  async extractText(_imageBuffer: Buffer): Promise<OcrRawResult> {
    throw new Error(
      "[AwsTextractProvider] Not yet implemented. " +
        "See TODO comments in aws-textract.provider.ts for implementation guide."
    );
  }
}
