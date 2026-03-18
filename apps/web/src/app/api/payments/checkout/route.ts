import { NextRequest, NextResponse } from "next/server";
import { getPaymentProvider, isPaymentEnabled } from "@quittungsch/payments";
import { getSession } from "@/lib/auth";

export async function POST(_req: NextRequest) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isPaymentEnabled()) {
    return NextResponse.json(
      {
        message: "Payments not yet enabled. Free access until launch.",
        comingSoon: true,
      },
      { status: 200 }
    );
  }

  const provider = getPaymentProvider();
  if (!provider) {
    return NextResponse.json({ error: "No payment provider configured" }, { status: 500 });
  }

  try {
    const session_ = await provider.createSubscription(
      session.user.id,
      "PRO_MONTHLY",
      "CHF"
    );

    return NextResponse.json({ checkoutUrl: session_.url });
  } catch (err) {
    console.error("[Checkout] Error:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
