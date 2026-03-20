"use client";

import { useState } from "react";
import { Button } from "@spezo/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@spezo/ui";
import { Calculator } from "lucide-react";

const VAT_RATES = [
  { rate: 8.1, label: "Normalsatz", description: "Für die meisten Leistungen" },
  { rate: 3.8, label: "Sondersatz", description: "Beherbergungsleistungen" },
  { rate: 2.5, label: "Sondersatz", description: "Lebensmittel, Bücher, Zeitungen, Medikamente" },
];

const QUARTERS = ["Q1 (Jan–Mrz)", "Q2 (Apr–Jun)", "Q3 (Jul–Sep)", "Q4 (Okt–Dez)"];

export default function MwstPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [quarter, setQuarter] = useState(0);
  const [umsatz, setUmsatz] = useState("");
  const [showResult, setShowResult] = useState(false);

  const umsatzNum = parseFloat(umsatz) || 0;
  const vatNormal = umsatzNum * 0.081;
  const vatSpecial = umsatzNum * 0.038;
  const vatReduced = umsatzNum * 0.025;

  function handleCalculate() {
    setShowResult(true);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
          <Calculator className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">MwSt-Abrechnung ESTV</h1>
          <p className="text-sm text-gray-500">Quartalsweise Mehrwertsteuerberechnung für die Schweiz</p>
        </div>
      </div>

      {/* VAT rates info */}
      <Card className="border-emerald-100">
        <CardHeader>
          <CardTitle className="text-base">Schweizer MwSt-Sätze 2024</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {VAT_RATES.map((v) => (
              <div key={v.rate} className="bg-emerald-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-emerald-700">{v.rate}%</p>
                <p className="text-sm font-medium text-gray-700 mt-1">{v.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{v.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quarter selector */}
      <Card className="border-emerald-100">
        <CardHeader>
          <CardTitle className="text-base">Abrechnung erstellen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Quartal</label>
              <div className="flex gap-2 flex-wrap">
                {QUARTERS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setQuarter(i)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      quarter === i
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Jahr</label>
              <div className="flex gap-1">
                <button
                  onClick={() => setYear(y => y - 1)}
                  className="w-8 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium text-sm"
                >‹</button>
                <span className="w-14 h-9 flex items-center justify-center text-sm font-medium text-gray-900">{year}</span>
                <button
                  onClick={() => setYear(y => y + 1)}
                  className="w-8 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium text-sm"
                >›</button>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Gesamtumsatz {QUARTERS[quarter]} {year} (CHF, ohne MwSt)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">CHF</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={umsatz}
                onChange={(e) => { setUmsatz(e.target.value); setShowResult(false); }}
                placeholder="0.00"
                className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
          </div>

          <Button
            className="w-full bg-emerald-500 hover:bg-emerald-600"
            onClick={handleCalculate}
            disabled={!umsatz || umsatzNum <= 0}
          >
            Abrechnung berechnen
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {showResult && umsatzNum > 0 && (
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-base text-emerald-700">
              Vorschau MwSt-Abrechnung – {QUARTERS[quarter]} {year}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Umsatz (ohne MwSt)</span>
                <span className="font-semibold">CHF {umsatzNum.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">MwSt 8.1% (Normalsatz)</span>
                  <span className="font-medium text-orange-600">CHF {vatNormal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">MwSt 3.8% (Beherbergung)</span>
                  <span className="font-medium text-orange-600">CHF {vatSpecial.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">MwSt 2.5% (Sonderrate)</span>
                  <span className="font-medium text-orange-600">CHF {vatReduced.toFixed(2)}</span>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-bold">
                <span className="text-gray-800">Total MwSt schuldig (8.1%)</span>
                <span className="text-emerald-700">CHF {vatNormal.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs text-amber-700">
                ⚠️ Diese Berechnung ist eine Vorschau. Reichen Sie die offizielle ESTV-Abrechnung unter{" "}
                <a href="https://www.estv.admin.ch" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                  estv.admin.ch
                </a>{" "}
                ein.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
