"use client";

import { useState } from "react";
import { LANGUAGE_NAMES, SUPPORTED_LANGUAGES, type SupportedLanguage } from "@quittungsch/i18n";

const LANGUAGE_FLAGS: Record<SupportedLanguage, string> = {
  de: "🇩🇪",
  fr: "🇫🇷",
  it: "🇮🇹",
  rm: "🏔️",
  en: "🇬🇧",
};

const LANGUAGE_REGIONS: Record<SupportedLanguage, string> = {
  de: "Deutschschweiz",
  fr: "Romandie",
  it: "Ticino",
  rm: "Graubünden",
  en: "International",
};

export function LanguageSelector({ current }: { current: string }) {
  const [selected, setSelected] = useState<SupportedLanguage>(
    (current as SupportedLanguage) ?? "de"
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleChange(lang: SupportedLanguage) {
    setSelected(lang);
    setSaving(true);
    setSaved(false);
    await fetch("/api/tenant/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: lang }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            key={lang}
            onClick={() => void handleChange(lang)}
            disabled={saving}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
              selected === lang
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <span className="text-xl">{LANGUAGE_FLAGS[lang]}</span>
            <div>
              <div className="font-semibold text-sm">{LANGUAGE_NAMES[lang]}</div>
              <div className="text-xs text-gray-400">{LANGUAGE_REGIONS[lang]}</div>
            </div>
          </button>
        ))}
      </div>
      {saving && <p className="text-xs text-gray-400 mt-2">Wird gespeichert...</p>}
      {saved && <p className="text-xs text-green-600 mt-2">✓ Gespeichert</p>}
    </div>
  );
}
