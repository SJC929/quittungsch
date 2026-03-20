"use client";

import { useState } from "react";
import { Button } from "@spezo/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@spezo/ui";
import { Input } from "@spezo/ui";
import { Label } from "@spezo/ui";
import { RefreshCw, Plus, Info } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

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

const T = {
  de: {
    title: "Wiederkehrende Ausgaben",
    subtitle: "Automatisch erkannte regelmässige Ausgaben",
    add_btn: "Manuell hinzufügen",
    info: "Spezo analysiert Ihre Belege und erkennt Muster automatisch. Diese Funktion ist vollständig verfügbar ab 3 Monaten Daten.",
    total_label: "Aktive wiederkehrende Ausgaben",
    per_month: "/Mt.",
    count_label: "Erkannte Abonnements",
    form_title: "Neue wiederkehrende Ausgabe",
    merchant_label: "Anbieter / Händler",
    merchant_ph: "z.B. Swisscom, Netflix, ...",
    amount_label: "Betrag (CHF)",
    freq_label: "Häufigkeit",
    cat_label: "Kategorie",
    cancel: "Abbrechen",
    add: "Hinzufügen",
    list_title: "Alle wiederkehrenden Ausgaben",
    monthly: "Monatlich",
    quarterly: "Quartalsweise",
    yearly: "Jährlich",
  },
  fr: {
    title: "Dépenses récurrentes",
    subtitle: "Dépenses régulières automatiquement détectées",
    add_btn: "Ajouter manuellement",
    info: "Spezo analyse vos reçus et détecte les modèles automatiquement. Cette fonctionnalité est pleinement disponible après 3 mois de données.",
    total_label: "Dépenses récurrentes actives",
    per_month: "/mois",
    count_label: "Abonnements détectés",
    form_title: "Nouvelle dépense récurrente",
    merchant_label: "Fournisseur / Marchand",
    merchant_ph: "ex. Swisscom, Netflix, ...",
    amount_label: "Montant (CHF)",
    freq_label: "Fréquence",
    cat_label: "Catégorie",
    cancel: "Annuler",
    add: "Ajouter",
    list_title: "Toutes les dépenses récurrentes",
    monthly: "Mensuel",
    quarterly: "Trimestriel",
    yearly: "Annuel",
  },
  it: {
    title: "Spese ricorrenti",
    subtitle: "Spese regolari rilevate automaticamente",
    add_btn: "Aggiungi manualmente",
    info: "Spezo analizza le tue ricevute e rileva automaticamente i pattern. Questa funzione è completamente disponibile dopo 3 mesi di dati.",
    total_label: "Spese ricorrenti attive",
    per_month: "/mese",
    count_label: "Abbonamenti rilevati",
    form_title: "Nuova spesa ricorrente",
    merchant_label: "Fornitore / Commerciante",
    merchant_ph: "es. Swisscom, Netflix, ...",
    amount_label: "Importo (CHF)",
    freq_label: "Frequenza",
    cat_label: "Categoria",
    cancel: "Annulla",
    add: "Aggiungi",
    list_title: "Tutte le spese ricorrenti",
    monthly: "Mensile",
    quarterly: "Trimestrale",
    yearly: "Annuale",
  },
  rm: {
    title: "Expensas recurrents",
    subtitle: "Expensas regulars automaticamain perscrutadas",
    add_btn: "Agiuntar manualmaing",
    info: "Spezo analisa vos quittanzas ed perscrutescha automaticamain models. Questa funcziun è disponibla suenter 3 mais da datas.",
    total_label: "Expensas recurrents activas",
    per_month: "/mais",
    count_label: "Abunaments perscrutads",
    form_title: "Nova expensa recurrenta",
    merchant_label: "Furnider / Vendider",
    merchant_ph: "p.ex. Swisscom, Netflix, ...",
    amount_label: "Import (CHF)",
    freq_label: "Frequenza",
    cat_label: "Categoria",
    cancel: "Interrumper",
    add: "Agiuntar",
    list_title: "Tut las expensas recurrents",
    monthly: "Mensual",
    quarterly: "Trimestralmain",
    yearly: "Annualmain",
  },
  en: {
    title: "Recurring Expenses",
    subtitle: "Automatically detected regular expenses",
    add_btn: "Add manually",
    info: "Spezo analyses your receipts and automatically detects patterns. This feature is fully available after 3 months of data.",
    total_label: "Active recurring expenses",
    per_month: "/mo.",
    count_label: "Detected subscriptions",
    form_title: "New recurring expense",
    merchant_label: "Provider / Merchant",
    merchant_ph: "e.g. Swisscom, Netflix, ...",
    amount_label: "Amount (CHF)",
    freq_label: "Frequency",
    cat_label: "Category",
    cancel: "Cancel",
    add: "Add",
    list_title: "All recurring expenses",
    monthly: "Monthly",
    quarterly: "Quarterly",
    yearly: "Yearly",
  },
  tr: {
    title: "Tekrarlayan Giderler",
    subtitle: "Otomatik olarak tespit edilen düzenli giderler",
    add_btn: "Manuel ekle",
    info: "Spezo makbuzlarınızı analiz eder ve kalıpları otomatik olarak tespit eder. Bu özellik 3 aylık veriden sonra tam olarak kullanılabilir.",
    total_label: "Aktif tekrarlayan giderler",
    per_month: "/ay",
    count_label: "Tespit edilen abonelikler",
    form_title: "Yeni tekrarlayan gider",
    merchant_label: "Sağlayıcı / Satıcı",
    merchant_ph: "örn. Swisscom, Netflix, ...",
    amount_label: "Tutar (CHF)",
    freq_label: "Sıklık",
    cat_label: "Kategori",
    cancel: "İptal",
    add: "Ekle",
    list_title: "Tüm tekrarlayan giderler",
    monthly: "Aylık",
    quarterly: "Üç aylık",
    yearly: "Yıllık",
  },
  sq: {
    title: "Shpenzimet e përsëritura",
    subtitle: "Shpenzime të rregullta të zbuluara automatikisht",
    add_btn: "Shto manualisht",
    info: "Spezo analizon faturat tuaja dhe zbulon automatikisht modelet. Ky funksion është plotësisht i disponueshëm pas 3 muajve të të dhënave.",
    total_label: "Shpenzime aktive të përsëritura",
    per_month: "/muaj",
    count_label: "Abonime të zbuluara",
    form_title: "Shpenzim i ri i përsëritur",
    merchant_label: "Furnizuesi / Shitësi",
    merchant_ph: "p.sh. Swisscom, Netflix, ...",
    amount_label: "Shuma (CHF)",
    freq_label: "Shpeshtësia",
    cat_label: "Kategoria",
    cancel: "Anulo",
    add: "Shto",
    list_title: "Të gjitha shpenzimet e përsëritura",
    monthly: "Mujore",
    quarterly: "Tremujore",
    yearly: "Vjetore",
  },
};

export default function WiederkehrendePage() {
  const { lang } = useLanguage();
  const t = T[lang] ?? T.de;

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <RefreshCw className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
            <p className="text-sm text-gray-500">{t.subtitle}</p>
          </div>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          {t.add_btn}
        </Button>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3">
        <Info className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-emerald-700">{t.info}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-emerald-100">
          <CardContent className="pt-5">
            <p className="text-sm text-gray-500">{t.total_label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              CHF {totalActive.toFixed(2)}<span className="text-base font-normal text-gray-400">{t.per_month}</span>
            </p>
          </CardContent>
        </Card>
        <Card className="border-emerald-100">
          <CardContent className="pt-5">
            <p className="text-sm text-gray-500">{t.count_label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{expenses.length}</p>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-base">{t.form_title}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="merchant">{t.merchant_label}</Label>
                <Input id="merchant" value={form.merchant} onChange={(e) => setForm({ ...form, merchant: e.target.value })} placeholder={t.merchant_ph} className="mt-1" required />
              </div>
              <div>
                <Label htmlFor="amount">{t.amount_label}</Label>
                <Input id="amount" type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" className="mt-1" required />
              </div>
              <div>
                <Label htmlFor="frequency">{t.freq_label}</Label>
                <select
                  id="frequency"
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                >
                  <option value="Monatlich">{t.monthly}</option>
                  <option value="Quartalsweise">{t.quarterly}</option>
                  <option value="Jährlich">{t.yearly}</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="category">{t.cat_label}</Label>
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
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>{t.cancel}</Button>
                <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600">{t.add}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border-emerald-100">
        <CardHeader>
          <CardTitle className="text-base">{t.list_title}</CardTitle>
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
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${expense.active ? "bg-emerald-500" : "bg-gray-200"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${expense.active ? "translate-x-6" : "translate-x-1"}`} />
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
