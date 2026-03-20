import { getSession } from "@/lib/auth";
import { prisma } from "@spezo/db/client";
import { isPaymentEnabled } from "@spezo/payments/feature-flags";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@spezo/ui";
import { Button } from "@spezo/ui";
import { LanguageSelector } from "@/components/settings/language-selector";

export const metadata = { title: "Einstellungen" };

export default async function SettingsPage() {
  const session = await getSession();
  if (!session?.user) return null;

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.tenantId },
    include: { subscriptions: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  const subscription = tenant?.subscriptions[0];
  const paymentEnabled = isPaymentEnabled();

  return (
    <div className="p-8 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Einstellungen</h1>
        <p className="text-gray-500 mt-1">Konto & Abonnement</p>
      </div>

      {/* Account info */}
      <Card>
        <CardHeader>
          <CardTitle>Konto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">E-Mail</span>
            <span className="font-medium">{session.user.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Firmenname</span>
            <span className="font-medium">{tenant?.name ?? "-"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Plan</span>
            <span className="font-medium capitalize">{tenant?.plan.toLowerCase() ?? "-"}</span>
          </div>
          {tenant?.trialEndsAt && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Trial endet</span>
              <span className="font-medium">
                {new Date(tenant.trialEndsAt).toLocaleDateString("de-CH")}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Abonnement</CardTitle>
          <CardDescription>CHF 10 / Monat · Kündigung jederzeit möglich</CardDescription>
        </CardHeader>
        <CardContent>
          {!paymentEnabled ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <p className="text-emerald-700 text-sm font-medium">
                Zahlungen folgen bald – kostenlose Nutzung bis zum Launch
              </p>
            </div>
          ) : subscription ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className={`font-medium capitalize ${
                  subscription.status === "ACTIVE"
                    ? "text-green-600"
                    : subscription.status === "TRIALING"
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}>
                  {subscription.status}
                </span>
              </div>
              {subscription.currentPeriodEnd && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Nächste Zahlung</span>
                  <span className="font-medium">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString("de-CH")}
                  </span>
                </div>
              )}
              <Link href="/api/payments/portal">
                <Button variant="outline" className="w-full mt-2">
                  Abonnement verwalten
                </Button>
              </Link>
            </div>
          ) : (
            <Link href="/checkout">
              <Button className="w-full">Jetzt abonnieren</Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader>
          <CardTitle>Sprache / Langue / Lingua / Lingua</CardTitle>
          <CardDescription>Wählen Sie Ihre bevorzugte Sprache</CardDescription>
        </CardHeader>
        <CardContent>
          <LanguageSelector current={tenant?.preferredLanguage ?? "de"} />
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle>Datenschutz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>Alle Daten werden ausschliesslich in der Schweiz gespeichert (DSG-konform).</p>
          <p>OCR-Analysen werden via Google Cloud Vision und Claude (Anthropic) durchgeführt.</p>
          <p>Belegbilder werden verschlüsselt gespeichert und nie öffentlich zugänglich gemacht.</p>
        </CardContent>
      </Card>
    </div>
  );
}
