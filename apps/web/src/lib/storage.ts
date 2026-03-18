/**
 * Storage abstraction – supports Supabase Storage or AWS S3 (Zürich)
 *
 * Storage provider is selected via STORAGE_PROVIDER env var:
 *   'supabase' → Supabase Storage (Swiss data residency via Supabase)
 *   's3'       → AWS S3 eu-central-2 (Zürich)
 */

const BUCKET_NAME = "receipts";
const SIGNED_URL_TTL = 60 * 60; // 1 hour (never expose permanent URLs)

export interface StorageUploadResult {
  path: string;
  signedUrl: string;
  provider: "supabase" | "s3";
}

/**
 * Upload a receipt file to cloud storage.
 * Returns a signed (expiring) URL – never expose the raw storage URL.
 */
export async function uploadReceipt(
  buffer: Buffer,
  fileName: string,
  tenantId: string,
  mimeType: string
): Promise<StorageUploadResult> {
  const provider = process.env.STORAGE_PROVIDER ?? "supabase";
  const path = `${tenantId}/${Date.now()}-${fileName}`;

  if (provider === "s3") {
    return uploadToS3(buffer, path, mimeType);
  }

  return uploadToSupabase(buffer, path, mimeType);
}

async function uploadToSupabase(
  buffer: Buffer,
  path: string,
  mimeType: string
): Promise<StorageUploadResult> {
  const { createClient } = await import("@supabase/supabase-js");

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    throw new Error(`[Storage] Supabase upload failed: ${error.message}`);
  }

  const { data: signedData, error: signedError } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, SIGNED_URL_TTL);

  if (signedError || !signedData?.signedUrl) {
    throw new Error("[Storage] Failed to create signed URL");
  }

  return {
    path,
    signedUrl: signedData.signedUrl,
    provider: "supabase",
  };
}

async function uploadToS3(
  buffer: Buffer,
  path: string,
  mimeType: string
): Promise<StorageUploadResult> {
  const { S3Client, PutObjectCommand, GetObjectCommand } = await import(
    "@aws-sdk/client-s3"
  );
  const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

  const client = new S3Client({
    region: process.env.AWS_S3_REGION ?? "eu-central-2", // Zürich
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  await client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: path,
      Body: buffer,
      ContentType: mimeType,
      ServerSideEncryption: "AES256",
    })
  );

  const signedUrl = await getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: path,
    }),
    { expiresIn: SIGNED_URL_TTL }
  );

  return { path, signedUrl, provider: "s3" };
}

/**
 * Generate a fresh signed URL for an existing receipt.
 * Call this when displaying receipts (URLs expire after 1h).
 */
export async function getSignedReceiptUrl(path: string): Promise<string> {
  const provider = process.env.STORAGE_PROVIDER ?? "supabase";

  if (provider === "s3") {
    const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

    const client = new S3Client({ region: process.env.AWS_S3_REGION ?? "eu-central-2" });
    return getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: process.env.AWS_S3_BUCKET!, Key: path }),
      { expiresIn: SIGNED_URL_TTL }
    );
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

  const { data } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, SIGNED_URL_TTL);

  return data?.signedUrl ?? "";
}
