import Stripe from "stripe";
import type { CheckoutSession, SubscriptionStatusResult, WebhookEvent } from "@quittungsch/types";
import type { IPaymentProvider, Plan } from "../payment-provider.interface";

/**
 * Stripe Payment Provider
 *
 * Supports:
 *  - Card payments
 *  - TWINT (native Stripe payment method for Switzerland)
 *  - Customer Portal for self-service
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET
 *   STRIPE_PRICE_ID_MONTHLY
 *   NEXT_PUBLIC_APP_URL
 */
export class StripeProvider implements IPaymentProvider {
  private stripe: Stripe;
  private webhookSecret: string;
  private priceId: string;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error(
        "[StripeProvider] STRIPE_SECRET_KEY is not set. " +
          "Add it to your .env file before enabling Stripe."
      );
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: "2024-06-20",
      typescript: true,
    });

    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
    this.priceId = process.env.STRIPE_PRICE_ID_MONTHLY ?? "";
  }

  /**
   * Create a Stripe Checkout Session.
   * Supports card + TWINT payment methods.
   */
  async createSubscription(
    userId: string,
    _plan: Plan,
    currency: string
  ): Promise<CheckoutSession> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // Build payment method types – always include card; add TWINT if enabled
    const paymentMethodTypes: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] =
      ["card"];

    if (process.env.PAYMENT_TWINT_VIA_STRIPE === "true") {
      paymentMethodTypes.push("twint");
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: paymentMethodTypes,
      line_items: [
        {
          price: this.priceId,
          quantity: 1,
        },
      ],
      currency: currency.toLowerCase(),
      client_reference_id: userId,
      success_url: `${appUrl}/dashboard?subscription=success`,
      cancel_url: `${appUrl}/checkout?canceled=true`,
      metadata: {
        userId,
        appName: "QuittungsCH",
      },
      subscription_data: {
        trial_period_days: 14,
        metadata: { userId },
      },
    });

    if (!session.url) {
      throw new Error("[StripeProvider] Stripe did not return a checkout URL.");
    }

    return {
      id: session.id,
      url: session.url,
      provider: "STRIPE",
    };
  }

  /**
   * Cancel a subscription at period end.
   * Users retain access until currentPeriodEnd.
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

  /**
   * Retrieve subscription status for a Stripe customer.
   */
  async getSubscriptionStatus(
    customerId: string
  ): Promise<SubscriptionStatusResult> {
    const subscriptions = await this.stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: "all",
    });

    const sub = subscriptions.data[0];

    if (!sub) {
      return {
        status: "CANCELED",
        provider: "STRIPE",
      };
    }

    const statusMap: Record<string, SubscriptionStatusResult["status"]> = {
      active: "ACTIVE",
      past_due: "PAST_DUE",
      canceled: "CANCELED",
      trialing: "TRIALING",
      incomplete: "INCOMPLETE",
    };

    return {
      status: statusMap[sub.status] ?? "INCOMPLETE",
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      provider: "STRIPE",
    };
  }

  /**
   * Validate Stripe webhook signature and parse event.
   * Supported events:
   *  - invoice.payment_succeeded
   *  - customer.subscription.deleted
   *  - customer.updated
   *  - invoice.payment_failed
   */
  async handleWebhook(
    payload: string | Buffer,
    signature: string
  ): Promise<WebhookEvent> {
    if (!this.webhookSecret) {
      throw new Error(
        "[StripeProvider] STRIPE_WEBHOOK_SECRET is not set. " +
          "Webhooks cannot be validated."
      );
    }

    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.webhookSecret
    );

    const typeMap: Record<string, WebhookEvent["type"]> = {
      "invoice.payment_succeeded": "payment_succeeded",
      "customer.subscription.deleted": "subscription_deleted",
      "customer.updated": "customer_updated",
      "invoice.payment_failed": "invoice_payment_failed",
    };

    const mappedType = typeMap[event.type];

    if (!mappedType) {
      throw new Error(`[StripeProvider] Unhandled event type: ${event.type}`);
    }

    // Extract tenantId from metadata if available
    let tenantId: string | undefined;
    const obj = event.data.object as Record<string, unknown>;
    if (
      obj.metadata &&
      typeof obj.metadata === "object" &&
      "tenantId" in obj.metadata
    ) {
      tenantId = (obj.metadata as Record<string, string>).tenantId;
    }

    return {
      type: mappedType,
      tenantId,
      data: event.data.object as Record<string, unknown>,
    };
  }

  /**
   * Create a Stripe Customer Portal session for self-service.
   * Returns the portal URL.
   */
  async createPortalSession(customerId: string): Promise<string> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/settings/billing`,
    });

    return session.url;
  }
}
