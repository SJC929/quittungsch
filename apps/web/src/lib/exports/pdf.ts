import { format } from "date-fns";
import type { Expense, KilometerLog } from "@quittungsch/db/client";

interface PdfOptions {
  dateFrom: string;
  dateTo: string;
}

/**
 * Generate a PDF report using @react-pdf/renderer.
 * Includes watermark: "Erstellt mit QuittungsCH – Nicht geprüft"
 *
 * Note: @react-pdf/renderer requires a React environment.
 * This function dynamically imports it to avoid SSR issues.
 */
export async function generatePdf(
  expenses: Expense[],
  kmLogs: KilometerLog[],
  options: PdfOptions
): Promise<Buffer> {
  const {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    renderToBuffer,
  } = await import("@react-pdf/renderer");
  const React = await import("react");

  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);
  const totalVat = expenses.reduce((s, e) => s + (e.vatAmount ?? 0), 0);
  const totalKm = kmLogs.reduce((s, k) => s + k.distanceKm, 0);
  const totalKmAmount = kmLogs.reduce((s, k) => s + k.distanceKm * k.ratePerKm, 0);

  const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: "Helvetica", fontSize: 9 },
    title: { fontSize: 18, fontWeight: "bold", marginBottom: 4, color: "#1E3A8A" },
    subtitle: { fontSize: 11, color: "#6B7280", marginBottom: 20 },
    watermark: {
      position: "absolute",
      top: "45%",
      left: "10%",
      right: "10%",
      fontSize: 24,
      color: "#E5E7EB",
      textAlign: "center",
      transform: "rotate(-30deg)",
      fontWeight: "bold",
    },
    sectionTitle: { fontSize: 12, fontWeight: "bold", marginTop: 16, marginBottom: 6, color: "#1E3A8A" },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: "#EFF6FF",
      padding: "4 6",
      borderBottom: "1 solid #BFDBFE",
    },
    tableRow: { flexDirection: "row", padding: "3 6", borderBottom: "1 solid #F3F4F6" },
    col1: { width: "15%" },
    col2: { width: "25%" },
    col3: { width: "18%" },
    col4: { width: "12%", textAlign: "right" },
    col5: { width: "10%", textAlign: "right" },
    col6: { width: "10%", textAlign: "right" },
    col7: { width: "10%", textAlign: "right" },
    summaryBox: { marginTop: 16, padding: 12, backgroundColor: "#EFF6FF", borderRadius: 4 },
    summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
    totalRow: { flexDirection: "row", justifyContent: "space-between", borderTop: "1 solid #2563EB", paddingTop: 4, marginTop: 4 },
    bold: { fontWeight: "bold" },
    footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 7, color: "#9CA3AF", flexDirection: "row", justifyContent: "space-between" },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = React.createElement<any>(
    Document,
    { title: "QuittungsCH Ausgaben-Report" },
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      // Watermark
      React.createElement(Text, { style: styles.watermark }, "Erstellt mit QuittungsCH – Nicht geprüft"),
      // Title
      React.createElement(Text, { style: styles.title }, "QuittungsCH – Ausgaben-Report"),
      React.createElement(
        Text,
        { style: styles.subtitle },
        `Zeitraum: ${format(new Date(options.dateFrom), "dd.MM.yyyy")} – ${format(new Date(options.dateTo), "dd.MM.yyyy")}`
      ),
      // Table header
      React.createElement(Text, { style: styles.sectionTitle }, "Belege"),
      React.createElement(
        View,
        { style: styles.tableHeader },
        React.createElement(Text, { style: styles.col1 }, "Datum"),
        React.createElement(Text, { style: styles.col2 }, "Händler"),
        React.createElement(Text, { style: styles.col3 }, "Kategorie"),
        React.createElement(Text, { style: styles.col4 }, "Betrag"),
        React.createElement(Text, { style: styles.col5 }, "MwSt%"),
        React.createElement(Text, { style: styles.col6 }, "MwSt CHF"),
        React.createElement(Text, { style: styles.col7 }, "Netto")
      ),
      // Expense rows
      ...expenses.map((e) =>
        React.createElement(
          View,
          { key: e.id, style: styles.tableRow },
          React.createElement(Text, { style: styles.col1 }, format(new Date(e.date), "dd.MM.yy")),
          React.createElement(Text, { style: styles.col2 }, (e.merchantName ?? "-").slice(0, 22)),
          React.createElement(Text, { style: styles.col3 }, e.category),
          React.createElement(Text, { style: styles.col4 }, `CHF ${e.amount.toFixed(2)}`),
          React.createElement(Text, { style: styles.col5 }, `${e.vatRate ?? 0}%`),
          React.createElement(Text, { style: styles.col6 }, `${(e.vatAmount ?? 0).toFixed(2)}`),
          React.createElement(Text, { style: styles.col7 }, `${(e.subtotal ?? 0).toFixed(2)}`)
        )
      ),
      // Summary
      React.createElement(
        View,
        { style: styles.summaryBox },
        React.createElement(Text, { style: [styles.sectionTitle, { marginTop: 0 }] }, "Zusammenfassung"),
        React.createElement(
          View,
          { style: styles.summaryRow },
          React.createElement(Text, null, "Anzahl Belege"),
          React.createElement(Text, null, `${expenses.length}`)
        ),
        React.createElement(
          View,
          { style: styles.summaryRow },
          React.createElement(Text, null, "Total MwSt"),
          React.createElement(Text, null, `CHF ${totalVat.toFixed(2)}`)
        ),
        ...(kmLogs.length > 0
          ? [
              React.createElement(
                View,
                { key: "km", style: styles.summaryRow },
                React.createElement(Text, null, `Kilometerpauschale (${totalKm.toFixed(0)} km)`),
                React.createElement(Text, null, `CHF ${totalKmAmount.toFixed(2)}`)
              ),
            ]
          : []),
        React.createElement(
          View,
          { style: styles.totalRow },
          React.createElement(Text, { style: styles.bold }, "TOTAL"),
          React.createElement(
            Text,
            { style: styles.bold },
            `CHF ${(totalAmount + totalKmAmount).toFixed(2)}`
          )
        )
      ),
      // Footer
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(Text, null, `Erstellt: ${format(new Date(), "dd.MM.yyyy HH:mm")}`),
        React.createElement(Text, null, "QuittungsCH – Nicht geprüft / nicht testiert")
      )
    )
  );

  const buffer = await renderToBuffer(doc);
  return Buffer.from(buffer);
}
