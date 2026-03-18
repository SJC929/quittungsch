"use client";

import { useState } from "react";
import { isPaymentEnabled, getActiveProvider, isTwintViaStripeEnabled } from "@quittungsch/payments/feature-flags";
import { Button } from "@quittungsch/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@quittungsch/ui";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const paymentEnabled = isPaymentEnabled();
  const activeProvider = getActiveProvider();
  const twintEnabled = isTwintViaStripeEnabled();

  async function handleCheckout(paymentMethod?: "card" | "twint") {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod }),
      });

      const data = await res.json() as { checkoutUrl?: string; comingSoon?: boolean };

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">QuittungsCH Pro</h1>
          <p className="text-gray-500 mt-1">Alle Features ohne Einschränkungen</p>
        </div>

        {/* Price card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">CHF 10</span>
              <span className="text-gray-500 font-normal">/ Monat</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              {[
                "Unbegrenzte Belege",
                "OCR-Analyse (KI-gestützt)",
                "Excel / CSV / PDF Export",
                "QR-Rechnungen automatisch erkannt",
                "Schweizer Datenspeicherung",
                "Alle Sprachen (DE/FR/IT/EN)",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Payment section */}
        {!paymentEnabled ? (
          /* Both providers disabled – free trial mode */
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            <div className="text-2xl mb-2">🎉</div>
            <h3 className="font-semibold text-blue-800 mb-2">
              Kostenlos bis zum Launch
            </h3>
            <p className="text-blue-600 text-sm">
              Wir nehmen bald Zahlungen entgegen – du kannst die App kostenlos nutzen bis zum Launch.
            </p>
            <Button
              className="mt-4 w-full"
              variant="outline"
              onClick={() => window.location.href = "/dashboard"}
            >
              Zur App →
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeProvider === "stripe" && (
              <>
                <Button
                  className="w-full h-12 text-base"
                  onClick={() => void handleCheckout("card")}
                  disabled={loading}
                >
                  {loading ? "Lädt..." : "Mit Karte bezahlen"}
                </Button>

                {twintEnabled && (
                  <Button
                    variant="outline"
                    className="w-full h-12 text-base border-2"
                    onClick={() => void handleCheckout("twint")}
                    disabled={loading}
                  >
                    <span className="mr-2">📱</span>
                    Mit TWINT bezahlen
                  </Button>
                )}
              </>
            )}

            {activeProvider === "datatrans" && (
              <Button
                className="w-full h-12 text-base bg-red-600 hover:bg-red-700"
                onClick={() => void handleCheckout()}
                disabled={loading}
              >
                {loading ? "Lädt..." : "Via Datatrans bezahlen"}
              </Button>
            )}
          </div>
        )}

        <p className="text-center text-xs text-gray-400">
          Alle Daten werden in der Schweiz gespeichert (DSG-konform).
          Kündigung jederzeit möglich.
        </p>
      </div>
    </div>
  );
}
