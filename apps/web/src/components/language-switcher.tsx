"use client";

import { useState, useRef, useEffect } from "react";
import { LANGUAGE_NAMES, LANGUAGE_FLAGS, SUPPORTED_LANGUAGES, type SupportedLanguage } from "@spezo/i18n";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  current?: SupportedLanguage;
  onChange?: (lang: SupportedLanguage) => void;
}

export function LanguageSwitcher({ current = "de", onChange }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<SupportedLanguage>(current);
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

  function handleSelect(lang: SupportedLanguage) {
    setSelected(lang);
    setOpen(false);
    onChange?.(lang);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-sm font-medium text-gray-600"
      >
        <Globe className="h-3.5 w-3.5 text-gray-400" />
        <span>{LANGUAGE_FLAGS[selected]}</span>
        <span className="hidden sm:inline">{LANGUAGE_NAMES[selected]}</span>
        <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => handleSelect(lang)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-emerald-50 transition-colors ${
                selected === lang ? "text-emerald-700 font-semibold" : "text-gray-700"
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
  );
}
