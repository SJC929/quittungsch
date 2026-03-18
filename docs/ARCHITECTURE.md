# QuittungsCH – Architecture Overview

## Project Structure

```
quittungsch/
├── apps/
│   ├── web/          → Next.js 14 PWA (TypeScript, App Router)
│   └── mobile/       → React Native + Expo (iOS + Android)
├── packages/
│   ├── db/           → Prisma schema + client (PostgreSQL)
│   ├── payments/     → Payment abstraction (Stripe + Datatrans)
│   ├── ocr/          → OCR pipeline (Google Vision + Claude + QR)
│   ├── types/        → Shared TypeScript types
│   ├── i18n/         → Translations (DE/FR/IT/EN)
│   └── ui/           → Shared shadcn/ui components
├── docs/
│   ├── ARCHITECTURE.md
│   ├── PAYMENTS.md
│   └── OCR.md
├── .env.example
├── package.json       → Turborepo workspace root
└── turbo.json
```

---

## Multi-Tenancy

Every database query is scoped by `tenantId`. The middleware enforces authentication on all app routes.

```
User → JWT (contains tenantId) → Every API route filters by tenantId
```

- Tenant is created automatically on user registration
- Row-level isolation via `WHERE tenantId = $1` on all queries
- No cross-tenant data leakage possible at the application level

---

## Data Flow: Receipt Upload

```
[User] → Upload image/PDF
         ↓
[Storage] → Uploaded to CH storage (Supabase/S3 Zürich)
             ↓
[OCR Layer 1] → Google Cloud Vision (raw text + bounding boxes)
                 ↓ (if confidence < 90%)
[OCR Layer 2] → Claude Vision API (semantic JSON extraction)
                 ↓ (if confidence < 75%)
[Layer 3] → Manual fallback (user fills in form)
              ↓
[UI] → Editable confirmation form pre-filled with extracted data
        ↓ (user confirms)
[DB] → Expense saved with ocrConfidence, ocrProvider, ocrRawText
```

---

## Authentication Flow

```
Register → Tenant created → Onboarding wizard (4 steps) → Dashboard
Login    → JWT issued → Middleware validates → App routes accessible
```

Session contains: `userId`, `tenantId`, `role`, `email`

---

## Payment Flow

```
Feature flags check PAYMENT_STRIPE_ENABLED / PAYMENT_DATATRANS_ENABLED
↓
If disabled → Free trial mode (banner shown)
↓
If Stripe enabled:
  → POST /api/payments/checkout
  → Stripe Checkout Session created (CHF 10/month)
  → User redirected to Stripe (card + TWINT)
  → Webhook received → Subscription updated in DB
  → User redirected to /dashboard?subscription=success
```

---

## Database Schema Overview

```
Tenant (1) ──< User (n)
Tenant (1) ──< Expense (n)
Tenant (1) ──< Subscription (n)
Tenant (1) ──< Category (n)
Tenant (1) ──< KilometerLog (n)  [Phase 2]
Tenant (1) ──< Export (n)
Tenant (1) ──< AuditLog (n)
```

---

## Swiss Data Residency

| Data Type | Storage | Location |
|---|---|---|
| User data | PostgreSQL | CH (Infomaniak/Supabase) |
| Receipt images | Supabase Storage / S3 | CH / Zürich |
| Session tokens | JWT (stateless) | Client only |
| Payment data | Stripe/Datatrans | EU (PCI compliant) |

Receipt images are stored with:
- Signed, expiring URLs (1 hour TTL)
- Server-side encryption (AES-256)
- Never publicly accessible

---

## API Route Overview

| Route | Method | Description |
|---|---|---|
| `/api/auth/register` | POST | Email/password registration |
| `/api/auth/[...nextauth]` | GET/POST | NextAuth.js handler |
| `/api/expenses` | GET, POST | List and create expenses |
| `/api/expenses/[id]` | GET, PATCH, DELETE | Single expense operations |
| `/api/ocr` | POST | Upload receipt + run OCR pipeline |
| `/api/exports/generate` | POST | Generate Excel/CSV/PDF export |
| `/api/payments/checkout` | POST | Create Stripe checkout session |
| `/api/payments/portal` | GET | Redirect to Stripe Customer Portal |
| `/api/webhooks/stripe` | POST | Stripe webhook handler |
| `/api/km-log` | GET, POST | Kilometer log (Phase 2) |
| `/api/tenant/onboarding` | POST | Update tenant from onboarding |

---

## Phase 2 Features (Scaffolded)

| Feature | DB Schema | API | UI |
|---|---|---|---|
| Kilometererfassung | ✅ | ✅ | ❌ |
| Jahresabschluss PDF | ✅ | ❌ | ❌ |
| Google Sheets Export | ✅ | ❌ | Placeholder |
| AWS Textract | ✅ | Scaffold | ❌ |
| Datatrans Provider | ✅ | Scaffold | ❌ |

---

## Security Checklist

- [x] JWT sessions (stateless, no server-side sessions)
- [x] bcrypt password hashing (cost factor 12)
- [x] Tenant isolation on every DB query
- [x] Rate limiting on all API routes (Upstash)
- [x] Signed, expiring image URLs (1h TTL)
- [x] HTTPS-only (enforced via Next.js headers)
- [x] CSP headers configured
- [x] X-Frame-Options: DENY
- [x] Payment credentials never logged
- [x] Audit log for all expense mutations
- [x] Input validation via Zod on all endpoints
- [x] SQL injection prevention via Prisma ORM

---

## Adding a New Language

1. Add locale file: `/packages/i18n/locales/[lang]/common.json`
2. Add to `SUPPORTED_LANGUAGES` in `/packages/i18n/src/index.ts`
3. Add to onboarding step 4 in web + mobile
4. Update `i18next` config to include new language

---

## Deployment

### Recommended Stack (Switzerland)

| Service | Provider | Notes |
|---|---|---|
| Web hosting | Vercel / Infomaniak | Deploy Next.js |
| Database | Supabase (CH) / Railway | PostgreSQL |
| Storage | Supabase Storage / S3 Zürich | Receipt images |
| Redis (rate limit) | Upstash | Serverless Redis |
| Email | Postmark / Mailgun | Magic links |
| Mobile | EAS Build (Expo) | iOS + Android builds |

### Environment Setup

```bash
# Install dependencies
npm install

# Set up database
cd packages/db
cp ../../.env.example ../../.env.local
# Fill in DATABASE_URL
npx prisma migrate deploy
npx prisma generate

# Start development
cd ../..
npm run dev
```

### Mobile (Expo)

```bash
cd apps/mobile
npx expo start          # development
npx eas build --platform ios    # production iOS
npx eas build --platform android  # production Android
```
