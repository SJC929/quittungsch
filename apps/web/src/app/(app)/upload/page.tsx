"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@quittungsch/ui";
import { Input } from "@quittungsch/ui";
import { Label } from "@quittungsch/ui";
import { Card, CardContent } from "@quittungsch/ui";
import { ConfidenceBadge } from "@quittungsch/ui";
import type { ExtractedExpense } from "@quittungsch/types";

type UploadState = "idle" | "uploading" | "reviewing" | "saving" | "done";

interface FormData {
  merchantName: string;
  date: string;
  amount: string;
  currency: string;
  vatRate: string;
  vatAmount: string;
  subtotal: string;
  category: string;
  receiptType: string;
  paymentMethod: string;
  notes: string;
}

const CATEGORIES = [
  { value: "RESTAURANT", label: "Essen & Getränke" },
  { value: "TANKSTELLE", label: "Benzin / Transport" },
  { value: "BUERO", label: "Büromaterial" },
  { value: "TELEFON", label: "Telefon / Internet" },
  { value: "TRANSPORT", label: "Transport / Reise" },
  { value: "UNTERKUNFT", label: "Unterkunft" },
  { value: "VERSICHERUNG", label: "Versicherung" },
  { value: "WEITERBILDUNG", label: "Weiterbildung" },
  { value: "DIVERSES", label: "Diverses" },
];

export default function UploadPage() {
  const router = useRouter();
  const [state, setState] = useState<UploadState>("idle");
  const [isSaving, setIsSaving] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedExpense | null>(null);
  const [receiptPath, setReceiptPath] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [error, setError] = useState("");
  const [ocrLayer, setOcrLayer] = useState("");

  const [form, setForm] = useState<FormData>({
    merchantName: "",
    date: new Date().toISOString().split("T")[0]!,
    amount: "",
    currency: "CHF",
    vatRate: "",
    vatAmount: "",
    subtotal: "",
    category: "DIVERSES",
    receiptType: "KASSENBON",
    paymentMethod: "UNKNOWN",
    notes: "",
  });

  const handleFileUpload = useCallback(async (file: File) => {
    setState("uploading");
    setError("");
    setOcrLayer("Texterkennung (OCR)...");

    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setOcrLayer("KI-Analyse (Claude)...");
      const res = await fetch("/api/ocr", { method: "POST", body: formData });
      const data = await res.json() as {
        extracted?: ExtractedExpense;
        receiptPath?: string;
        error?: string;
      };

      if (!res.ok) {
        setError(data.error ?? "OCR fehlgeschlagen");
        setState("idle");
        return;
      }

      if (data.extracted) {
        setExtracted(data.extracted);
        setReceiptPath(data.receiptPath ?? "");

        // Pre-fill form from extracted data
        setForm({
          merchantName: data.extracted.merchant ?? "",
          date: data.extracted.date ?? new Date().toISOString().split("T")[0]!,
          amount: data.extracted.total?.toFixed(2) ?? "",
          currency: data.extracted.currency ?? "CHF",
          vatRate: data.extracted.vatRate?.toString() ?? "",
          vatAmount: data.extracted.vatAmount?.toFixed(2) ?? "",
          subtotal: data.extracted.subtotal?.toFixed(2) ?? "",
          category: mapCategory(data.extracted.category),
          receiptType: mapReceiptType(data.extracted.receiptType),
          paymentMethod: mapPaymentMethod(data.extracted.paymentMethod),
          notes: "",
        });
      }

      setState("reviewing");
    } catch {
      setError("Upload fehlgeschlagen. Bitte versuchen Sie es erneut.");
      setState("idle");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) void handleFileUpload(file);
    },
    [handleFileUpload]
  );

  const handleSave = async () => {
    setIsSaving(true);
    setState("saving");

    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchantName: form.merchantName || undefined,
        date: new Date(form.date).toISOString(),
        amount: parseFloat(form.amount),
        currency: form.currency,
        vatRate: form.vatRate ? parseFloat(form.vatRate) : undefined,
        vatAmount: form.vatAmount ? parseFloat(form.vatAmount) : undefined,
        subtotal: form.subtotal ? parseFloat(form.subtotal) : undefined,
        category: form.category,
        receiptType: form.receiptType,
        paymentMethod: form.paymentMethod,
        notes: form.notes || undefined,
        receiptImageUrl: receiptPath || undefined,
        ocrConfidence: extracted?.confidence,
        ocrProvider: extracted?.ocrProvider,
        ocrRawText: extracted?.rawText,
        needsReview: extracted ? extracted.confidence < 0.9 : false,
      }),
    });

    if (res.ok) {
      setState("done");
      setTimeout(() => router.push("/expenses"), 1000);
    } else {
      setError("Speichern fehlgeschlagen.");
      setState("reviewing");
    }
    setIsSaving(false);
  };

  if (state === "done") {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-semibold">Beleg gespeichert!</h2>
          <p className="text-gray-500 mt-1">Weiterleitung zu den Belegen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Beleg erfassen</h1>

      {state === "idle" && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onClick={() => document.getElementById("file-input")?.click()}
        >
          <div className="text-5xl mb-4">📄</div>
          <h3 className="text-lg font-medium mb-2">Bild oder PDF hierher ziehen</h3>
          <p className="text-gray-400 text-sm mb-4">oder klicken zum Auswählen</p>
          <p className="text-xs text-gray-400">JPG, PNG, PDF bis 10 MB</p>
          <input
            id="file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFileUpload(file);
            }}
          />
          {error && (
            <p className="mt-4 text-red-600 text-sm">{error}</p>
          )}
        </div>
      )}

      {state === "uploading" && (
        <div className="text-center py-16">
          <div className="animate-spin text-4xl mb-4">⚙️</div>
          <p className="font-medium">{ocrLayer}</p>
          <p className="text-gray-400 text-sm mt-1">Beleg wird analysiert...</p>
        </div>
      )}

      {state === "reviewing" && extracted && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Preview */}
          <div>
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Beleg"
                className="w-full rounded-xl border border-gray-200 max-h-96 object-contain"
              />
            )}

            {/* Confidence indicator */}
            <Card className="mt-4">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">OCR-Konfidenz</span>
                  <ConfidenceBadge confidence={extracted.confidence} />
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      extracted.confidence >= 0.9
                        ? "bg-green-500"
                        : extracted.confidence >= 0.75
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${extracted.confidence * 100}%` }}
                  />
                </div>
                {extracted.confidence < 0.75 && extracted.missingFields.length > 0 && (
                  <p className="text-xs text-red-600 mt-2">
                    Unsichere Felder: {extracted.missingFields.join(", ")}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Händler</Label>
                <Input
                  value={form.merchantName}
                  onChange={(e) => setForm({ ...form, merchantName: e.target.value })}
                  className={`mt-1 ${
                    extracted.missingFields.includes("merchant")
                      ? "border-orange-400"
                      : ""
                  }`}
                />
              </div>
              <div>
                <Label>Datum</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className={`mt-1 ${
                    extracted.missingFields.includes("date")
                      ? "border-orange-400"
                      : ""
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Betrag CHF *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className={`mt-1 ${
                    extracted.missingFields.includes("total")
                      ? "border-orange-400"
                      : ""
                  }`}
                  required
                />
              </div>
              <div>
                <Label>MwSt-Satz %</Label>
                <select
                  value={form.vatRate}
                  onChange={(e) => setForm({ ...form, vatRate: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                >
                  <option value="">Kein MwSt</option>
                  <option value="8.1">8.1% (Standard)</option>
                  <option value="3.8">3.8% (Beherbergung)</option>
                  <option value="2.5">2.5% (Reduziert)</option>
                  <option value="0">0% (Befreit)</option>
                </select>
              </div>
            </div>

            <div>
              <Label>Kategorie</Label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Belegart</Label>
                <select
                  value={form.receiptType}
                  onChange={(e) => setForm({ ...form, receiptType: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                >
                  <option value="KASSENBON">Kassenbon</option>
                  <option value="RECHNUNG">Rechnung</option>
                  <option value="TANKBELEG">Tankbeleg</option>
                  <option value="QR_RECHNUNG">QR-Rechnung</option>
                  <option value="SONSTIGE">Sonstige</option>
                </select>
              </div>
              <div>
                <Label>Zahlungsmittel</Label>
                <select
                  value={form.paymentMethod}
                  onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                >
                  <option value="CASH">Bar</option>
                  <option value="CARD">Karte</option>
                  <option value="TWINT">TWINT</option>
                  <option value="BANK_TRANSFER">Banküberweisung</option>
                  <option value="UNKNOWN">Unbekannt</option>
                </select>
              </div>
            </div>

            <div>
              <Label>Notizen</Label>
              <Input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Optionale Notizen..."
                className="mt-1"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setState("idle");
                  setExtracted(null);
                }}
                className="flex-1"
              >
                Abbrechen
              </Button>
              <Button
                onClick={() => void handleSave()}
                disabled={!form.amount || isSaving}
                className="flex-1"
              >
                {isSaving ? "Wird gespeichert..." : "Speichern"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Map Claude's snake_case category values to DB enums
function mapCategory(raw?: string): string {
  const map: Record<string, string> = {
    restaurant: "RESTAURANT",
    tankstelle: "TANKSTELLE",
    buero: "BUERO",
    telefon: "TELEFON",
    transport: "TRANSPORT",
    unterkunft: "UNTERKUNFT",
    versicherung: "VERSICHERUNG",
    weiterbildung: "WEITERBILDUNG",
    diverses: "DIVERSES",
  };
  return map[raw?.toLowerCase() ?? ""] ?? "DIVERSES";
}

function mapReceiptType(raw?: string): string {
  const map: Record<string, string> = {
    kassenbon: "KASSENBON",
    rechnung: "RECHNUNG",
    tankbeleg: "TANKBELEG",
    qr_rechnung: "QR_RECHNUNG",
  };
  return map[raw?.toLowerCase() ?? ""] ?? "KASSENBON";
}

function mapPaymentMethod(raw?: string): string {
  const map: Record<string, string> = {
    cash: "CASH",
    card: "CARD",
    twint: "TWINT",
    bank_transfer: "BANK_TRANSFER",
  };
  return map[raw?.toLowerCase() ?? ""] ?? "UNKNOWN";
}
