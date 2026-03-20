import type {
  CheckoutSession,
  SubscriptionStatusResult,
  WebhookEvent,
} from "@spezo/types";

export type Plan = "PRO_MONTHLY";

/**
 * Payment Provider Interface
 * All payment providers must implement this interface.
 * Both Stripe and Datatrans implement it identically so they are
 * interchangeable via the feature-flag system.
 */
export interface IPaymentProvider {
  /**
   * Create a checkout session and return a redirect URL.
   * @param userId - Internal user ID
   * @param plan   - Subscription plan identifier
   * @param currency - ISO 4217 currency code (e.g. 'CHF')
   */
  createSubscription(
    userId: string,
    plan: Plan,
    currency: string
  ): Promise<CheckoutSession>;

  /**
   * Cancel an active subscription.
   * Sets cancelAtPeriodEnd = true via the provider's API.
   */
  cancelSubscription(subscriptionId: string): Promise<void>;

  /**
   * Retrieve the current subscription status for a customer.
   */
  getSubscriptionStatus(
    customerId: string
  ): Promise<SubscriptionStatusResult>;

  /**
   * Validate and parse an incoming webhook payload.
   * Each provider signs webhooks differently; validation is provider-specific.
   */
  handleWebhook(
    payload: string | Buffer,
    signature: string
  ): Promise<WebhookEvent>;
}
