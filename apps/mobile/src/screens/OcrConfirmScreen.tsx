import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import type { ExtractedExpense } from "@quittungsch/types";
import { apiRequest } from "../lib/api";

const CATEGORIES = [
  { value: "RESTAURANT", label: "Essen & Getränke" },
  { value: "TANKSTELLE", label: "Benzin / Transport" },
  { value: "BUERO", label: "Büromaterial" },
  { value: "TELEFON", label: "Telefon / Internet" },
  { value: "TRANSPORT", label: "Transport / Reise" },
  { value: "UNTERKUNFT", label: "Unterkunft" },
  { value: "VERSICHERUNG", label: "Versicherung" },
  { value: "WEITERBILDUNG", label: "Weiterbildung" },
  { value: "DIVERSES", label: "Diverses" },
];

interface OcrConfirmScreenProps {
  extracted: ExtractedExpense;
  receiptPath: string;
  imageUri: string;
  onSaved: () => void;
  onCancel: () => void;
}

export function OcrConfirmScreen({
  extracted,
  receiptPath,
  imageUri,
  onSaved,
  onCancel,
}: OcrConfirmScreenProps) {
  const [merchantName, setMerchantName] = useState(extracted.merchant ?? "");
  const [date, setDate] = useState(
    extracted.date ?? new Date().toISOString().split("T")[0]!
  );
  const [amount, setAmount] = useState(extracted.total?.toFixed(2) ?? "");
  const [vatRate, setVatRate] = useState(extracted.vatRate?.toString() ?? "");
  const [category, setCategory] = useState(
    mapCategory(extracted.category) ?? "DIVERSES"
  );
  const [paymentMethod, setPaymentMethod] = useState(
    mapPaymentMethod(extracted.paymentMethod) ?? "UNKNOWN"
  );
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const confidence = extracted.confidence;
  const confidenceColor =
    confidence >= 0.9
      ? "#10B981"
      : confidence >= 0.75
      ? "#F59E0B"
      : "#EF4444";

  async function handleSave() {
    if (!amount) {
      Alert.alert("Fehler", "Bitte Betrag eingeben.");
      return;
    }

    setSaving(true);
    try {
      await apiRequest("/api/expenses", {
        method: "POST",
        body: {
          merchantName: merchantName || undefined,
          date: new Date(date).toISOString(),
          amount: parseFloat(amount),
          currency: extracted.currency ?? "CHF",
          vatRate: vatRate ? parseFloat(vatRate) : undefined,
          vatAmount: extracted.vatAmount,
          subtotal: extracted.subtotal,
          category,
          receiptType: mapReceiptType(extracted.receiptType),
          paymentMethod,
          notes: notes || undefined,
          receiptImageUrl: receiptPath || undefined,
          ocrConfidence: extracted.confidence,
          ocrProvider: extracted.ocrProvider,
          ocrRawText: extracted.rawText,
          needsReview: extracted.confidence < 0.9,
        },
      });

      Alert.alert("Gespeichert!", "Beleg wurde erfolgreich gespeichert.", [
        { text: "OK", onPress: onSaved },
      ]);
    } catch (err) {
      Alert.alert(
        "Fehler",
        err instanceof Error ? err.message : "Speichern fehlgeschlagen."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Receipt preview */}
      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={styles.preview}
          resizeMode="contain"
        />
      )}

      {/* Confidence banner */}
      <View style={[styles.confidenceBanner, { backgroundColor: `${confidenceColor}15` }]}>
        <View style={[styles.confidenceDot, { backgroundColor: confidenceColor }]} />
        <Text style={[styles.confidenceText, { color: confidenceColor }]}>
          OCR-Konfidenz: {Math.round(confidence * 100)}%
          {confidence >= 0.9
            ? " – Hohe Genauigkeit"
            : confidence >= 0.75
            ? " – Bitte prüfen"
            : " – Niedrige Genauigkeit"}
        </Text>
      </View>

      {confidence < 0.75 && extracted.missingFields.length > 0 && (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ⚠️ Unsichere Felder: {extracted.missingFields.join(", ")}
          </Text>
        </View>
      )}

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Belegdaten bestätigen</Text>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Händler</Text>
            <TextInput
              style={[
                styles.input,
                extracted.missingFields.includes("merchant") && styles.inputWarning,
              ]}
              value={merchantName}
              onChangeText={setMerchantName}
              placeholder="Händler"
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Datum</Text>
            <TextInput
              style={[
                styles.input,
                extracted.missingFields.includes("date") && styles.inputWarning,
              ]}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Betrag CHF *</Text>
            <TextInput
              style={[
                styles.input,
                extracted.missingFields.includes("total") && styles.inputWarning,
              ]}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>MwSt %</Text>
            <TextInput
              style={styles.input}
              value={vatRate}
              onChangeText={setVatRate}
              keyboardType="decimal-pad"
              placeholder="8.1"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kategorie</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  onPress={() => setCategory(cat.value)}
                  style={[
                    styles.categoryChip,
                    category === cat.value && styles.categoryChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      category === cat.value && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Zahlungsmittel</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryRow}>
              {[
                { value: "CASH", label: "Bar" },
                { value: "CARD", label: "Karte" },
                { value: "TWINT", label: "TWINT" },
                { value: "BANK_TRANSFER", label: "Überweisung" },
                { value: "UNKNOWN", label: "Unbekannt" },
              ].map((m) => (
                <TouchableOpacity
                  key={m.value}
                  onPress={() => setPaymentMethod(m.value)}
                  style={[
                    styles.categoryChip,
                    paymentMethod === m.value && styles.categoryChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      paymentMethod === m.value && styles.categoryChipTextActive,
                    ]}
                  >
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notizen (optional)</Text>
          <TextInput
            style={[styles.input, { minHeight: 60 }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Optionale Notizen..."
            multiline
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>Abbrechen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={() => void handleSave()}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Speichern</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function mapCategory(raw?: string): string {
  const map: Record<string, string> = {
    restaurant: "RESTAURANT", tankstelle: "TANKSTELLE", buero: "BUERO",
    telefon: "TELEFON", transport: "TRANSPORT", unterkunft: "UNTERKUNFT",
    versicherung: "VERSICHERUNG", weiterbildung: "WEITERBILDUNG", diverses: "DIVERSES",
  };
  return map[raw?.toLowerCase() ?? ""] ?? "DIVERSES";
}

function mapPaymentMethod(raw?: string): string {
  const map: Record<string, string> = {
    cash: "CASH", card: "CARD", twint: "TWINT", bank_transfer: "BANK_TRANSFER",
  };
  return map[raw?.toLowerCase() ?? ""] ?? "UNKNOWN";
}

function mapReceiptType(raw?: string): string {
  const map: Record<string, string> = {
    kassenbon: "KASSENBON", rechnung: "RECHNUNG", tankbeleg: "TANKBELEG", qr_rechnung: "QR_RECHNUNG",
  };
  return map[raw?.toLowerCase() ?? ""] ?? "KASSENBON";
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  preview: { width: "100%", height: 200, backgroundColor: "#E5E7EB" },
  confidenceBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  confidenceDot: { width: 8, height: 8, borderRadius: 4 },
  confidenceText: { fontSize: 13, fontWeight: "500" },
  warningBox: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    padding: 10,
  },
  warningText: { fontSize: 12, color: "#92400E" },
  form: { padding: 16 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#111827", marginBottom: 16 },
  row: { flexDirection: "row", marginBottom: 0 },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: "500", color: "#374151", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "white",
  },
  inputWarning: { borderColor: "#F97316" },
  categoryRow: { flexDirection: "row", gap: 8, paddingBottom: 4 },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  categoryChipActive: { backgroundColor: "#EFF6FF", borderColor: "#2563EB" },
  categoryChipText: { fontSize: 13, color: "#374151" },
  categoryChipTextActive: { color: "#2563EB", fontWeight: "600" },
  buttonRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
  cancelButtonText: { color: "#374151", fontSize: 15, fontWeight: "500" },
  saveButton: {
    flex: 2,
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: "white", fontSize: 15, fontWeight: "600" },
});
