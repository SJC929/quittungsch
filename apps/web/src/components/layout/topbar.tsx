"use client";

import { useState, useRef, useEffect } from "react";
import { LANGUAGE_NAMES, LANGUAGE_FLAGS, SUPPORTED_LANGUAGES, type SupportedLanguage } from "@spezo/i18n";
import { Globe } from "lucide-react";

export function Topbar({ currentLanguage }: { currentLanguage: string }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<SupportedLanguage>(
    (currentLanguage as SupportedLanguage) ?? "de"
  );
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSelect(lang: SupportedLanguage) {
    setSelected(lang);
    setOpen(false);
    setSaving(true);
    await fetch("/api/tenant/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: lang }),
    });
    setSaving(false);
  }

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-end px-6 gap-4 sticky top-0 z-20">
      {saving && <span className="text-xs text-gray-400">Wird gespeichert...</span>}

      {/* Language dropdown */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-sm font-medium text-gray-700"
        >
          <Globe className="h-4 w-4 text-gray-400" />
          <span>{LANGUAGE_FLAGS[selected]}</span>
          <span>{LANGUAGE_NAMES[selected]}</span>
          <svg className="h-3 w-3 text-gray-400 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => void handleSelect(lang)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-emerald-50 transition-colors ${
                  selected === lang ? "text-emerald-700 font-semibold bg-emerald-50" : "text-gray-700"
                }`}
              >
                <span className="text-base">{LANGUAGE_FLAGS[lang]}</span>
                <span>{LANGUAGE_NAMES[lang]}</span>
                {selected === lang && (
                  <svg className="h-4 w-4 ml-auto text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
