"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@spezo/ui";
import { Input } from "@spezo/ui";
import { Badge } from "@spezo/ui";
import { ConfidenceBadge } from "@spezo/ui";
import type { Expense } from "@spezo/types";

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
          <h1 className="text-2xl font-bold">Belege</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} Belege gefunden</p>
        </div>
        <Link href="/upload">
          <Button>+ Beleg erfassen</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <Input
          placeholder="Suchen..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="col-span-1 md:col-span-1"
        />

        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Alle Kategorien</option>
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
          <span className="text-sm text-gray-600">Nur zu prüfen</span>
        </label>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Lädt...</div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-3">Keine Belege gefunden.</p>
            <Link href="/upload">
              <Button variant="outline">Ersten Beleg erfassen</Button>
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Datum</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Händler</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Kategorie</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Betrag</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">MwSt</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">OCR</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">Status</th>
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
                      <Badge variant="warning">Prüfen</Badge>
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
            Seite {page} von {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Zurück
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Weiter
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
