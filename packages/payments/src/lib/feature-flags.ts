/**
 * Payment Feature Flags
 *
 * Controls which payment provider is active.
 * Both providers default to DISABLED – free trial mode until you go live.
 *
 * To enable Stripe:
 *   PAYMENT_STRIPE_ENABLED=true  in .env
 *
 * To enable Datatrans:
 *   PAYMENT_DATATRANS_ENABLED=true  in .env
 *
 * Only ONE provider should be active at a time.
 */

export type ActiveProvider = "stripe" | "datatrans" | null;

/**
 * Returns the currently active payment provider.
 * Returns null if payments are disabled (trial / free mode).
 */
export function getActiveProvider(): ActiveProvider {
  const stripeEnabled =
    process.env.PAYMENT_STRIPE_ENABLED === "true";
  const datatransEnabled =
    process.env.PAYMENT_DATATRANS_ENABLED === "true";

  if (stripeEnabled && datatransEnabled) {
    console.warn(
      "[QuittungsCH/payments] WARNING: Both PAYMENT_STRIPE_ENABLED and " +
        "PAYMENT_DATATRANS_ENABLED are set to true. " +
        "Defaulting to Stripe. Only one provider should be active."
    );
    return "stripe";
  }

  if (stripeEnabled) return "stripe";
  if (datatransEnabled) return "datatrans";

  console.warn(
    "[QuittungsCH/payments] No payment provider active. " +
      "Running in free-trial mode. " +
      "Set PAYMENT_STRIPE_ENABLED=true or PAYMENT_DATATRANS_ENABLED=true to enable payments."
  );

  return null;
}

/**
 * Returns true if any payment provider is active.
 */
export function isPaymentEnabled(): boolean {
  return getActiveProvider() !== null;
}

/**
 * Returns true if TWINT is enabled via Stripe.
 * Requires Stripe to be the active provider.
 */
export function isTwintViaStripeEnabled(): boolean {
  return (
    getActiveProvider() === "stripe" &&
    process.env.PAYMENT_TWINT_VIA_STRIPE === "true"
  );
}
