"use client";

import { useState } from "react";
import { Button } from "@spezo/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@spezo/ui";
import { Calculator } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

const VAT_RATES = [
  { rate: 8.1, key: "normal" as const },
  { rate: 3.8, key: "special1" as const },
  { rate: 2.5, key: "special2" as const },
];

const QUARTERS_DE = ["Q1 (Jan–Mrz)", "Q2 (Apr–Jun)", "Q3 (Jul–Sep)", "Q4 (Okt–Dez)"];

const T = {
  de: {
    title: "MwSt-Abrechnung ESTV",
    subtitle: "Quartalsweise Mehrwertsteuerberechnung für die Schweiz",
    rates_title: "Schweizer MwSt-Sätze 2024",
    normal: "Normalsatz", normal_desc: "Für die meisten Leistungen",
    special1: "Sondersatz", special1_desc: "Beherbergungsleistungen",
    special2: "Sondersatz", special2_desc: "Lebensmittel, Bücher, Zeitungen, Medikamente",
    calc_title: "Abrechnung erstellen",
    quarter_label: "Quartal",
    year_label: "Jahr",
    revenue_label: "Gesamtumsatz",
    calculate: "Abrechnung berechnen",
    result_title: "Vorschau MwSt-Abrechnung",
    total_revenue: "Total Umsatz (ohne MwSt)",
    vat_normal: "MwSt 8.1% (Normalsatz)",
    vat_special: "MwSt 3.8% (Beherbergung)",
    vat_reduced: "MwSt 2.5% (Sonderrate)",
    vat_due: "Total MwSt schuldig (8.1%)",
    disclaimer: "⚠️ Diese Berechnung ist eine Vorschau. Reichen Sie die offizielle ESTV-Abrechnung unter estv.admin.ch ein.",
  },
  fr: {
    title: "Décompte TVA AFC",
    subtitle: "Calcul trimestriel de la TVA pour la Suisse",
    rates_title: "Taux TVA suisses 2024",
    normal: "Taux normal", normal_desc: "Pour la plupart des prestations",
    special1: "Taux spécial", special1_desc: "Hébergement",
    special2: "Taux spécial", special2_desc: "Aliments, livres, journaux, médicaments",
    calc_title: "Créer un décompte",
    quarter_label: "Trimestre",
    year_label: "Année",
    revenue_label: "Chiffre d'affaires total",
    calculate: "Calculer le décompte",
    result_title: "Aperçu décompte TVA",
    total_revenue: "Total CA (HT)",
    vat_normal: "TVA 8.1% (taux normal)",
    vat_special: "TVA 3.8% (hébergement)",
    vat_reduced: "TVA 2.5% (taux spécial)",
    vat_due: "Total TVA due (8.1%)",
    disclaimer: "⚠️ Ce calcul est un aperçu. Soumettez le décompte officiel sur afc.admin.ch.",
  },
  it: {
    title: "Rendiconto IVA AFC",
    subtitle: "Calcolo trimestrale IVA per la Svizzera",
    rates_title: "Aliquote IVA svizzere 2024",
    normal: "Aliquota normale", normal_desc: "Per la maggior parte delle prestazioni",
    special1: "Aliquota speciale", special1_desc: "Alloggio",
    special2: "Aliquota speciale", special2_desc: "Alimenti, libri, giornali, farmaci",
    calc_title: "Crea rendiconto",
    quarter_label: "Trimestre",
    year_label: "Anno",
    revenue_label: "Fatturato totale",
    calculate: "Calcola rendiconto",
    result_title: "Anteprima rendiconto IVA",
    total_revenue: "Totale fatturato (IVA esclusa)",
    vat_normal: "IVA 8.1% (aliquota normale)",
    vat_special: "IVA 3.8% (alloggio)",
    vat_reduced: "IVA 2.5% (aliquota speciale)",
    vat_due: "Totale IVA dovuta (8.1%)",
    disclaimer: "⚠️ Questo calcolo è un'anteprima. Presentare il rendiconto ufficiale su afc.admin.ch.",
  },
  rm: {
    title: "Decontaziun IVA AFC",
    subtitle: "Calculaziun da l'IVA per trimestral en Svizra",
    rates_title: "Tassas IVA svizzras 2024",
    normal: "Tassa normala", normal_desc: "Per la gronda part da las prestaziuns",
    special1: "Tassa speziala", special1_desc: "Prestaziuns d'alloschi",
    special2: "Tassa speziala", special2_desc: "Victualias, cudeschs, gasedas, medicaments",
    calc_title: "Crear in decontaziun",
    quarter_label: "Quartal",
    year_label: "Onn",
    revenue_label: "Fatschenta totala",
    calculate: "Calculer il decontaziun",
    result_title: "Survista decontaziun IVA",
    total_revenue: "Total fatschenta (senza IVA)",
    vat_normal: "IVA 8.1% (tassa normala)",
    vat_special: "IVA 3.8% (alloschi)",
    vat_reduced: "IVA 2.5% (tassa speziala)",
    vat_due: "Total IVA debitada (8.1%)",
    disclaimer: "⚠️ Quest calcul è ina survista. Tramettai il decontaziun uffizial sin afc.admin.ch.",
  },
  en: {
    title: "VAT Return ESTV",
    subtitle: "Quarterly VAT calculation for Switzerland",
    rates_title: "Swiss VAT Rates 2024",
    normal: "Standard rate", normal_desc: "For most services",
    special1: "Special rate", special1_desc: "Accommodation services",
    special2: "Special rate", special2_desc: "Food, books, newspapers, medicine",
    calc_title: "Create return",
    quarter_label: "Quarter",
    year_label: "Year",
    revenue_label: "Total revenue",
    calculate: "Calculate return",
    result_title: "VAT return preview",
    total_revenue: "Total revenue (excl. VAT)",
    vat_normal: "VAT 8.1% (standard rate)",
    vat_special: "VAT 3.8% (accommodation)",
    vat_reduced: "VAT 2.5% (special rate)",
    vat_due: "Total VAT due (8.1%)",
    disclaimer: "⚠️ This is a preview calculation. Submit the official return at estv.admin.ch.",
  },
  tr: {
    title: "KDV Beyannamesi ESTV",
    subtitle: "İsviçre için üç aylık KDV hesaplama",
    rates_title: "İsviçre KDV Oranları 2024",
    normal: "Normal oran", normal_desc: "Çoğu hizmet için",
    special1: "Özel oran", special1_desc: "Konaklama hizmetleri",
    special2: "Özel oran", special2_desc: "Gıda, kitap, gazete, ilaç",
    calc_title: "Beyanname oluştur",
    quarter_label: "Çeyrek",
    year_label: "Yıl",
    revenue_label: "Toplam ciro",
    calculate: "Hesapla",
    result_title: "KDV beyannamesi önizlemesi",
    total_revenue: "Toplam ciro (KDV hariç)",
    vat_normal: "KDV 8.1% (normal oran)",
    vat_special: "KDV 3.8% (konaklama)",
    vat_reduced: "KDV 2.5% (özel oran)",
    vat_due: "Toplam KDV borcu (8.1%)",
    disclaimer: "⚠️ Bu bir önizleme hesaplamasıdır. Resmi beyannameyi estv.admin.ch'de gönderin.",
  },
  sq: {
    title: "Deklarata e TVSH ESTV",
    subtitle: "Llogaritja tremujore e TVSH për Zvicër",
    rates_title: "Normat e TVSH zvicerane 2024",
    normal: "Norma standarde", normal_desc: "Për shumicën e shërbimeve",
    special1: "Norma speciale", special1_desc: "Shërbime akomodimi",
    special2: "Norma speciale", special2_desc: "Ushqim, libra, gazeta, ilaçe",
    calc_title: "Krijoni deklaratë",
    quarter_label: "Tremujori",
    year_label: "Viti",
    revenue_label: "Qarkullimi total",
    calculate: "Llogarit",
    result_title: "Pamje paraprake e deklaratës TVSH",
    total_revenue: "Qarkullimi total (pa TVSH)",
    vat_normal: "TVSH 8.1% (normë standarde)",
    vat_special: "TVSH 3.8% (akomodim)",
    vat_reduced: "TVSH 2.5% (normë speciale)",
    vat_due: "Totali i TVSH-së e detyruar (8.1%)",
    disclaimer: "⚠️ Ky është një llogaritje paraprake. Dorëzoni deklaratën zyrtare në estv.admin.ch.",
  },
};

const VAT_LABEL_KEYS = [
  { rateKey: "normal" as const, descKey: "normal_desc" as const },
  { rateKey: "special1" as const, descKey: "special1_desc" as const },
  { rateKey: "special2" as const, descKey: "special2_desc" as const },
];

export default function MwstPage() {
  const { lang } = useLanguage();
  const t = T[lang] ?? T.de;

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [quarter, setQuarter] = useState(0);
  const [umsatz, setUmsatz] = useState("");
  const [showResult, setShowResult] = useState(false);

  const umsatzNum = parseFloat(umsatz) || 0;
  const vatNormal = umsatzNum * 0.081;
  const vatSpecial = umsatzNum * 0.038;
  const vatReduced = umsatzNum * 0.025;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
          <Calculator className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-sm text-gray-500">{t.subtitle}</p>
        </div>
      </div>

      <Card className="border-emerald-100">
        <CardHeader>
          <CardTitle className="text-base">{t.rates_title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {VAT_RATES.map((v, i) => (
              <div key={v.rate} className="bg-emerald-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-emerald-700">{v.rate}%</p>
                <p className="text-sm font-medium text-gray-700 mt-1">{t[VAT_LABEL_KEYS[i].rateKey]}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t[VAT_LABEL_KEYS[i].descKey]}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-emerald-100">
        <CardHeader>
          <CardTitle className="text-base">{t.calc_title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">{t.quarter_label}</label>
              <div className="flex gap-2 flex-wrap">
                {QUARTERS_DE.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setQuarter(i)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      quarter === i
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">{t.year_label}</label>
              <div className="flex gap-1">
                <button onClick={() => setYear(y => y - 1)} className="w-8 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium text-sm">‹</button>
                <span className="w-14 h-9 flex items-center justify-center text-sm font-medium text-gray-900">{year}</span>
                <button onClick={() => setYear(y => y + 1)} className="w-8 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium text-sm">›</button>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              {t.revenue_label} {QUARTERS_DE[quarter]} {year} (CHF, ohne MwSt)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">CHF</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={umsatz}
                onChange={(e) => { setUmsatz(e.target.value); setShowResult(false); }}
                placeholder="0.00"
                className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
          </div>

          <Button
            className="w-full bg-emerald-500 hover:bg-emerald-600"
            onClick={() => setShowResult(true)}
            disabled={!umsatz || umsatzNum <= 0}
          >
            {t.calculate}
          </Button>
        </CardContent>
      </Card>

      {showResult && umsatzNum > 0 && (
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-base text-emerald-700">
              {t.result_title} – {QUARTERS_DE[quarter]} {year}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t.total_revenue}</span>
                <span className="font-semibold">CHF {umsatzNum.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t.vat_normal}</span>
                  <span className="font-medium text-orange-600">CHF {vatNormal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t.vat_special}</span>
                  <span className="font-medium text-orange-600">CHF {vatSpecial.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t.vat_reduced}</span>
                  <span className="font-medium text-orange-600">CHF {vatReduced.toFixed(2)}</span>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-bold">
                <span className="text-gray-800">{t.vat_due}</span>
                <span className="text-emerald-700">CHF {vatNormal.toFixed(2)}</span>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs text-amber-700">{t.disclaimer}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
