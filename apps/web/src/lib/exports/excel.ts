import ExcelJS from "exceljs";
import { format } from "date-fns";
import type { Expense, KilometerLog } from "@spezo/db/client";

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
 * Generate an Excel export with Swiss formatting.
 * One sheet per month + summary sheet.
 */
export async function generateExcel(
  expenses: Expense[],
  kmLogs: KilometerLog[]
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Spezo";
  workbook.created = new Date();

  // Group expenses by month
  const byMonth: Record<string, Expense[]> = {};
  for (const expense of expenses) {
    const key = format(new Date(expense.date), "yyyy-MM");
    byMonth[key] = byMonth[key] ?? [];
    byMonth[key]!.push(expense);
  }

  // Create one sheet per month
  for (const [monthKey, monthExpenses] of Object.entries(byMonth)) {
    const [year, month] = monthKey.split("-");
    const sheetName = format(new Date(`${year}-${month}-01`), "MMMM yyyy");
    const sheet = workbook.addWorksheet(sheetName);

    // Header row
    sheet.columns = [
      { header: "Datum", key: "date", width: 14 },
      { header: "Händler", key: "merchant", width: 25 },
      { header: "Kategorie", key: "category", width: 20 },
      { header: "Betrag CHF", key: "amount", width: 14 },
      { header: "MwSt-Satz %", key: "vatRate", width: 12 },
      { header: "MwSt CHF", key: "vatAmount", width: 12 },
      { header: "Netto CHF", key: "subtotal", width: 12 },
      { header: "Zahlungsmittel", key: "paymentMethod", width: 16 },
      { header: "Notizen", key: "notes", width: 30 },
      { header: "Beleg-Link", key: "receiptUrl", width: 40 },
    ];

    // Style header
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };

    // Data rows
    for (const expense of monthExpenses) {
      sheet.addRow({
        date: format(new Date(expense.date), "dd.MM.yyyy"),
        merchant: expense.merchantName ?? "-",
        category: CATEGORY_LABELS[expense.category] ?? expense.category,
        amount: expense.amount,
        vatRate: expense.vatRate ?? 0,
        vatAmount: expense.vatAmount ?? 0,
        subtotal: expense.subtotal ?? 0,
        paymentMethod: expense.paymentMethod,
        notes: expense.notes ?? "",
        receiptUrl: expense.receiptImageUrl ?? "",
      });
    }

    // Number format: Swiss (1'234.56)
    ["amount", "vatAmount", "subtotal"].forEach((col) => {
      sheet.getColumn(col).numFmt = '#\'##0.00';
    });

    // Total row
    const lastRow = sheet.rowCount + 1;
    sheet.addRow({
      merchant: "TOTAL",
      amount: { formula: `SUM(D2:D${lastRow - 1})` },
      vatAmount: { formula: `SUM(F2:F${lastRow - 1})` },
    });
    const totalRow = sheet.getRow(lastRow);
    totalRow.font = { bold: true };
  }

  // Summary sheet
  const summary = workbook.addWorksheet("Zusammenfassung");
  summary.addRow(["Monat", "Anzahl", "Total CHF", "MwSt CHF"]);
  summary.getRow(1).font = { bold: true };

  for (const [monthKey, monthExpenses] of Object.entries(byMonth)) {
    const [year, month] = monthKey.split("-");
    const label = format(new Date(`${year}-${month}-01`), "MMMM yyyy");
    const total = monthExpenses.reduce((s, e) => s + e.amount, 0);
    const vat = monthExpenses.reduce((s, e) => s + (e.vatAmount ?? 0), 0);
    summary.addRow([label, monthExpenses.length, total, vat]);
  }

  // KM log sheet (Phase 2)
  if (kmLogs.length > 0) {
    const kmSheet = workbook.addWorksheet("Kilometerpauschale");
    kmSheet.columns = [
      { header: "Datum", key: "date", width: 14 },
      { header: "Von", key: "from", width: 20 },
      { header: "Nach", key: "to", width: 20 },
      { header: "km", key: "distance", width: 10 },
      { header: "CHF/km", key: "rate", width: 10 },
      { header: "Total CHF", key: "total", width: 12 },
      { header: "Zweck", key: "purpose", width: 30 },
    ];

    for (const log of kmLogs) {
      kmSheet.addRow({
        date: format(new Date(log.date), "dd.MM.yyyy"),
        from: log.fromLocation,
        to: log.toLocation,
        distance: log.distanceKm,
        rate: log.ratePerKm,
        total: log.distanceKm * log.ratePerKm,
        purpose: log.purpose ?? "",
      });
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
