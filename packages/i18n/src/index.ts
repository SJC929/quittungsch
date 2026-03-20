export const SUPPORTED_LANGUAGES = ["de", "fr", "it", "rm", "en", "tr", "sq"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = "de";

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  de: "Deutsch",
  fr: "Français",
  it: "Italiano",
  rm: "Rumantsch",
  en: "English",
  tr: "Türkçe",
  sq: "Shqip",
};

export const LANGUAGE_FLAGS: Record<SupportedLanguage, string> = {
  de: "🇩🇪",
  fr: "🇫🇷",
  it: "🇮🇹",
  rm: "🏔️",
  en: "🇬🇧",
  tr: "🇹🇷",
  sq: "🇦🇱",
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

// Camera permission text per language
export const CAMERA_PERMISSION_TEXT: Record<SupportedLanguage, {
  title: string;
  text: string;
  button: string;
  skip: string;
}> = {
  de: {
    title: "Kamerazugriff benötigt",
    text: "QuittungsCH benötigt Zugriff auf Ihre Kamera, um Belege zu fotografieren. Bitte aktivieren Sie die Kameraerlaubnis in den Einstellungen.",
    button: "Kamera erlauben",
    skip: "Jetzt überspringen",
  },
  fr: {
    title: "Accès caméra requis",
    text: "QuittungsCH a besoin d'accéder à votre caméra pour photographier vos reçus. Veuillez autoriser l'accès à la caméra dans les paramètres.",
    button: "Autoriser la caméra",
    skip: "Ignorer pour l'instant",
  },
  it: {
    title: "Accesso fotocamera richiesto",
    text: "QuittungsCH ha bisogno di accedere alla fotocamera per fotografare le ricevute. Attiva il permesso della fotocamera nelle impostazioni.",
    button: "Consenti fotocamera",
    skip: "Salta per ora",
  },
  rm: {
    title: "Access a la camera necessari",
    text: "QuittungsCH ha basegn dad access a vostra camera per fotografar las quittanzas. Activai l'autorisaziun per la camera en ils parameters.",
    button: "Permetter camera",
    skip: "Sursiglir ussa",
  },
  en: {
    title: "Camera Access Required",
    text: "QuittungsCH needs access to your camera to photograph receipts. Please enable camera permission in your device settings.",
    button: "Allow Camera",
    skip: "Skip for Now",
  },
  tr: {
    title: "Kamera Erişimi Gerekli",
    text: "QuittungsCH, makbuzlarınızı fotoğraflamak için kameranıza erişmesi gerekiyor. Lütfen ayarlardan kamera iznini etkinleştirin.",
    button: "Kamera İznini Ver",
    skip: "Şimdilik Atla",
  },
  sq: {
    title: "Kamera Kërkon Leje",
    text: "QuittungsCH ka nevojë për akses në kamerën tuaj për të fotografuar faturat. Ju lutemi aktivizoni lejen e kamerës në cilësimet.",
    button: "Lejo Kamerën",
    skip: "Kalo Tani",
  },
};
