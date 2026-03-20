"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { SupportedLanguage } from "@spezo/i18n";
import { isValidLanguage } from "@spezo/i18n";

interface LangCtx { lang: SupportedLanguage; setLang: (l: SupportedLanguage) => void; }
const LanguageContext = createContext<LangCtx>({ lang: "de", setLang: () => {} });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<SupportedLanguage>("de");
  useEffect(() => {
    const m = document.cookie.match(/(?:^|;\s*)spezo_lang=([^;]+)/);
    if (m?.[1] && isValidLanguage(m[1])) setLangState(m[1] as SupportedLanguage);
  }, []);
  const setLang = useCallback((l: SupportedLanguage) => {
    setLangState(l);
    document.cookie = `spezo_lang=${l};path=/;max-age=31536000;SameSite=Lax`;
  }, []);
  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}
export function useLanguage() { return useContext(LanguageContext); }
