import type { CheckoutSession, SubscriptionStatusResult, WebhookEvent } from "@spezo/types";
import type { IPaymentProvider, Plan } from "../payment-provider.interface";

/**
 * Datatrans Payment Provider – SCAFFOLD ONLY
 *
 * This provider is scaffolded but not yet implemented.
 * All methods throw a NotImplementedError until Datatrans is configured.
 *
 * Required env vars (fill when ready to go live with Datatrans):
 *   DATATRANS_MERCHANT_ID   – Your Datatrans merchant ID
 *   DATATRANS_API_KEY       – Datatrans API key (base64-encoded)
 *   DATATRANS_WEBHOOK_SECRET – Secret for webhook signature validation
 *
 * TWINT via Datatrans:
 *   Use paymentMethod: 'TWI' in the transaction payload.
 *   See https://docs.datatrans.ch/docs/payment-methods
 *
 * Datatrans API base URL (production):
 *   https://api.datatrans.com/v1
 *
 * Datatrans API base URL (sandbox):
 *   https://api.sandbox.datatrans.com/v1
 */
export class DatatransProvider implements IPaymentProvider {
  private merchantId: string;
  private apiKey: string;
  private webhookSecret: string;
  private baseUrl: string;

  constructor() {
    // TODO: Validate env vars when implementing
    this.merchantId = process.env.DATATRANS_MERCHANT_ID ?? "";
    this.apiKey = process.env.DATATRANS_API_KEY ?? "";
    this.webhookSecret = process.env.DATATRANS_WEBHOOK_SECRET ?? "";
    this.baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://api.datatrans.com/v1"
        : "https://api.sandbox.datatrans.com/v1";
  }

  /**
   * TODO: Implement Datatrans subscription creation.
   *
   * Steps to implement:
   * 1. POST to ${this.baseUrl}/transactions/init
   * 2. Include paymentMethods: ['VIS', 'ECA', 'TWI'] (TWI = TWINT)
   * 3. Set currency: 'CHF', amount in Rappen (CHF * 100)
   * 4. Set successUrl, cancelUrl, errorUrl
   * 5. Return { id: transactionId, url: paymentPageUrl, provider: 'DATATRANS' }
   *
   * Datatrans docs: https://docs.datatrans.ch/docs/redirect-lightbox
   */
  async createSubscription(
    _userId: string,
    _plan: Plan,
    _currency: string
  ): Promise<CheckoutSession> {
    // TODO: Implement Datatrans checkout session creation
    // Example request body:
    // {
    //   currency: 'CHF',
    //   refno: userId,
    //   amount: 1000,  // CHF 10.00 in Rappen
    //   paymentMethods: ['VIS', 'ECA', 'TWI'],
    //   redirect: {
    //     successUrl: `${appUrl}/dashboard?subscription=success`,
    //     cancelUrl: `${appUrl}/checkout?canceled=true`,
    //     errorUrl: `${appUrl}/checkout?error=true`,
    //   },
    //   webhook: { url: `${appUrl}/api/webhooks/datatrans` }
    // }
    throw new NotImplementedError(
      "DatatransProvider.createSubscription is not yet implemented. " +
        "See TODO comments for implementation guide."
    );
  }

  /**
   * TODO: Implement Datatrans subscription cancellation.
   *
   * Datatrans does not have native recurring subscriptions like Stripe.
   * Implementation options:
   * 1. Use an alias/token stored from first payment for recurring charges
   * 2. Integrate with a subscription management layer (e.g. custom cron)
   * 3. Or use Datatrans + Chargebee for full recurring billing
   *
   * Docs: https://docs.datatrans.ch/docs/aliases
   */
  async cancelSubscription(_subscriptionId: string): Promise<void> {
    // TODO: Cancel recurring alias / mark subscription as canceled in DB
    throw new NotImplementedError(
      "DatatransProvider.cancelSubscription is not yet implemented."
    );
  }

  /**
   * TODO: Implement Datatrans subscription status retrieval.
   *
   * Since Datatrans does not have built-in subscription management,
   * this method should query your own database for the subscription
   * record associated with this customerId/alias.
   */
  async getSubscriptionStatus(
    _customerId: string
  ): Promise<SubscriptionStatusResult> {
    // TODO: Query internal subscription record by Datatrans aliasCC or merchantId
    throw new NotImplementedError(
      "DatatransProvider.getSubscriptionStatus is not yet implemented."
    );
  }

  /**
   * TODO: Implement Datatrans webhook handling.
   *
   * Datatrans sends webhooks via POST to your webhook endpoint.
   * Validate the signature using DATATRANS_WEBHOOK_SECRET.
   *
   * Relevant webhook events:
   *  - authorized   → payment successful
   *  - canceled     → payment canceled
   *  - failed       → payment failed
   *
   * Docs: https://docs.datatrans.ch/docs/webhooks
   */
  async handleWebhook(
    _payload: string | Buffer,
    _signature: string
  ): Promise<WebhookEvent> {
    // TODO: Validate Datatrans webhook signature
    // TODO: Parse payload and map to WebhookEvent type
    // DATATRANS_WEBHOOK_SECRET is used for HMAC-SHA256 validation
    throw new NotImplementedError(
      "DatatransProvider.handleWebhook is not yet implemented."
    );
  }
}

class NotImplementedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotImplementedError";
  }
}
