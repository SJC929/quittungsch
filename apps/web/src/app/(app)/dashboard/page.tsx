import { prisma } from "@spezo/db/client";
import { getSession } from "@/lib/auth";
import { format, startOfMonth, endOfMonth } from "date-fns";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@spezo/ui";
import { Badge } from "@spezo/ui";
import { ConfidenceBadge } from "@spezo/ui";
import { cookies } from "next/headers";
import type { SupportedLanguage } from "@spezo/i18n";

export const metadata = { title: "Dashboard" };

const T = {
  de: {
    dashboard: "Dashboard",
    expenses_month: "Ausgaben (Monat)",
    receipts: "Belege",
    vat_month: "MwSt (Monat)",
    refundable: "rückforderbar",
    receipts_total: "Belege total",
    since_start: "seit Beginn",
    to_review: "Zu prüfen",
    review_now: "Jetzt prüfen →",
    by_category: "Nach Kategorie (Monat)",
    no_expenses: "Noch keine Ausgaben diesen Monat.",
    recent_receipts: "Letzte Belege",
    no_receipts: "Noch keine Belege vorhanden.",
    first_receipt: "Ersten Beleg erfassen →",
    unknown: "Unbekannt",
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
    dashboard: "Tableau de bord",
    expenses_month: "Dépenses (mois)",
    receipts: "Reçus",
    vat_month: "TVA (mois)",
    refundable: "remboursable",
    receipts_total: "Reçus total",
    since_start: "depuis le début",
    to_review: "À vérifier",
    review_now: "Vérifier maintenant →",
    by_category: "Par catégorie (mois)",
    no_expenses: "Aucune dépense ce mois-ci.",
    recent_receipts: "Derniers reçus",
    no_receipts: "Aucun reçu disponible.",
    first_receipt: "Saisir le premier reçu →",
    unknown: "Inconnu",
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
    dashboard: "Pannello",
    expenses_month: "Spese (mese)",
    receipts: "Ricevute",
    vat_month: "IVA (mese)",
    refundable: "rimborsabile",
    receipts_total: "Ricevute totale",
    since_start: "dall'inizio",
    to_review: "Da verificare",
    review_now: "Verifica ora →",
    by_category: "Per categoria (mese)",
    no_expenses: "Nessuna spesa questo mese.",
    recent_receipts: "Ultime ricevute",
    no_receipts: "Nessuna ricevuta disponibile.",
    first_receipt: "Aggiungi prima ricevuta →",
    unknown: "Sconosciuto",
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
    dashboard: "Dashboard",
    expenses_month: "Expensas (mais)",
    receipts: "Quittanzas",
    vat_month: "IVA (mais)",
    refundable: "retribuibel",
    receipts_total: "Quittanzas total",
    since_start: "dapi il cumenzament",
    to_review: "Da controllar",
    review_now: "Controllar uss →",
    by_category: "Tenor categoria (mais)",
    no_expenses: "Anc naginas expensas quest mais.",
    recent_receipts: "Ultimas quittanzas",
    no_receipts: "Anc naginas quittanzas.",
    first_receipt: "Registrar prima quittanza →",
    unknown: "Nunenconuschent",
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
    dashboard: "Dashboard",
    expenses_month: "Expenses (month)",
    receipts: "Receipts",
    vat_month: "VAT (month)",
    refundable: "refundable",
    receipts_total: "Total receipts",
    since_start: "since start",
    to_review: "To review",
    review_now: "Review now →",
    by_category: "By category (month)",
    no_expenses: "No expenses this month.",
    recent_receipts: "Recent receipts",
    no_receipts: "No receipts yet.",
    first_receipt: "Add first receipt →",
    unknown: "Unknown",
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
    dashboard: "Gösterge Paneli",
    expenses_month: "Harcamalar (ay)",
    receipts: "Makbuzlar",
    vat_month: "KDV (ay)",
    refundable: "iade edilebilir",
    receipts_total: "Toplam makbuz",
    since_start: "başlangıçtan beri",
    to_review: "İncelenecek",
    review_now: "Şimdi incele →",
    by_category: "Kategoriye göre (ay)",
    no_expenses: "Bu ay henüz harcama yok.",
    recent_receipts: "Son makbuzlar",
    no_receipts: "Henüz makbuz yok.",
    first_receipt: "İlk makbuzu ekle →",
    unknown: "Bilinmiyor",
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
    dashboard: "Paneli",
    expenses_month: "Shpenzimet (muaj)",
    receipts: "Faturat",
    vat_month: "TVSH (muaj)",
    refundable: "i rimbursueshëm",
    receipts_total: "Faturat totale",
    since_start: "që nga fillimi",
    to_review: "Për t'u rishikuar",
    review_now: "Rishiko tani →",
    by_category: "Sipas kategorisë (muaj)",
    no_expenses: "Asnjë shpenzim këtë muaj.",
    recent_receipts: "Faturat e fundit",
    no_receipts: "Asnjë faturë ende.",
    first_receipt: "Shto faturën e parë →",
    unknown: "I panjohur",
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

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user) return null;

  const lang = (cookies().get("spezo_lang")?.value ?? "de") as SupportedLanguage;
  const t = T[lang] ?? T.de;

  const tenantId = session.user.tenantId;
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // Fetch stats in parallel
  const [monthlyExpenses, totalExpenses, needsReviewCount, recentExpenses] =
    await Promise.all([
      prisma.expense.findMany({
        where: { tenantId, date: { gte: monthStart, lte: monthEnd } },
        select: { amount: true, vatAmount: true, category: true },
      }),
      prisma.expense.count({ where: { tenantId } }),
      prisma.expense.count({ where: { tenantId, needsReview: true } }),
      prisma.expense.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const monthlyTotal = monthlyExpenses.reduce((s, e) => s + e.amount, 0);
  const monthlyVat = monthlyExpenses.reduce((s, e) => s + (e.vatAmount ?? 0), 0);

  // Category breakdown
  const byCat: Record<string, number> = {};
  for (const e of monthlyExpenses) {
    byCat[e.category] = (byCat[e.category] ?? 0) + e.amount;
  }

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

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t.dashboard}</h1>
        <p className="text-gray-500 mt-1">{format(now, "MMMM yyyy")}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {t.expenses_month}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              CHF {monthlyTotal.toFixed(2)}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {monthlyExpenses.length} {t.receipts}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {t.vat_month}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              CHF {monthlyVat.toFixed(2)}
            </div>
            <p className="text-xs text-gray-400 mt-1">{t.refundable}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {t.receipts_total}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExpenses}</div>
            <p className="text-xs text-gray-400 mt-1">{t.since_start}</p>
          </CardContent>
        </Card>

        <Card className={needsReviewCount > 0 ? "border-yellow-300" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {t.to_review}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {needsReviewCount}
            </div>
            {needsReviewCount > 0 && (
              <Link
                href="/expenses?needsReview=true"
                className="text-xs text-yellow-600 hover:underline mt-1 block"
              >
                {t.review_now}
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.by_category}</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(byCat).length === 0 ? (
              <p className="text-gray-400 text-sm">{t.no_expenses}</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(byCat)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, amount]) => {
                    const pct = ((amount / monthlyTotal) * 100).toFixed(0);
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{CATEGORY_LABELS[cat] ?? cat}</span>
                          <span className="font-medium">CHF {amount.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-emerald-600 h-2 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.recent_receipts}</CardTitle>
          </CardHeader>
          <CardContent>
            {recentExpenses.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-400 text-sm mb-3">{t.no_receipts}</p>
                <Link
                  href="/upload"
                  className="text-emerald-700 hover:underline text-sm font-medium"
                >
                  {t.first_receipt}
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {expense.merchantName ?? t.unknown}
                        </p>
                        {expense.needsReview && (
                          <Badge variant="warning">{t.to_review}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        {format(new Date(expense.date), "dd.MM.yyyy")}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-semibold">
                        CHF {expense.amount.toFixed(2)}
                      </p>
                      {expense.ocrConfidence !== null && expense.ocrConfidence !== undefined && (
                        <ConfidenceBadge
                          confidence={expense.ocrConfidence}
                          showLabel={false}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
