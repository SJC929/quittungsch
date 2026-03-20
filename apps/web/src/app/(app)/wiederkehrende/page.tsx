"use client";

import { useState } from "react";
import { Button } from "@spezo/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@spezo/ui";
import { Input } from "@spezo/ui";
import { Label } from "@spezo/ui";
import { RefreshCw, Plus, Info } from "lucide-react";

interface RecurringExpense {
  id: string;
  merchant: string;
  amount: number;
  frequency: string;
  category: string;
  active: boolean;
}

const MOCK_EXPENSES: RecurringExpense[] = [
  { id: "1", merchant: "Swisscom", amount: 89, frequency: "Monatlich", category: "Kommunikation", active: true },
  { id: "2", merchant: "Büroraum Musterstrasse 5", amount: 500, frequency: "Monatlich", category: "Miete/Räume", active: true },
  { id: "3", merchant: "Adobe Creative Cloud", amount: 54.99, frequency: "Monatlich", category: "Software", active: false },
  { id: "4", merchant: "Fahrzeug-Leasing BMW", amount: 650, frequency: "Monatlich", category: "Fahrzeug", active: true },
];

const CATEGORIES = ["Kommunikation", "Miete/Räume", "Software", "Fahrzeug", "Versicherung", "Abonnement", "Sonstiges"];

export default function WiederkehrendePage() {
  const [expenses, setExpenses] = useState<RecurringExpense[]>(MOCK_EXPENSES);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ merchant: "", amount: "", frequency: "Monatlich", category: "Sonstiges" });

  function toggleActive(id: string) {
    setExpenses(expenses.map((e) => e.id === id ? { ...e, active: !e.active } : e));
  }

  function handleAdd(ev: React.FormEvent) {
    ev.preventDefault();
    const newExpense: RecurringExpense = {
      id: Date.now().toString(),
      merchant: form.merchant,
      amount: parseFloat(form.amount) || 0,
      frequency: form.frequency,
      category: form.category,
      active: true,
    };
    setExpenses([newExpense, ...expenses]);
    setForm({ merchant: "", amount: "", frequency: "Monatlich", category: "Sonstiges" });
    setShowForm(false);
  }

  const totalActive = expenses.filter((e) => e.active).reduce((s, e) => s + e.amount, 0);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <RefreshCw className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Wiederkehrende Ausgaben</h1>
            <p className="text-sm text-gray-500">Automatisch erkannte regelmässige Ausgaben</p>
          </div>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Manuell hinzufügen
        </Button>
      </div>

      {/* Info box */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3">
        <Info className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-emerald-700">
          Spezo analysiert Ihre Belege und erkennt Muster automatisch.
          Diese Funktion ist vollständig verfügbar ab 3 Monaten Daten.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-emerald-100">
          <CardContent className="pt-5">
            <p className="text-sm text-gray-500">Aktive wiederkehrende Ausgaben</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              CHF {totalActive.toFixed(2)}<span className="text-base font-normal text-gray-400">/Mt.</span>
            </p>
          </CardContent>
        </Card>
        <Card className="border-emerald-100">
          <CardContent className="pt-5">
            <p className="text-sm text-gray-500">Erkannte Abonnements</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{expenses.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Inline add form */}
      {showForm && (
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-base">Neue wiederkehrende Ausgabe</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="merchant">Anbieter / Händler</Label>
                <Input id="merchant" value={form.merchant} onChange={(e) => setForm({ ...form, merchant: e.target.value })} placeholder="z.B. Swisscom, Netflix, ..." className="mt-1" required />
              </div>
              <div>
                <Label htmlFor="amount">Betrag (CHF)</Label>
                <Input id="amount" type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" className="mt-1" required />
              </div>
              <div>
                <Label htmlFor="frequency">Häufigkeit</Label>
                <select
                  id="frequency"
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                >
                  <option>Monatlich</option>
                  <option>Quartalsweise</option>
                  <option>Jährlich</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="category">Kategorie</Label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2 flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Abbrechen</Button>
                <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600">Hinzufügen</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Expenses list */}
      <Card className="border-emerald-100">
        <CardHeader>
          <CardTitle className="text-base">Alle wiederkehrenden Ausgaben</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <RefreshCw className="h-4 w-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{expense.merchant}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">{expense.frequency}</span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{expense.category}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">CHF {expense.amount.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">{expense.frequency}</p>
                  </div>
                  <button
                    onClick={() => toggleActive(expense.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      expense.active ? "bg-emerald-500" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        expense.active ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
