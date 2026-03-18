# QuittungsCH – OCR Setup Guide

## Overview

QuittungsCH uses a **3-Layer OCR Pipeline** to extract data from receipts:

```
Layer 1: Google Cloud Vision  →  Raw text + bounding boxes
Layer 2: Claude Vision API    →  Semantic extraction (JSON)
Layer 3: Manual Fallback      →  User enters data manually
```

The pipeline stops as soon as confidence reaches ≥ 90%.

---

## Confidence Levels

| Level | Threshold | UI Indicator |
|---|---|---|
| High | ≥ 90% | 🟢 Green checkmark – auto-save possible |
| Medium | 75–89% | 🟡 Yellow warning – user should review |
| Low | < 75% | 🔴 Red alert – highlighted fields |

---

## Special Cases

| Receipt Type | Handler | Confidence |
|---|---|---|
| Swiss QR-Rechnung | `qr-rechnung.handler.ts` (jsQR decode) | 100% |
| Digital PDF | pdf-parse → text → Claude | ~95% |
| Scanned PDF | pdf2pic → images → Layer 1+2 | Variable |
| Printed receipt | Layer 1 (Vision) → Layer 2 (Claude) | 85–95% |
| Handwritten | Claude direct image | 60–80% |

---

## Provider Setup

### Layer 1: Google Cloud Vision (Primary)

**Cost:** ~$1.50 / 1000 images

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable the **Cloud Vision API**
3. Create an API Key (restrict to Cloud Vision API for security)
4. Add to `.env`:
   ```env
   GOOGLE_VISION_API_KEY=AIza...
   OCR_PRIMARY_PROVIDER=google_vision
   ```

### Layer 2: Claude Vision (Semantic Extraction)

**Required for all OCR** – Claude does the semantic understanding.

1. Get API key from [console.anthropic.com](https://console.anthropic.com)
2. Add to `.env`:
   ```env
   ANTHROPIC_API_KEY=sk-ant-...
   ```

Model used: `claude-sonnet-4-6` (multimodal, latest as of 2026)

### Layer 3: Tesseract (Offline Fallback)

Free, offline, lower accuracy. Used when both cloud providers fail.

```env
OCR_OFFLINE_FALLBACK=tesseract
```

Install Tesseract language packs (German, French, Italian, English):
```bash
# Ubuntu/Debian
apt-get install tesseract-ocr tesseract-ocr-deu tesseract-ocr-fra tesseract-ocr-ita

# macOS
brew install tesseract tesseract-lang
```

---

## Rate Limits

| Plan | OCR requests/day |
|---|---|
| Free (trial) | 50 |
| Pro | 500 |

Rate limiting is enforced via Upstash Redis.
Configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to enable.
Without Upstash, rate limiting is disabled (development mode).

---

## Swiss QR-Rechnung

QuittungsCH automatically detects Swiss QR invoices (SPC standard).

**Detection:** The QR code starts with `SPC` (Swiss Payments Code).

**Fields extracted:**
- IBAN (CH or LI)
- Amount and currency (CHF or EUR)
- Creditor name and address
- Reference number (QRR, SCOR, or NON)
- Payment purpose (Zahlungszweck)

**Confidence:** Always 1.0 (structured format, no ambiguity).

**Dependencies:**
```bash
npm install jsqr jimp
```

---

## Cost Optimization

| Action | Saving |
|---|---|
| QR-Rechnungen | Free (local decode, no API call) |
| Digital PDFs | Free (text extraction, no Vision API) |
| Pass OCR text to Claude | ~70% cheaper vs direct image |
| Rate limiting | Prevents abuse |

---

## Disable OCR per Tenant

For tenants who prefer manual entry (data privacy reasons):

```sql
UPDATE "Tenant" SET "ocrEnabled" = false WHERE id = 'tenant_id';
```

When OCR is disabled:
- Upload still works (image stored in CH storage)
- Layer 1 and Layer 2 are skipped
- User sees a manual entry form directly

---

## AWS Textract (Alternative to Google Vision)

Scaffold available at `/packages/ocr/src/providers/aws-textract.provider.ts`.
Not yet implemented.

> ⚠️ AWS does not have a Zürich region for Textract.
> Use `eu-central-1` (Frankfurt) as closest alternative.
> For strict Swiss data residency, prefer Google Vision or Tesseract.

---

## Extending the Pipeline

To add a new OCR provider:

1. Create `/packages/ocr/src/providers/my-provider.ts`
2. Implement `extractText(imageBuffer: Buffer): Promise<OcrRawResult>`
3. Add to the pipeline in `/packages/ocr/src/index.ts`
4. Add env var `OCR_PRIMARY_PROVIDER=my_provider`
