export const SUPPORTED_LANGUAGES = ["de", "fr", "it", "rm", "en"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = "de";

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  de: "Deutsch",
  fr: "Français",
  it: "Italiano",
  rm: "Rumantsch",
  en: "English",
};

export function isValidLanguage(lang: string): lang is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
}

export function detectLanguage(acceptLanguage?: string): SupportedLanguage {
  if (!acceptLanguage) return DEFAULT_LANGUAGE;
  const lang = acceptLanguage.split(",")[0]?.split("-")[0]?.toLowerCase();
  if (lang && isValidLanguage(lang)) return lang;
  return DEFAULT_LANGUAGE;
}
