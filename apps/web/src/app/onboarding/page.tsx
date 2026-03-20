"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@quittungsch/ui";
import { Input } from "@quittungsch/ui";
import { Label } from "@quittungsch/ui";

type Step = 1 | 2 | 3 | 4;

interface OnboardingData {
  businessName: string;
  uid: string;
  preferredExportFormat: "EXCEL" | "CSV" | "PDF" | "GOOGLE_SHEETS";
  language: string;
}

const STEPS = [
  { id: 1, title: "Ihr Unternehmen", description: "Wie heisst Ihr Unternehmen?" },
  { id: 2, title: "MwSt-Einstellungen", description: "Sind Sie MwSt-pflichtig?" },
  { id: 3, title: "Export-Präferenz", description: "Welches Format bevorzugen Sie?" },
  { id: 4, title: "Sprache", description: "In welcher Sprache möchten Sie arbeiten?" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [data, setData] = useState<OnboardingData>({
    businessName: "",
    uid: "",
    preferredExportFormat: "EXCEL",
    language: "de",
  });
  const [loading, setLoading] = useState(false);

  async function handleFinish() {
    setLoading(true);
    try {
      await fetch("/api/tenant/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      router.push("/dashboard");
    } catch {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Progress bar */}
        <div className="flex">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`flex-1 h-1 transition-colors ${
                s.id <= step ? "bg-emerald-700" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        <div className="p-8">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-gray-400">
              Schritt {step} von {STEPS.length}
            </span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>

          {/* Step content */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">{STEPS[0]!.title}</h2>
                <p className="text-gray-500">{STEPS[0]!.description}</p>
              </div>
              <div>
                <Label htmlFor="businessName">Firmenname / Name *</Label>
                <Input
                  id="businessName"
                  value={data.businessName}
                  onChange={(e) => setData({ ...data, businessName: e.target.value })}
                  placeholder="Max Muster GmbH"
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">{STEPS[1]!.title}</h2>
                <p className="text-gray-500">
                  Die UID (MwSt-Nummer) erscheint auf Ihren Exporten.
                </p>
              </div>
              <div>
                <Label htmlFor="uid">MwSt-Nummer (UID, optional)</Label>
                <Input
                  id="uid"
                  value={data.uid}
                  onChange={(e) => setData({ ...data, uid: e.target.value })}
                  placeholder="CHE-123.456.789"
                  className="mt-1"
                />
              </div>
              <p className="text-xs text-gray-400">
                Die Schweizer MwSt-Sätze sind: 8.1% (Standard), 3.8% (Beherbergung), 2.5% (Reduziert).
                QuittungsCH erkennt diese automatisch per OCR.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">{STEPS[2]!.title}</h2>
                <p className="text-gray-500">
                  Für Ihr Treuhänderbüro oder Ihre Buchhaltungssoftware.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(["EXCEL", "CSV", "PDF"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setData({ ...data, preferredExportFormat: fmt })}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      data.preferredExportFormat === fmt
                        ? "border-emerald-700 bg-emerald-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-semibold">
                      {fmt === "EXCEL" ? "Excel (.xlsx)" : fmt === "CSV" ? "CSV (Semikolon)" : "PDF-Bericht"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {fmt === "EXCEL"
                        ? "Ideal für Swiss Excel"
                        : fmt === "CSV"
                        ? "Für jede Buchhaltungssoftware"
                        : "Für Treuhänder"}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">{STEPS[3]!.title}</h2>
                <p className="text-gray-500">
                  QuittungsCH unterstützt alle Landessprachen.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { code: "de", label: "Deutsch", flag: "🇩🇪" },
                  { code: "fr", label: "Français", flag: "🇫🇷" },
                  { code: "it", label: "Italiano", flag: "🇮🇹" },
                  { code: "rm", label: "Rumantsch", flag: "🏔️" },
                  { code: "en", label: "English", flag: "🇬🇧" },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setData({ ...data, language: lang.code })}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      data.language === lang.code
                        ? "border-emerald-700 bg-emerald-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <div className="font-semibold mt-1">{lang.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep((s) => (s - 1) as Step)}
                className="flex-1"
              >
                Zurück
              </Button>
            )}

            {step < 4 ? (
              <Button
                onClick={() => setStep((s) => (s + 1) as Step)}
                className="flex-1"
                disabled={step === 1 && !data.businessName.trim()}
              >
                Weiter
              </Button>
            ) : (
              <Button
                onClick={() => void handleFinish()}
                className="flex-1"
                disabled={loading}
              >
                {loading ? "Wird eingerichtet..." : "Loslegen"}
              </Button>
            )}
          </div>

          {step > 1 && (
            <button
              className="w-full text-center text-sm text-gray-400 mt-3 hover:text-gray-600"
              onClick={() => void handleFinish()}
            >
              Überspringen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
