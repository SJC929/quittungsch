import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const API_URL = (Constants.expoConfig?.extra?.apiUrl as string | undefined) ?? "http://localhost:3000";

// JWT token storage
const TOKEN_KEY = "quittungsch_token";

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

interface ApiOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
}

export async function apiRequest<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = "GET", body } = options;

  const token = options.token ?? (await getToken());

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" })) as { error?: string };
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

/**
 * Upload a receipt image to the OCR endpoint.
 * Uses FormData for multipart upload.
 */
export async function uploadReceipt(
  imageUri: string,
  fileName: string = "receipt.jpg"
): Promise<{ extracted: unknown; receiptPath: string }> {
  const token = await getToken();

  const formData = new FormData();
  formData.append("file", {
    uri: imageUri,
    name: fileName,
    type: "image/jpeg",
  } as unknown as Blob);

  const res = await fetch(`${API_URL}/api/ocr`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "OCR failed" })) as { error?: string };
    throw new Error(err.error ?? "Upload failed");
  }

  return res.json() as Promise<{ extracted: unknown; receiptPath: string }>;
}
