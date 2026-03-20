"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@spezo/ui";
import { Input } from "@spezo/ui";
import { Label } from "@spezo/ui";
import { Card, CardContent } from "@spezo/ui";
import { ConfidenceBadge } from "@spezo/ui";
import type { ExtractedExpense } from "@spezo/types";
import { useLanguage } from "@/contexts/language-context";
import type { SupportedLanguage } from "@spezo/i18n";

const T = {
  de: {
    title: "Beleg erfassen",
    drag_drop: "Bild oder PDF hierher ziehen",
    or_click: "oder klicken zum Auswählen",
    file_hint: "JPG, PNG, PDF bis 10 MB",
    saved: "Beleg gespeichert!",
    redirecting: "Weiterleitung zu den Belegen...",
    analyzing: "Beleg wird analysiert...",
    ocr_confidence: "OCR-Konfidenz",
    uncertain_fields: "Unsichere Felder:",
    merchant: "Händler",
    date: "Datum",
    amount: "Betrag CHF *",
    vat_rate: "MwSt-Satz %",
    no_vat: "Kein MwSt",
    category: "Kategorie",
    receipt_type: "Belegart",
    payment_method: "Zahlungsmittel",
    notes: "Notizen",
    notes_placeholder: "Optionale Notizen...",
    cancel: "Abbrechen",
    save: "Speichern",
    saving: "Wird gespeichert...",
    ocr_failed: "OCR fehlgeschlagen",
    upload_failed: "Upload fehlgeschlagen. Bitte versuchen Sie es erneut.",
    save_failed: "Speichern fehlgeschlagen.",
    cash: "Bar",
    card: "Karte",
    bank: "Banküberweisung",
    unknown_payment: "Unbekannt",
    kassenbon: "Kassenbon",
    rechnung: "Rechnung",
    tankbeleg: "Tankbeleg",
    qr_rechnung: "QR-Rechnung",
    sonstige: "Sonstige",
    cat_restaurant: "Essen & Getränke",
    cat_tankstelle: "Benzin / Transport",
    cat_buero: "Büromaterial",
    cat_telefon: "Telefon / Internet",
    cat_transport: "Transport / Reise",
    cat_unterkunft: "Unterkunft",
    cat_versicherung: "Versicherung",
    cat_weiterbildung: "Weiterbildung",
    cat_diverses: "Diverses",
  },
  fr: {
    title: "Saisir reçu",
    drag_drop: "Glissez une image ou PDF ici",
    or_click: "ou cliquez pour sélectionner",
    file_hint: "JPG, PNG, PDF jusqu'à 10 Mo",
    saved: "Reçu enregistré !",
    redirecting: "Redirection vers les reçus...",
    analyzing: "Analyse du reçu...",
    ocr_confidence: "Confiance OCR",
    uncertain_fields: "Champs incertains :",
    merchant: "Marchand",
    date: "Date",
    amount: "Montant CHF *",
    vat_rate: "Taux TVA %",
    no_vat: "Pas de TVA",
    category: "Catégorie",
    receipt_type: "Type de reçu",
    payment_method: "Moyen de paiement",
    notes: "Notes",
    notes_placeholder: "Notes optionnelles...",
    cancel: "Annuler",
    save: "Enregistrer",
    saving: "Enregistrement...",
    ocr_failed: "Échec OCR",
    upload_failed: "Échec du téléchargement. Veuillez réessayer.",
    save_failed: "Échec de l'enregistrement.",
    cash: "Espèces",
    card: "Carte",
    bank: "Virement bancaire",
    unknown_payment: "Inconnu",
    kassenbon: "Ticket de caisse",
    rechnung: "Facture",
    tankbeleg: "Reçu carburant",
    qr_rechnung: "Facture QR",
    sonstige: "Autres",
    cat_restaurant: "Alimentation",
    cat_tankstelle: "Carburant / Transport",
    cat_buero: "Fournitures bureau",
    cat_telefon: "Téléphone / Internet",
    cat_transport: "Transport / Voyage",
    cat_unterkunft: "Hébergement",
    cat_versicherung: "Assurance",
    cat_weiterbildung: "Formation",
    cat_diverses: "Divers",
  },
  it: {
    title: "Aggiungi ricevuta",
    drag_drop: "Trascina immagine o PDF qui",
    or_click: "o clicca per selezionare",
    file_hint: "JPG, PNG, PDF fino a 10 MB",
    saved: "Ricevuta salvata!",
    redirecting: "Reindirizzamento alle ricevute...",
    analyzing: "Analisi della ricevuta...",
    ocr_confidence: "Affidabilità OCR",
    uncertain_fields: "Campi incerti:",
    merchant: "Commerciante",
    date: "Data",
    amount: "Importo CHF *",
    vat_rate: "Aliquota IVA %",
    no_vat: "Nessuna IVA",
    category: "Categoria",
    receipt_type: "Tipo ricevuta",
    payment_method: "Metodo di pagamento",
    notes: "Note",
    notes_placeholder: "Note opzionali...",
    cancel: "Annulla",
    save: "Salva",
    saving: "Salvataggio...",
    ocr_failed: "OCR fallito",
    upload_failed: "Caricamento fallito. Riprovare.",
    save_failed: "Salvataggio fallito.",
    cash: "Contanti",
    card: "Carta",
    bank: "Bonifico bancario",
    unknown_payment: "Sconosciuto",
    kassenbon: "Scontrino",
    rechnung: "Fattura",
    tankbeleg: "Ricevuta carburante",
    qr_rechnung: "Fattura QR",
    sonstige: "Altro",
    cat_restaurant: "Alimentazione",
    cat_tankstelle: "Carburante / Trasporto",
    cat_buero: "Materiale ufficio",
    cat_telefon: "Telefono / Internet",
    cat_transport: "Trasporto / Viaggio",
    cat_unterkunft: "Alloggio",
    cat_versicherung: "Assicurazione",
    cat_weiterbildung: "Formazione",
    cat_diverses: "Varie",
  },
  rm: {
    title: "Registrar quittanza",
    drag_drop: "Trar ina imagem u PDF qua",
    or_click: "u cliccar per selecziunar",
    file_hint: "JPG, PNG, PDF fin 10 MB",
    saved: "Quittanza memorisada!",
    redirecting: "Redirecziun a las quittanzas...",
    analyzing: "Quittanza vegn analisada...",
    ocr_confidence: "Confidenza OCR",
    uncertain_fields: "Champs incerts:",
    merchant: "Vendider",
    date: "Data",
    amount: "Import CHF *",
    vat_rate: "Taux IVA %",
    no_vat: "Nagina IVA",
    category: "Categoria",
    receipt_type: "Tip da quittanza",
    payment_method: "Medi da pajament",
    notes: "Notas",
    notes_placeholder: "Notas opziunalas...",
    cancel: "Interrumper",
    save: "Memorisar",
    saving: "Vegn memorisà...",
    ocr_failed: "OCR ha fallì",
    upload_failed: "Upload ha fallì. Emprovar danovamain.",
    save_failed: "Memorisar ha fallì.",
    cash: "Cuntant",
    card: "Carta",
    bank: "Transfer bancari",
    unknown_payment: "Nunenconuschent",
    kassenbon: "Quittanza da cassa",
    rechnung: "Quint",
    tankbeleg: "Quittanza da benzin",
    qr_rechnung: "Quint QR",
    sonstige: "Auters",
    cat_restaurant: "Mangiar & Baiver",
    cat_tankstelle: "Benzin / Transport",
    cat_buero: "Material d'uffizi",
    cat_telefon: "Telefon / Internet",
    cat_transport: "Transport / Viadi",
    cat_unterkunft: "Alloschi",
    cat_versicherung: "Assicuranza",
    cat_weiterbildung: "Furmaziun",
    cat_diverses: "Auters",
  },
  en: {
    title: "Add receipt",
    drag_drop: "Drag image or PDF here",
    or_click: "or click to select",
    file_hint: "JPG, PNG, PDF up to 10 MB",
    saved: "Receipt saved!",
    redirecting: "Redirecting to receipts...",
    analyzing: "Analyzing receipt...",
    ocr_confidence: "OCR Confidence",
    uncertain_fields: "Uncertain fields:",
    merchant: "Merchant",
    date: "Date",
    amount: "Amount CHF *",
    vat_rate: "VAT Rate %",
    no_vat: "No VAT",
    category: "Category",
    receipt_type: "Receipt type",
    payment_method: "Payment method",
    notes: "Notes",
    notes_placeholder: "Optional notes...",
    cancel: "Cancel",
    save: "Save",
    saving: "Saving...",
    ocr_failed: "OCR failed",
    upload_failed: "Upload failed. Please try again.",
    save_failed: "Save failed.",
    cash: "Cash",
    card: "Card",
    bank: "Bank transfer",
    unknown_payment: "Unknown",
    kassenbon: "Receipt",
    rechnung: "Invoice",
    tankbeleg: "Fuel receipt",
    qr_rechnung: "QR Invoice",
    sonstige: "Other",
    cat_restaurant: "Food & Drinks",
    cat_tankstelle: "Fuel / Transport",
    cat_buero: "Office supplies",
    cat_telefon: "Phone / Internet",
    cat_transport: "Transport / Travel",
    cat_unterkunft: "Accommodation",
    cat_versicherung: "Insurance",
    cat_weiterbildung: "Training",
    cat_diverses: "Miscellaneous",
  },
  tr: {
    title: "Makbuz ekle",
    drag_drop: "Resim veya PDF'i buraya sürükleyin",
    or_click: "veya seçmek için tıklayın",
    file_hint: "JPG, PNG, PDF 10 MB'a kadar",
    saved: "Makbuz kaydedildi!",
    redirecting: "Makbuzlara yönlendiriliyor...",
    analyzing: "Makbuz analiz ediliyor...",
    ocr_confidence: "OCR Güveni",
    uncertain_fields: "Belirsiz alanlar:",
    merchant: "Satıcı",
    date: "Tarih",
    amount: "Tutar CHF *",
    vat_rate: "KDV Oranı %",
    no_vat: "KDV yok",
    category: "Kategori",
    receipt_type: "Makbuz türü",
    payment_method: "Ödeme yöntemi",
    notes: "Notlar",
    notes_placeholder: "İsteğe bağlı notlar...",
    cancel: "İptal",
    save: "Kaydet",
    saving: "Kaydediliyor...",
    ocr_failed: "OCR başarısız",
    upload_failed: "Yükleme başarısız. Lütfen tekrar deneyin.",
    save_failed: "Kaydetme başarısız.",
    cash: "Nakit",
    card: "Kart",
    bank: "Banka havalesi",
    unknown_payment: "Bilinmiyor",
    kassenbon: "Fiş",
    rechnung: "Fatura",
    tankbeleg: "Yakıt fişi",
    qr_rechnung: "QR Fatura",
    sonstige: "Diğer",
    cat_restaurant: "Yemek & İçecek",
    cat_tankstelle: "Yakıt / Ulaşım",
    cat_buero: "Ofis malzemeleri",
    cat_telefon: "Telefon / İnternet",
    cat_transport: "Ulaşım / Seyahat",
    cat_unterkunft: "Konaklama",
    cat_versicherung: "Sigorta",
    cat_weiterbildung: "Eğitim",
    cat_diverses: "Çeşitli",
  },
  sq: {
    title: "Shto faturë",
    drag_drop: "Tërhiq imazh ose PDF këtu",
    or_click: "ose klikoni për të zgjedhur",
    file_hint: "JPG, PNG, PDF deri në 10 MB",
    saved: "Fatura u ruajt!",
    redirecting: "Duke ridrejtuar te faturat...",
    analyzing: "Duke analizuar faturën...",
    ocr_confidence: "Besimi OCR",
    uncertain_fields: "Fushat e pasigurta:",
    merchant: "Shitësi",
    date: "Data",
    amount: "Shuma CHF *",
    vat_rate: "Norma TVSH %",
    no_vat: "Pa TVSH",
    category: "Kategoria",
    receipt_type: "Lloji i faturës",
    payment_method: "Metoda e pagesës",
    notes: "Shënime",
    notes_placeholder: "Shënime opsionale...",
    cancel: "Anulo",
    save: "Ruaj",
    saving: "Duke ruajtur...",
    ocr_failed: "OCR dështoi",
    upload_failed: "Ngarkimi dështoi. Ju lutemi provoni përsëri.",
    save_failed: "Ruajtja dështoi.",
    cash: "Para në dorë",
    card: "Kartë",
    bank: "Transfer bankar",
    unknown_payment: "I panjohur",
    kassenbon: "Faturë kasë",
    rechnung: "Faturë",
    tankbeleg: "Faturë karburanti",
    qr_rechnung: "Faturë QR",
    sonstige: "Të tjera",
    cat_restaurant: "Ushqim & Pije",
    cat_tankstelle: "Karburant / Transport",
    cat_buero: "Materiale zyre",
    cat_telefon: "Telefon / Internet",
    cat_transport: "Transport / Udhëtim",
    cat_unterkunft: "Akomodim",
    cat_versicherung: "Sigurim",
    cat_weiterbildung: "Trajnim",
    cat_diverses: "Të ndryshme",
  },
} satisfies Record<SupportedLanguage, Record<string, string>>;

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

export default function UploadPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const t = T[lang] ?? T.de;

  const CATEGORIES = [
    { value: "RESTAURANT", label: t.cat_restaurant },
    { value: "TANKSTELLE", label: t.cat_tankstelle },
    { value: "BUERO", label: t.cat_buero },
    { value: "TELEFON", label: t.cat_telefon },
    { value: "TRANSPORT", label: t.cat_transport },
    { value: "UNTERKUNFT", label: t.cat_unterkunft },
    { value: "VERSICHERUNG", label: t.cat_versicherung },
    { value: "WEITERBILDUNG", label: t.cat_weiterbildung },
    { value: "DIVERSES", label: t.cat_diverses },
  ];

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
        setError(data.error ?? t.ocr_failed);
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
      setError(t.upload_failed);
      setState("idle");
    }
  }, [t]);

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
      setError(t.save_failed);
      setState("reviewing");
    }
    setIsSaving(false);
  };

  if (state === "done") {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-semibold">{t.saved}</h2>
          <p className="text-gray-500 mt-1">{t.redirecting}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">{t.title}</h1>

      {state === "idle" && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-emerald-500 transition-colors cursor-pointer"
          onClick={() => document.getElementById("file-input")?.click()}
        >
          <div className="text-5xl mb-4">📄</div>
          <h3 className="text-lg font-medium mb-2">{t.drag_drop}</h3>
          <p className="text-gray-400 text-sm mb-4">{t.or_click}</p>
          <p className="text-xs text-gray-400">{t.file_hint}</p>
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
          <p className="text-gray-400 text-sm mt-1">{t.analyzing}</p>
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
                  <span className="text-sm text-gray-600">{t.ocr_confidence}</span>
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
                    {t.uncertain_fields} {extracted.missingFields.join(", ")}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t.merchant}</Label>
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
                <Label>{t.date}</Label>
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
                <Label>{t.amount}</Label>
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
                <Label>{t.vat_rate}</Label>
                <select
                  value={form.vatRate}
                  onChange={(e) => setForm({ ...form, vatRate: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                >
                  <option value="">{t.no_vat}</option>
                  <option value="8.1">8.1% (Standard)</option>
                  <option value="3.8">3.8% (Beherbergung)</option>
                  <option value="2.5">2.5% (Reduziert)</option>
                  <option value="0">0% (Befreit)</option>
                </select>
              </div>
            </div>

            <div>
              <Label>{t.category}</Label>
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
                <Label>{t.receipt_type}</Label>
                <select
                  value={form.receiptType}
                  onChange={(e) => setForm({ ...form, receiptType: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                >
                  <option value="KASSENBON">{t.kassenbon}</option>
                  <option value="RECHNUNG">{t.rechnung}</option>
                  <option value="TANKBELEG">{t.tankbeleg}</option>
                  <option value="QR_RECHNUNG">{t.qr_rechnung}</option>
                  <option value="SONSTIGE">{t.sonstige}</option>
                </select>
              </div>
              <div>
                <Label>{t.payment_method}</Label>
                <select
                  value={form.paymentMethod}
                  onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                >
                  <option value="CASH">{t.cash}</option>
                  <option value="CARD">{t.card}</option>
                  <option value="TWINT">TWINT</option>
                  <option value="BANK_TRANSFER">{t.bank}</option>
                  <option value="UNKNOWN">{t.unknown_payment}</option>
                </select>
              </div>
            </div>

            <div>
              <Label>{t.notes}</Label>
              <Input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder={t.notes_placeholder}
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
                {t.cancel}
              </Button>
              <Button
                onClick={() => void handleSave()}
                disabled={!form.amount || isSaving}
                className="flex-1"
              >
                {isSaving ? t.saving : t.save}
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
