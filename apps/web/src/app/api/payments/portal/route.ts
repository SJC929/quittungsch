import { NextRequest, NextResponse } from "next/server";
import { StripeProvider } from "@quittungsch/payments";
import { getActiveProvider } from "@quittungsch/payments/feature-flags";
import { prisma } from "@quittungsch/db/client";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const provider = getActiveProvider();
  if (provider !== "stripe") {
    return NextResponse.redirect(new URL("/settings", req.url));
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.tenantId },
  });

  if (!tenant?.stripeCustomerId) {
    return NextResponse.redirect(new URL("/checkout", req.url));
  }

  const stripe = new StripeProvider();
  const portalUrl = await stripe.createPortalSession(tenant.stripeCustomerId);

  return NextResponse.redirect(portalUrl);
}
