import { prisma } from "@quittungsch/db/client";
import { getSession } from "@/lib/auth";
import { format, startOfMonth, endOfMonth } from "date-fns";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@quittungsch/ui";
import { Badge } from "@quittungsch/ui";
import { ConfidenceBadge } from "@quittungsch/ui";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user) return null;

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
    RESTAURANT: "Essen & Getränke",
    TANKSTELLE: "Benzin",
    BUERO: "Büro",
    TELEFON: "Telefon",
    TRANSPORT: "Transport",
    UNTERKUNFT: "Unterkunft",
    VERSICHERUNG: "Versicherung",
    WEITERBILDUNG: "Weiterbildung",
    DIVERSES: "Diverses",
  };

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">{format(now, "MMMM yyyy")}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Ausgaben (Monat)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              CHF {monthlyTotal.toFixed(2)}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {monthlyExpenses.length} Belege
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              MwSt (Monat)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              CHF {monthlyVat.toFixed(2)}
            </div>
            <p className="text-xs text-gray-400 mt-1">rückforderbar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Belege total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExpenses}</div>
            <p className="text-xs text-gray-400 mt-1">seit Beginn</p>
          </CardContent>
        </Card>

        <Card className={needsReviewCount > 0 ? "border-yellow-300" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Zu prüfen
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
                Jetzt prüfen →
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nach Kategorie (Monat)</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(byCat).length === 0 ? (
              <p className="text-gray-400 text-sm">Noch keine Ausgaben diesen Monat.</p>
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
                            className="bg-blue-500 h-2 rounded-full"
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
            <CardTitle className="text-base">Letzte Belege</CardTitle>
          </CardHeader>
          <CardContent>
            {recentExpenses.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-400 text-sm mb-3">Noch keine Belege vorhanden.</p>
                <Link
                  href="/upload"
                  className="text-blue-600 hover:underline text-sm font-medium"
                >
                  Ersten Beleg erfassen →
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
                          {expense.merchantName ?? "Unbekannt"}
                        </p>
                        {expense.needsReview && (
                          <Badge variant="warning">Prüfen</Badge>
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
