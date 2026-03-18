import { NextRequest, NextResponse } from "next/server";
import { processReceipt } from "@quittungsch/ocr";
import { uploadReceipt } from "@/lib/storage";
import { getSession } from "@/lib/auth";
import { ocrRateLimit, checkRateLimit } from "@/lib/rate-limit";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export async function POST(req: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await checkRateLimit(req, ocrRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum 10 MB." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Use JPG, PNG, or PDF." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Run OCR pipeline
    const extracted = await processReceipt({
      type: file.type === "application/pdf" ? "pdf" : "image",
      buffer,
      mimeType: file.type,
      tenantId: session.user.tenantId,
    });

    // Upload receipt to Swiss storage
    const stored = await uploadReceipt(
      buffer,
      file.name,
      session.user.tenantId,
      file.type
    );

    return NextResponse.json({
      extracted,
      receiptImageUrl: stored.signedUrl,
      receiptPath: stored.path,
    });
  } catch (err) {
    console.error("[OCR] Error:", err);
    return NextResponse.json(
      { error: "OCR processing failed. Please try again or enter data manually." },
      { status: 500 }
    );
  }
}
