import { NextRequest, NextResponse } from "next/server";
import { StripeProvider } from "@spezo/payments";
import { prisma } from "@spezo/db/client";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = new StripeProvider();

  try {
    const event = await stripe.handleWebhook(body, signature);

    switch (event.type) {
      case "payment_succeeded": {
        const data = event.data as { customer?: string; subscription?: string };
        if (data.customer) {
          await prisma.subscription.updateMany({
            where: { externalCustomerId: data.customer },
            data: { status: "ACTIVE" },
          });
        }
        break;
      }

      case "subscription_deleted": {
        const data = event.data as { id?: string };
        if (data.id) {
          await prisma.subscription.updateMany({
            where: { externalSubscriptionId: data.id },
            data: { status: "CANCELED" },
          });
        }
        break;
      }

      case "invoice_payment_failed": {
        const data = event.data as { customer?: string };
        if (data.customer) {
          await prisma.subscription.updateMany({
            where: { externalCustomerId: data.customer },
            data: { status: "PAST_DUE" },
          });
        }
        break;
      }

      case "customer_updated":
        // Handle customer metadata updates if needed
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Webhook/Stripe] Error:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 }
    );
  }
}
