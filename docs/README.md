# QuittungsCH

> Belege einfach erfassen – für Schweizer Selbständige

Swiss-hosted SaaS application for expense accounting, built for self-employed professionals (Selbständige) in Switzerland.

---

## Features

- 📱 **Mobile App** (iOS + Android) – Camera capture with OCR
- 🌐 **Web App** (PWA) – Full dashboard with drag & drop upload
- 🤖 **AI OCR** – Google Vision + Claude 3-layer pipeline
- 🇨🇭 **Swiss QR-Rechnung** – Automatic detection and extraction
- 📊 **Exports** – Excel, CSV, PDF (for Treuhänder), Google Sheets
- 💳 **Payments** – Stripe + TWINT (Datatrans scaffold)
- 🌍 **4 Languages** – DE, FR, IT, EN

---

## Quick Start

```bash
# 1. Clone and install
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in at minimum: DATABASE_URL, NEXTAUTH_SECRET, ANTHROPIC_API_KEY

# 3. Set up database
npm run db:generate
npm run db:push        # or db:migrate for production

# 4. Start development
npm run dev
```

Web app: http://localhost:3000
Mobile: `cd apps/mobile && npx expo start`

---

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) – System architecture and data flow
- [PAYMENTS.md](./PAYMENTS.md) – How to enable Stripe / Datatrans / TWINT
- [OCR.md](./OCR.md) – How to configure OCR providers

---

## Stack

**Web:** Next.js 14 · TypeScript · Tailwind CSS · NextAuth.js · Prisma
**Mobile:** React Native · Expo · expo-camera
**AI/OCR:** Google Cloud Vision · Claude Vision (Anthropic)
**Payments:** Stripe + TWINT · Datatrans (scaffold)
**Database:** PostgreSQL (Swiss-hosted)
**Storage:** Supabase Storage / AWS S3 Zürich (eu-central-2)
**Monorepo:** Turborepo

---

## Data Residency

All user data is stored exclusively in Switzerland (DSG/GDPR compliant):
- Database: Switzerland (Supabase / Infomaniak / Exoscale CH-GVA-2)
- Receipt storage: Supabase CH or AWS S3 eu-central-2 (Zürich)
- OCR processing: Google Cloud Vision + Anthropic Claude (disclosed in privacy policy)

---

## License

Proprietary – QuittungsCH © 2026
