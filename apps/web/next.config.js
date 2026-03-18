/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@quittungsch/ui",
    "@quittungsch/types",
    "@quittungsch/payments",
    "@quittungsch/ocr",
    "@quittungsch/i18n",
    "@quittungsch/db",
  ],
  images: {
    domains: [
      // Supabase storage (CH region)
      "*.supabase.co",
      // AWS S3 eu-central-2 (Zürich)
      "*.s3.eu-central-2.amazonaws.com",
    ],
  },
  experimental: {
    serverComponentsExternalPackages: [
      "@prisma/client",
      "bcryptjs",
      "tesseract.js",
      "pdf2pic",
      "jsqr",
      "jimp",
      "pdf-parse",
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // These optional OCR packages may not be installed – ignore if missing
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean)),
        "tesseract.js",
        "pdf2pic",
        "jsqr",
      ];
    }
    return config;
  },
  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: *.supabase.co *.amazonaws.com",
              "connect-src 'self' *.supabase.co *.stripe.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
