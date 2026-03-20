"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@spezo/ui";
import { Input } from "@spezo/ui";
import { Badge } from "@spezo/ui";
import { ConfidenceBadge } from "@spezo/ui";
import type { Expense } from "@spezo/types";
import { useLanguage } from "@/contexts/language-context";
import type { SupportedLanguage } from "@spezo/i18n";

const T = {
  de: {
    title: "Belege",
    found: "Belege gefunden",
    add: "+ Beleg erfassen",
    search: "Suchen...",
    all_categories: "Alle Kategorien",
    only_review: "Nur zu prüfen",
    loading: "Lädt...",
    no_receipts: "Keine Belege gefunden.",
    add_first: "Ersten Beleg erfassen",
    th_date: "Datum",
    th_merchant: "Händler",
    th_category: "Kategorie",
    th_amount: "Betrag",
    th_vat: "MwSt",
    th_ocr: "OCR",
    th_status: "Status",
    page_of: "von",
    page: "Seite",
    prev: "Zurück",
    next: "Weiter",
    review: "Prüfen",
    cat_restaurant: "Essen & Getränke",
    cat_tankstelle: "Benzin",
    cat_buero: "Büro",
    cat_telefon: "Telefon",
    cat_transport: "Transport",
    cat_unterkunft: "Unterkunft",
    cat_versicherung: "Versicherung",
    cat_weiterbildung: "Weiterbildung",
    cat_diverses: "Diverses",
  },
  fr: {
    title: "Reçus",
    found: "reçus trouvés",
    add: "+ Saisir reçu",
    search: "Rechercher...",
    all_categories: "Toutes catégories",
    only_review: "Seulement à vérifier",
    loading: "Chargement...",
    no_receipts: "Aucun reçu trouvé.",
    add_first: "Saisir le premier reçu",
    th_date: "Date",
    th_merchant: "Marchand",
    th_category: "Catégorie",
    th_amount: "Montant",
    th_vat: "TVA",
    th_ocr: "OCR",
    th_status: "Statut",
    page_of: "sur",
    page: "Page",
    prev: "Précédent",
    next: "Suivant",
    review: "À vérifier",
    cat_restaurant: "Alimentation",
    cat_tankstelle: "Carburant",
    cat_buero: "Bureau",
    cat_telefon: "Téléphone",
    cat_transport: "Transport",
    cat_unterkunft: "Hébergement",
    cat_versicherung: "Assurance",
    cat_weiterbildung: "Formation",
    cat_diverses: "Divers",
  },
  it: {
    title: "Ricevute",
    found: "ricevute trovate",
    add: "+ Aggiungi ricevuta",
    search: "Cerca...",
    all_categories: "Tutte le categorie",
    only_review: "Solo da verificare",
    loading: "Caricamento...",
    no_receipts: "Nessuna ricevuta trovata.",
    add_first: "Aggiungi prima ricevuta",
    th_date: "Data",
    th_merchant: "Commerciante",
    th_category: "Categoria",
    th_amount: "Importo",
    th_vat: "IVA",
    th_ocr: "OCR",
    th_status: "Stato",
    page_of: "di",
    page: "Pagina",
    prev: "Precedente",
    next: "Successivo",
    review: "Da verificare",
    cat_restaurant: "Alimentazione",
    cat_tankstelle: "Carburante",
    cat_buero: "Ufficio",
    cat_telefon: "Telefono",
    cat_transport: "Trasporto",
    cat_unterkunft: "Alloggio",
    cat_versicherung: "Assicurazione",
    cat_weiterbildung: "Formazione",
    cat_diverses: "Varie",
  },
  rm: {
    title: "Quittanzas",
    found: "quittanzas chattadas",
    add: "+ Registrar quittanza",
    search: "Tschertgar...",
    all_categories: "Tut las categorias",
    only_review: "Mo da controllar",
    loading: "Chargament...",
    no_receipts: "Naginas quittanzas chattadas.",
    add_first: "Registrar prima quittanza",
    th_date: "Data",
    th_merchant: "Vendider",
    th_category: "Categoria",
    th_amount: "Import",
    th_vat: "IVA",
    th_ocr: "OCR",
    th_status: "Status",
    page_of: "da",
    page: "Pagina",
    prev: "Enavos",
    next: "Vinavant",
    review: "Controllar",
    cat_restaurant: "Mangiar & Baiver",
    cat_tankstelle: "Benzin",
    cat_buero: "Uffizi",
    cat_telefon: "Telefon",
    cat_transport: "Transport",
    cat_unterkunft: "Alloschi",
    cat_versicherung: "Assicuranza",
    cat_weiterbildung: "Furmaziun",
    cat_diverses: "Auters",
  },
  en: {
    title: "Receipts",
    found: "receipts found",
    add: "+ Add receipt",
    search: "Search...",
    all_categories: "All categories",
    only_review: "Only to review",
    loading: "Loading...",
    no_receipts: "No receipts found.",
    add_first: "Add first receipt",
    th_date: "Date",
    th_merchant: "Merchant",
    th_category: "Category",
    th_amount: "Amount",
    th_vat: "VAT",
    th_ocr: "OCR",
    th_status: "Status",
    page_of: "of",
    page: "Page",
    prev: "Previous",
    next: "Next",
    review: "Review",
    cat_restaurant: "Food & Drinks",
    cat_tankstelle: "Fuel",
    cat_buero: "Office",
    cat_telefon: "Phone",
    cat_transport: "Transport",
    cat_unterkunft: "Accommodation",
    cat_versicherung: "Insurance",
    cat_weiterbildung: "Training",
    cat_diverses: "Miscellaneous",
  },
  tr: {
    title: "Makbuzlar",
    found: "makbuz bulundu",
    add: "+ Makbuz ekle",
    search: "Ara...",
    all_categories: "Tüm kategoriler",
    only_review: "Yalnızca incelenecekler",
    loading: "Yükleniyor...",
    no_receipts: "Makbuz bulunamadı.",
    add_first: "İlk makbuzu ekle",
    th_date: "Tarih",
    th_merchant: "Satıcı",
    th_category: "Kategori",
    th_amount: "Tutar",
    th_vat: "KDV",
    th_ocr: "OCR",
    th_status: "Durum",
    page_of: "/",
    page: "Sayfa",
    prev: "Önceki",
    next: "Sonraki",
    review: "İncele",
    cat_restaurant: "Yemek & İçecek",
    cat_tankstelle: "Yakıt",
    cat_buero: "Ofis",
    cat_telefon: "Telefon",
    cat_transport: "Ulaşım",
    cat_unterkunft: "Konaklama",
    cat_versicherung: "Sigorta",
    cat_weiterbildung: "Eğitim",
    cat_diverses: "Çeşitli",
  },
  sq: {
    title: "Faturat",
    found: "fatura gjetur",
    add: "+ Shto faturë",
    search: "Kërko...",
    all_categories: "Të gjitha kategoritë",
    only_review: "Vetëm për rishikim",
    loading: "Duke ngarkuar...",
    no_receipts: "Asnjë faturë gjetur.",
    add_first: "Shto faturën e parë",
    th_date: "Data",
    th_merchant: "Shitësi",
    th_category: "Kategoria",
    th_amount: "Shuma",
    th_vat: "TVSH",
    th_ocr: "OCR",
    th_status: "Statusi",
    page_of: "nga",
    page: "Faqja",
    prev: "Mbrapa",
    next: "Para",
    review: "Rishiko",
    cat_restaurant: "Ushqim & Pije",
    cat_tankstelle: "Karburant",
    cat_buero: "Zyrë",
    cat_telefon: "Telefon",
    cat_transport: "Transport",
    cat_unterkunft: "Akomodim",
    cat_versicherung: "Sigurim",
    cat_weiterbildung: "Trajnim",
    cat_diverses: "Të ndryshme",
  },
} satisfies Record<SupportedLanguage, Record<string, string>>;

const CATEGORY_COLORS: Record<string, string> = {
  RESTAURANT: "bg-orange-100 text-orange-800",
  TANKSTELLE: "bg-blue-100 text-blue-800",
  BUERO: "bg-purple-100 text-purple-800",
  TELEFON: "bg-cyan-100 text-cyan-800",
  TRANSPORT: "bg-indigo-100 text-indigo-800",
  UNTERKUNFT: "bg-pink-100 text-pink-800",
  VERSICHERUNG: "bg-green-100 text-green-800",
  WEITERBILDUNG: "bg-yellow-100 text-yellow-800",
  DIVERSES: "bg-gray-100 text-gray-800",
};

export default function ExpensesPage() {
  const { lang } = useLanguage();
  const t = T[lang] ?? T.de;

  const CATEGORY_LABELS: Record<string, string> = {
    RESTAURANT: t.cat_restaurant,
    TANKSTELLE: t.cat_tankstelle,
    BUERO: t.cat_buero,
    TELEFON: t.cat_telefon,
    TRANSPORT: t.cat_transport,
    UNTERKUNFT: t.cat_unterkunft,
    VERSICHERUNG: t.cat_versicherung,
    WEITERBILDUNG: t.cat_weiterbildung,
    DIVERSES: t.cat_diverses,
  };

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [needsReview, setNeedsReview] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: "20",
      ...(search ? { search } : {}),
      ...(category ? { category } : {}),
      ...(needsReview ? { needsReview: "true" } : {}),
      ...(dateFrom ? { dateFrom: new Date(dateFrom).toISOString() } : {}),
      ...(dateTo ? { dateTo: new Date(dateTo).toISOString() } : {}),
    });

    const res = await fetch(`/api/expenses?${params.toString()}`);
    const data = await res.json() as { data: Expense[]; total: number; totalPages: number };

    setExpenses(data.data ?? []);
    setTotal(data.total ?? 0);
    setTotalPages(data.totalPages ?? 1);
    setLoading(false);
  }, [page, search, category, needsReview, dateFrom, dateTo]);

  useEffect(() => {
    void fetchExpenses();
  }, [fetchExpenses]);

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} {t.found}</p>
        </div>
        <Link href="/upload">
          <Button>{t.add}</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <Input
          placeholder={t.search}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="col-span-1 md:col-span-1"
        />

        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">{t.all_categories}</option>
          {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>

        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          placeholder="Von"
        />

        <Input
          type="date"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
          placeholder="Bis"
        />

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={needsReview}
            onChange={(e) => { setNeedsReview(e.target.checked); setPage(1); }}
            className="h-4 w-4 rounded"
          />
          <span className="text-sm text-gray-600">{t.only_review}</span>
        </label>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400">{t.loading}</div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-3">{t.no_receipts}</p>
            <Link href="/upload">
              <Button variant="outline">{t.add_first}</Button>
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">{t.th_date}</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">{t.th_merchant}</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">{t.th_category}</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">{t.th_amount}</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">{t.th_vat}</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">{t.th_ocr}</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">{t.th_status}</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr
                  key={expense.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    expense.needsReview ? "bg-yellow-50/50" : ""
                  }`}
                  onClick={() => window.location.href = `/expenses/${expense.id}`}
                >
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {format(new Date(expense.date), "dd.MM.yyyy")}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {expense.merchantName ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex text-xs px-2 py-0.5 rounded-full font-medium ${
                      CATEGORY_COLORS[expense.category] ?? "bg-gray-100 text-gray-800"
                    }`}>
                      {CATEGORY_LABELS[expense.category] ?? expense.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-right">
                    CHF {expense.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-500">
                    {expense.vatAmount != null ? `CHF ${expense.vatAmount.toFixed(2)}` : "-"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {expense.ocrConfidence != null && (
                      <ConfidenceBadge confidence={expense.ocrConfidence} showLabel={false} />
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {expense.needsReview ? (
                      <Badge variant="warning">{t.review}</Badge>
                    ) : (
                      <Badge variant="success">OK</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            {t.page} {page} {t.page_of} {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              {t.prev}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              {t.next}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
