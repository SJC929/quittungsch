"use client";

import { useState } from "react";
import { Button } from "@spezo/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@spezo/ui";
import { Label } from "@spezo/ui";
import { Input } from "@spezo/ui";

type ExportFormat = "EXCEL" | "CSV" | "PDF" | "GOOGLE_SHEETS";

const FORMATS: { value: ExportFormat; label: string; description: string; icon: string }[] = [
  { value: "EXCEL", label: "Excel (.xlsx)", description: "Ideal für Swiss Excel, eine Seite pro Monat", icon: "📊" },
  { value: "CSV", label: "CSV (Semikolon)", description: "Für jede Buchhaltungssoftware", icon: "📋" },
  { value: "PDF", label: "PDF-Bericht", description: "Für Treuhänder, mit Wasserzeichen", icon: "📄" },
  { value: "GOOGLE_SHEETS", label: "Google Sheets", description: "Direkt in Google Sheets (OAuth erforderlich)", icon: "🌐" },
];

export default function ExportsPage() {
  const [format, setFormat] = useState<ExportFormat>("EXCEL");
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split("T")[0]!;
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split("T")[0]!);
  const [includeKm, setIncludeKm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleExport() {
    if (format === "GOOGLE_SHEETS") {
      setError("Google Sheets Export erfordert OAuth-Setup. Kontaktieren Sie den Support.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/exports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format,
          dateFrom: new Date(dateFrom).toISOString(),
          dateTo: new Date(dateTo).toISOString(),
          includeKmLogs: includeKm,
        }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? "Export fehlgeschlagen");
        return;
      }

      // Trigger download
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const contentDisposition = res.headers.get("Content-Disposition") ?? "";
      const match = /filename="([^"]+)"/.exec(contentDisposition);
      a.download = match?.[1] ?? `Spezo_Export.${format.toLowerCase()}`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError("Netzwerkfehler. Bitte versuchen Sie es erneut.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Exporte</h1>
        <p className="text-gray-500 mt-1">Exportieren Sie Ihre Belege für die Buchhaltung</p>
      </div>

      {/* Format selection */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Format wählen</h2>
        <div className="grid grid-cols-2 gap-3">
          {FORMATS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFormat(f.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                format === f.value
                  ? "border-emerald-700 bg-emerald-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{f.icon}</span>
                <span className="font-semibold text-sm">{f.label}</span>
              </div>
              <p className="text-xs text-gray-500">{f.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Date range */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Zeitraum</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label>Von</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Bis</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Options */}
      <Card className="mb-6">
        <CardContent className="pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeKm}
              onChange={(e) => setIncludeKm(e.target.checked)}
              className="h-4 w-4 rounded"
            />
            <div>
              <span className="font-medium text-sm">Kilometerpauschale einschliessen</span>
              <p className="text-xs text-gray-500">CHF 0.70/km (Schweizer Steuerstandard)</p>
            </div>
          </label>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      <Button
        onClick={() => void handleExport()}
        disabled={loading || !dateFrom || !dateTo}
        className="w-full h-12 text-base"
      >
        {loading ? "Export wird erstellt..." : `${FORMATS.find((f) => f.value === format)?.icon} ${FORMATS.find((f) => f.value === format)?.label} herunterladen`}
      </Button>

      <p className="text-center text-xs text-gray-400 mt-3">
        PDF-Exporte enthalten den Vermerk «Erstellt mit Spezo – Nicht geprüft»
      </p>
    </div>
  );
}
