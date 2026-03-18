import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Upstash Redis is used for distributed rate limiting.
// If env vars are not set, rate limiting is disabled (dev mode).
function createRatelimit(requests: number, window: string) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window as `${number} ${"ms" | "s" | "m" | "h" | "d"}`),
    analytics: true,
  });
}

// OCR rate limits: 50/day (free), 500/day (paid)
export const ocrRateLimit = createRatelimit(50, "1 d");
export const apiRateLimit = createRatelimit(100, "1 m");

export async function checkRateLimit(
  req: NextRequest,
  limiter: ReturnType<typeof createRatelimit>,
  identifier?: string
): Promise<NextResponse | null> {
  if (!limiter) return null; // disabled

  const id = identifier ?? req.ip ?? "anonymous";
  const { success, limit, remaining, reset } = await limiter.limit(id);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests – please try again later" },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
          "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  return null;
}
