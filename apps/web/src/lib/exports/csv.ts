import { format } from "date-fns";
import type { Expense } from "@spezo/db/client";

const CATEGORY_LABELS: Record<string, string> = {
  RESTAURANT: "Essen & Getränke",
  TANKSTELLE: "Benzin / Transport",
  BUERO: "Büromaterial",
  TELEFON: "Telefon / Internet",
  TRANSPORT: "Transport / Reise",
  UNTERKUNFT: "Unterkunft",
  VERSICHERUNG: "Versicherung",
  WEITERBILDUNG: "Weiterbildung",
  DIVERSES: "Diverses",
};

/**
 * Generate a CSV export using semicolons (Swiss Excel standard).
 * Includes BOM for correct encoding in Windows Excel.
 */
export function generateCsv(expenses: Expense[]): Buffer {
  const SEPARATOR = ";";
  const NEWLINE = "\r\n";

  const headers = [
    "Datum",
    "Händler",
    "Kategorie",
    "Betrag CHF",
    "MwSt-Satz %",
    "MwSt CHF",
    "Netto CHF",
    "Zahlungsmittel",
    "Belegart",
    "Notizen",
    "Beleg-Link",
  ];

  const rows = expenses.map((expense) => [
    format(new Date(expense.date), "dd.MM.yyyy"),
    csvEscape(expense.merchantName ?? ""),
    csvEscape(CATEGORY_LABELS[expense.category] ?? expense.category),
    swissNumber(expense.amount),
    swissNumber(expense.vatRate ?? 0),
    swissNumber(expense.vatAmount ?? 0),
    swissNumber(expense.subtotal ?? 0),
    expense.paymentMethod,
    expense.receiptType,
    csvEscape(expense.notes ?? ""),
    csvEscape(expense.receiptImageUrl ?? ""),
  ]);

  const lines = [
    headers.join(SEPARATOR),
    ...rows.map((row) => row.join(SEPARATOR)),
  ];

  // BOM + content
  const content = "\uFEFF" + lines.join(NEWLINE);
  return Buffer.from(content, "utf-8");
}

function csvEscape(value: string): string {
  if (value.includes(";") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// Swiss number format: 1234.56 (dot as decimal, no thousands separator in CSV)
function swissNumber(n: number): string {
  return n.toFixed(2);
}
