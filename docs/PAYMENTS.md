# QuittungsCH – Payment Setup Guide

## Overview

QuittungsCH uses a **Payment Abstraction Layer** (`/packages/payments`) that supports two providers:
- **Stripe** (with TWINT) – Provider A
- **Datatrans** (with TWINT) – Provider B (scaffold, not yet implemented)

Both providers are **disabled by default**. The app runs in free-trial mode until you enable one.

---

## Current State

| Provider | Status | TWINT | Notes |
|---|---|---|---|
| Stripe | Implemented ✅ | Via Stripe native | Ready for production |
| Datatrans | Scaffold only 🔧 | Via `paymentMethod: 'TWI'` | TODOs in source |

---

## Option A: Enable Stripe

### 1. Create a Stripe Account

Go to [stripe.com](https://stripe.com) and create an account.
Select **Switzerland** as your country.

### 2. Get API Keys

Dashboard → Developers → API Keys:
- `STRIPE_SECRET_KEY` → Secret key (`sk_live_...`)
- `STRIPE_PUBLISHABLE_KEY` → Publishable key (`pk_live_...`)

### 3. Create a Recurring Price

Dashboard → Products → Add Product:
- Name: "QuittungsCH Pro"
- Price: CHF 10.00 / month (recurring)
- Copy the Price ID → `STRIPE_PRICE_ID_MONTHLY`

### 4. Enable TWINT

TWINT is available natively in Stripe for Switzerland.
No extra setup needed – it's enabled via `paymentMethodTypes: ['card', 'twint']` in the code.

### 5. Configure Webhooks

Dashboard → Developers → Webhooks → Add endpoint:
- URL: `https://your-domain.ch/api/webhooks/stripe`
- Events to listen:
  - `invoice.payment_succeeded`
  - `customer.subscription.deleted`
  - `customer.updated`
  - `invoice.payment_failed`
- Copy Signing Secret → `STRIPE_WEBHOOK_SECRET`

### 6. Update .env

```env
PAYMENT_STRIPE_ENABLED=true
PAYMENT_TWINT_VIA_STRIPE=true   # optional

STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_MONTHLY=price_...
```

### 7. Customer Portal (Self-Service)

Enable the Customer Portal in Stripe Dashboard:
Dashboard → Settings → Billing → Customer Portal → Activate

Users can then manage their subscription at `/settings/billing` → "Abonnement verwalten".

---

## Option B: Enable Datatrans

> ⚠️ Datatrans is scaffolded but **not yet implemented**.
> The interface is defined – you need to fill in the TODO methods.

### What Needs Implementation

1. `createSubscription()` in `/packages/payments/src/providers/datatrans.provider.ts`
2. `cancelSubscription()`
3. `getSubscriptionStatus()`
4. `handleWebhook()`

### Required Env Vars

```env
PAYMENT_DATATRANS_ENABLED=true

DATATRANS_MERCHANT_ID=your-merchant-id
DATATRANS_API_KEY=your-api-key-base64
DATATRANS_WEBHOOK_SECRET=your-webhook-secret
```

### TWINT via Datatrans

Add `paymentMethod: 'TWI'` to the transaction payload.
See [Datatrans Docs](https://docs.datatrans.ch/docs/payment-methods).

---

## Free Trial Mode (Default)

When both providers are disabled:
- Users see a blue banner: "Zahlungen folgen bald – kostenlose Nutzung bis zum Launch"
- App is fully functional with no restrictions
- No payment data is collected

---

## Switching Providers

⚠️ Only ONE provider should be active at a time.
If both are enabled, the system defaults to Stripe and logs a warning.

---

## Testing

### Stripe Test Cards

| Card | Result |
|---|---|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0025 0000 3155 | 3DS required |

### Test TWINT

Use Stripe's TWINT test payment method – see [Stripe TWINT testing docs](https://stripe.com/docs/testing#twint).
