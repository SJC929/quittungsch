"use client";

import { useState } from "react";
import { isPaymentEnabled, getActiveProvider, isTwintViaStripeEnabled } from "@spezo/payments/feature-flags";
import { Button } from "@spezo/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@spezo/ui";
import { LogoWithText } from "@/components/logo";

const FEATURES_FREE = [
  "10 Belege pro Monat",
  "OCR-Analyse (KI-gestützt)",
  "Excel / CSV Export",
  "Schweizer Datenspeicherung",
];

const FEATURES_PRO = [
  "Unbegrenzte Belege",
  "OCR + Claude KI-Analyse",
  "Excel, CSV, PDF Export",
  "GPS Kilometer-Protokoll",
  "MwSt-Abrechnung für ESTV",
  "Treuhänder-Zugang (read-only)",
  "Wiederkehrende Ausgaben",
  "Belegfrist-Erinnerungen",
  "QR-Rechnungen automatisch erkannt",
  "Schweizer Datenspeicherung",
  "Alle Sprachen (DE/FR/IT/EN/TR/SQ)",
];

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
      const data = await res.json() as { checkoutUrl?: string };
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F0FDF9" }}>
      <div className="p-4 flex items-center">
        <LogoWithText iconSize={36} textSize="md" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Einfache Preise</h1>
        <p className="text-gray-500 mb-10 text-center">Keine versteckten Kosten. Kündigung jederzeit.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
          {/* Free Plan */}
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gratis</p>
              <CardTitle className="flex items-baseline gap-2 mt-1">
                <span className="text-5xl font-bold">CHF 0</span>
                <span className="text-gray-400 font-normal text-sm">/Monat</span>
              </CardTitle>
              <p className="text-sm text-gray-400">Für Einsteiger</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                {FEATURES_FREE.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" onClick={() => window.location.href = "/dashboard"}>
                Kostenlos starten
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="border-2 border-emerald-500 relative shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-emerald-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                BELIEBTESTE WAHL
              </span>
            </div>
            <CardHeader>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Pro</p>
              <CardTitle className="flex items-baseline gap-2 mt-1">
                <span className="text-5xl font-bold text-emerald-700">CHF 4.95</span>
                <span className="text-gray-400 font-normal text-sm">/Monat</span>
              </CardTitle>
              <p className="text-sm text-gray-400">Alle Features + GPS Mobile</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                {FEATURES_PRO.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>

              {!paymentEnabled ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <p className="text-emerald-700 text-sm font-medium mb-3">
                    🎉 Kostenlos bis zum Launch – jetzt gratis Pro nutzen!
                  </p>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => window.location.href = "/dashboard"}>
                    Zur App →
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeProvider === "stripe" && (
                    <>
                      <Button className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-700" onClick={() => void handleCheckout("card")} disabled={loading}>
                        {loading ? "Lädt..." : "Mit Karte bezahlen"}
                      </Button>
                      {twintEnabled && (
                        <Button variant="outline" className="w-full h-12 text-base border-2 border-emerald-200" onClick={() => void handleCheckout("twint")} disabled={loading}>
                          <span className="mr-2">📱</span> Mit TWINT bezahlen
                        </Button>
                      )}
                    </>
                  )}
                  {activeProvider === "datatrans" && (
                    <Button className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-700" onClick={() => void handleCheckout()} disabled={loading}>
                      {loading ? "Lädt..." : "Via Datatrans bezahlen"}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          🇨🇭 Alle Daten werden in der Schweiz gespeichert (DSG-konform). Kündigung jederzeit möglich.
        </p>
      </div>
    </div>
  );
}
