"use client";

import { useState, useRef, useEffect } from "react";
import { LANGUAGE_NAMES, LANGUAGE_FLAGS, SUPPORTED_LANGUAGES, type SupportedLanguage } from "@spezo/i18n";
import { Globe, Check } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export function Topbar({ currentLanguage }: { currentLanguage: string }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { lang, setLang } = useLanguage();
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

  async function handleSelect(selected: SupportedLanguage) {
    setLang(selected);
    setOpen(false);
    setSaving(true);
    await fetch("/api/tenant/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: selected }),
    });
    setSaving(false);
  }

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-end px-6 gap-4 sticky top-0 z-20 shadow-sm">
      {saving && <span className="text-xs text-gray-400 animate-pulse">Wird gespeichert…</span>}

      {/* Language dropdown */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors text-sm font-medium text-gray-600"
        >
          <Globe className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-base leading-none">{LANGUAGE_FLAGS[lang]}</span>
          <span className="text-sm">{LANGUAGE_NAMES[lang]}</span>
          <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 z-50">
            {SUPPORTED_LANGUAGES.map((l) => (
              <button
                key={l}
                onClick={() => void handleSelect(l)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  lang === l ? "text-emerald-700 font-semibold" : "text-gray-700"
                }`}
              >
                <span className="text-base">{LANGUAGE_FLAGS[l]}</span>
                <span>{LANGUAGE_NAMES[l]}</span>
                {lang === l && <Check className="h-3.5 w-3.5 ml-auto text-emerald-600" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
