"use client";

import { useState } from "react";
import { Button } from "@spezo/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@spezo/ui";
import { Label } from "@spezo/ui";
import { Input } from "@spezo/ui";
import { useLanguage } from "@/contexts/language-context";
import type { SupportedLanguage } from "@spezo/i18n";

type ExportFormat = "EXCEL" | "CSV" | "PDF" | "GOOGLE_SHEETS";

const T = {
  de: {
    title: "Exporte",
    subtitle: "Exportieren Sie Ihre Belege für die Buchhaltung",
    choose_format: "Format wählen",
    time_period: "Zeitraum",
    from: "Von",
    to: "Bis",
    include_km: "Kilometerpauschale einschliessen",
    km_desc: "CHF 0.70/km (Schweizer Steuerstandard)",
    download: "herunterladen",
    exporting: "Export wird erstellt...",
    pdf_note: "PDF-Exporte enthalten den Vermerk «Erstellt mit Spezo – Nicht geprüft»",
    google_sheets_error: "Google Sheets Export erfordert OAuth-Setup. Kontaktieren Sie den Support.",
    network_error: "Netzwerkfehler. Bitte versuchen Sie es erneut.",
    excel_desc: "Ideal für Swiss Excel, eine Seite pro Monat",
    csv_desc: "Für jede Buchhaltungssoftware",
    pdf_desc: "Für Treuhänder, mit Wasserzeichen",
    google_desc: "Direkt in Google Sheets (OAuth erforderlich)",
  },
  fr: {
    title: "Exports",
    subtitle: "Exportez vos reçus pour la comptabilité",
    choose_format: "Choisir le format",
    time_period: "Période",
    from: "De",
    to: "À",
    include_km: "Inclure le forfait kilométrique",
    km_desc: "CHF 0.70/km (norme fiscale suisse)",
    download: "télécharger",
    exporting: "Export en cours...",
    pdf_note: "Les exports PDF incluent la mention «Créé avec Spezo – Non vérifié»",
    google_sheets_error: "L'export Google Sheets nécessite une configuration OAuth. Contactez le support.",
    network_error: "Erreur réseau. Veuillez réessayer.",
    excel_desc: "Idéal pour Swiss Excel, une page par mois",
    csv_desc: "Pour tout logiciel de comptabilité",
    pdf_desc: "Pour les fiduciaires, avec filigrane",
    google_desc: "Directement dans Google Sheets (OAuth requis)",
  },
  it: {
    title: "Esportazioni",
    subtitle: "Esporta le tue ricevute per la contabilità",
    choose_format: "Scegli formato",
    time_period: "Periodo",
    from: "Da",
    to: "A",
    include_km: "Includi forfait chilometrico",
    km_desc: "CHF 0.70/km (standard fiscale svizzero)",
    download: "scaricare",
    exporting: "Esportazione in corso...",
    pdf_note: "I PDF includono la nota «Creato con Spezo – Non verificato»",
    google_sheets_error: "L'esportazione Google Sheets richiede configurazione OAuth. Contattare il supporto.",
    network_error: "Errore di rete. Riprovare.",
    excel_desc: "Ideale per Swiss Excel, una pagina per mese",
    csv_desc: "Per qualsiasi software di contabilità",
    pdf_desc: "Per fiduciari, con filigrana",
    google_desc: "Direttamente in Google Sheets (OAuth richiesto)",
  },
  rm: {
    title: "Exports",
    subtitle: "Exportar Vossas quittanzas per la contabilitad",
    choose_format: "Tscherner format",
    time_period: "Perioda da temp",
    from: "Da",
    to: "Fin",
    include_km: "Includer la forfait da kilometers",
    km_desc: "CHF 0.70/km (standard fiscal svizzer)",
    download: "telechargiar",
    exporting: "Export vegn creà...",
    pdf_note: "PDF-exports cuntegnan la remartga «Creà cun Spezo – Betg verifitgà»",
    google_sheets_error: "L'export Google Sheets dovra configurar OAuth. Contactai il support.",
    network_error: "Errur da rait. Emprovar danovamain.",
    excel_desc: "Ideal per Swiss Excel, ina pagina per mais",
    csv_desc: "Per mintga software da contabilitad",
    pdf_desc: "Per trustees, cun filigrana",
    google_desc: "Directamain en Google Sheets (OAuth necessari)",
  },
  en: {
    title: "Exports",
    subtitle: "Export your receipts for accounting",
    choose_format: "Choose format",
    time_period: "Time period",
    from: "From",
    to: "To",
    include_km: "Include mileage allowance",
    km_desc: "CHF 0.70/km (Swiss tax standard)",
    download: "download",
    exporting: "Creating export...",
    pdf_note: "PDF exports include the note «Created with Spezo – Not verified»",
    google_sheets_error: "Google Sheets export requires OAuth setup. Contact support.",
    network_error: "Network error. Please try again.",
    excel_desc: "Ideal for Swiss Excel, one page per month",
    csv_desc: "For any accounting software",
    pdf_desc: "For accountants, with watermark",
    google_desc: "Directly in Google Sheets (OAuth required)",
  },
  tr: {
    title: "Dışa Aktarma",
    subtitle: "Muhasebe için makbuzlarınızı dışa aktarın",
    choose_format: "Format seçin",
    time_period: "Zaman aralığı",
    from: "Başlangıç",
    to: "Bitiş",
    include_km: "Kilometre ödeneği dahil et",
    km_desc: "CHF 0.70/km (İsviçre vergi standardı)",
    download: "indir",
    exporting: "Dışa aktarılıyor...",
    pdf_note: "PDF dışa aktarmaları «Spezo ile oluşturuldu – Doğrulanmamış» notunu içerir",
    google_sheets_error: "Google Sheets dışa aktarma için OAuth kurulumu gereklidir. Destek ile iletişime geçin.",
    network_error: "Ağ hatası. Lütfen tekrar deneyin.",
    excel_desc: "Swiss Excel için ideal, aylık bir sayfa",
    csv_desc: "Her muhasebe yazılımı için",
    pdf_desc: "Muhasebeciler için, filigran ile",
    google_desc: "Doğrudan Google Sheets'e (OAuth gerekli)",
  },
  sq: {
    title: "Eksportet",
    subtitle: "Eksportoni faturat tuaja për kontabilitet",
    choose_format: "Zgjidhni formatin",
    time_period: "Periudha kohore",
    from: "Nga",
    to: "Deri",
    include_km: "Përfshi shtesën kilometrike",
    km_desc: "CHF 0.70/km (standard tatimor zviceran)",
    download: "shkarko",
    exporting: "Duke krijuar eksportin...",
    pdf_note: "Eksportet PDF përfshijnë shënimin «Krijuar me Spezo – I paverifikuar»",
    google_sheets_error: "Eksporti Google Sheets kërkon konfigurimin OAuth. Kontaktoni mbështetjen.",
    network_error: "Gabim rrjeti. Ju lutemi provoni përsëri.",
    excel_desc: "Ideal për Swiss Excel, një faqe për muaj",
    csv_desc: "Për çdo softuer kontabiliteti",
    pdf_desc: "Për kontabilistë, me filigran",
    google_desc: "Drejtpërdrejt në Google Sheets (OAuth i nevojshëm)",
  },
} satisfies Record<SupportedLanguage, Record<string, string>>;

export default function ExportsPage() {
  const { lang } = useLanguage();
  const t = T[lang] ?? T.de;

  const FORMATS: { value: ExportFormat; label: string; description: string; icon: string }[] = [
    { value: "EXCEL", label: "Excel (.xlsx)", description: t.excel_desc, icon: "📊" },
    { value: "CSV", label: "CSV (Semikolon)", description: t.csv_desc, icon: "📋" },
    { value: "PDF", label: "PDF-Bericht", description: t.pdf_desc, icon: "📄" },
    { value: "GOOGLE_SHEETS", label: "Google Sheets", description: t.google_desc, icon: "🌐" },
  ];

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
      setError(t.google_sheets_error);
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
      setError(t.network_error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <p className="text-gray-500 mt-1">{t.subtitle}</p>
      </div>

      {/* Format selection */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-3">{t.choose_format}</h2>
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
          <CardTitle className="text-base">{t.time_period}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label>{t.from}</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>{t.to}</Label>
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
              <span className="font-medium text-sm">{t.include_km}</span>
              <p className="text-xs text-gray-500">{t.km_desc}</p>
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
        {loading ? t.exporting : `${FORMATS.find((f) => f.value === format)?.icon} ${FORMATS.find((f) => f.value === format)?.label} ${t.download}`}
      </Button>

      <p className="text-center text-xs text-gray-400 mt-3">
        {t.pdf_note}
      </p>
    </div>
  );
}
