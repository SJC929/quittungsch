import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { format } from "date-fns";
import { apiRequest } from "../lib/api";
import type { Expense } from "@quittungsch/types";

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
  RESTAURANT: "#F97316",
  TANKSTELLE: "#3B82F6",
  BUERO: "#8B5CF6",
  TELEFON: "#06B6D4",
  TRANSPORT: "#6366F1",
  UNTERKUNFT: "#EC4899",
  VERSICHERUNG: "#10B981",
  WEITERBILDUNG: "#F59E0B",
  DIVERSES: "#6B7280",
};

interface ExpensesListScreenProps {
  onAddExpense: () => void;
}

export function ExpensesListScreen({ onAddExpense }: ExpensesListScreenProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);

  const fetchExpenses = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams({
        pageSize: "50",
        ...(search ? { search } : {}),
      });

      const res = await apiRequest<{
        data: Expense[];
        total: number;
      }>(`/api/expenses?${params.toString()}`);

      setExpenses(res.data);
      setTotal(res.total);
    } catch {
      // fail silently in list view
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => {
    void fetchExpenses();
  }, [fetchExpenses]);

  function renderExpenseItem({ item: expense }: { item: Expense }) {
    const catColor = CATEGORY_COLORS[expense.category] ?? "#6B7280";

    return (
      <View style={styles.expenseItem}>
        <View style={[styles.categoryDot, { backgroundColor: catColor }]} />

        <View style={styles.expenseContent}>
          <View style={styles.expenseTop}>
            <Text style={styles.merchantName} numberOfLines={1}>
              {expense.merchantName ?? "Unbekannt"}
            </Text>
            <Text style={styles.amount}>
              CHF {expense.amount.toFixed(2)}
            </Text>
          </View>

          <View style={styles.expenseBottom}>
            <Text style={styles.categoryLabel}>
              {CATEGORY_LABELS[expense.category] ?? expense.category}
            </Text>
            <Text style={styles.dateLabel}>
              {format(new Date(expense.date), "dd.MM.yyyy")}
            </Text>
          </View>

          {expense.needsReview && (
            <View style={styles.reviewBadge}>
              <Text style={styles.reviewBadgeText}>⚠️ Zu prüfen</Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Belege</Text>
          <Text style={styles.headerSubtitle}>{total} Belege total</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={onAddExpense}>
          <Text style={styles.addButtonText}>+ Erfassen</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Suchen..."
          returnKeyType="search"
          onSubmitEditing={() => void fetchExpenses()}
        />
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : expenses.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Noch keine Belege vorhanden.</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={onAddExpense}>
            <Text style={styles.emptyButtonText}>Ersten Beleg erfassen</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          renderItem={renderExpenseItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void fetchExpenses(true)}
              tintColor="#2563EB"
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#111827" },
  headerSubtitle: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  addButton: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  addButtonText: { color: "white", fontSize: 14, fontWeight: "600" },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  searchInput: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 15,
    color: "#111827",
  },
  list: { paddingVertical: 8 },
  expenseItem: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "flex-start",
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
    marginRight: 12,
  },
  expenseContent: { flex: 1 },
  expenseTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  merchantName: { fontSize: 15, fontWeight: "600", color: "#111827", flex: 1, marginRight: 8 },
  amount: { fontSize: 15, fontWeight: "700", color: "#111827" },
  expenseBottom: { flexDirection: "row", justifyContent: "space-between" },
  categoryLabel: { fontSize: 13, color: "#6B7280" },
  dateLabel: { fontSize: 13, color: "#9CA3AF" },
  reviewBadge: {
    marginTop: 6,
    alignSelf: "flex-start",
    backgroundColor: "#FEF3C7",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  reviewBadgeText: { fontSize: 11, color: "#92400E", fontWeight: "500" },
  separator: { height: 1, backgroundColor: "#F3F4F6" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyText: { fontSize: 16, color: "#6B7280", marginBottom: 16 },
  emptyButton: {
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  emptyButtonText: { color: "white", fontSize: 15, fontWeight: "600" },
});
