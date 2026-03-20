"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
// lang state moved to global context
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@spezo/ui";
import { Input } from "@spezo/ui";
import { Label } from "@spezo/ui";
import { LogoIcon } from "@/components/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { SupportedLanguage } from "@spezo/i18n";
import { useLanguage } from "@/contexts/language-context";

const T = {
  de: {
    tagline: "Belege einfach erfassen – für Schweizer Selbständige",
    title: "Anmelden",
    email: "E-Mail",
    password: "Passwort",
    submit: "Anmelden",
    loading: "Lädt...",
    magicLink: "✨ Mit Magic Link anmelden",
    withPassword: "🔑 Mit Passwort anmelden",
    sendMagicLink: "Magic Link senden",
    noAccount: "Noch kein Konto?",
    register: "Kostenlos registrieren",
    magicSentTitle: "Magic Link gesendet!",
    magicSentText: "Bitte prüfen Sie Ihre E-Mail",
    magicSentSuffix: "und klicken Sie den Link.",
    errorInvalid: "Ungültige E-Mail oder Passwort.",
    errorMagic: "Magic Link konnte nicht gesendet werden.",
    footer: "🇨🇭 Alle Daten werden in der Schweiz gespeichert",
  },
  fr: {
    tagline: "Saisir facilement vos reçus – pour indépendants suisses",
    title: "Se connecter",
    email: "E-Mail",
    password: "Mot de passe",
    submit: "Se connecter",
    loading: "Chargement...",
    magicLink: "✨ Connexion avec Magic Link",
    withPassword: "🔑 Connexion avec mot de passe",
    sendMagicLink: "Envoyer le Magic Link",
    noAccount: "Pas encore de compte ?",
    register: "S'inscrire gratuitement",
    magicSentTitle: "Magic Link envoyé !",
    magicSentText: "Veuillez vérifier votre e-mail",
    magicSentSuffix: "et cliquer sur le lien.",
    errorInvalid: "E-mail ou mot de passe invalide.",
    errorMagic: "Le Magic Link n'a pas pu être envoyé.",
    footer: "🇨🇭 Toutes les données sont stockées en Suisse",
  },
  it: {
    tagline: "Gestisci le ricevute facilmente – per indipendenti svizzeri",
    title: "Accedi",
    email: "E-Mail",
    password: "Password",
    submit: "Accedi",
    loading: "Caricamento...",
    magicLink: "✨ Accedi con Magic Link",
    withPassword: "🔑 Accedi con password",
    sendMagicLink: "Invia Magic Link",
    noAccount: "Non hai un account?",
    register: "Registrati gratuitamente",
    magicSentTitle: "Magic Link inviato!",
    magicSentText: "Controlla la tua e-mail",
    magicSentSuffix: "e clicca sul link.",
    errorInvalid: "E-mail o password non validi.",
    errorMagic: "Impossibile inviare il Magic Link.",
    footer: "🇨🇭 Tutti i dati sono archiviati in Svizzera",
  },
  rm: {
    tagline: "Registrar quittanzas simpel – per independents svizzers",
    title: "S'annunziar",
    email: "E-Mail",
    password: "Pled-clav",
    submit: "S'annunziar",
    loading: "Chargament...",
    magicLink: "✨ Cun Magic Link",
    withPassword: "🔑 Cun pled-clav",
    sendMagicLink: "Trametter Magic Link",
    noAccount: "Anc nagin conto?",
    register: "Registrar gratuitamain",
    magicSentTitle: "Magic Link tramess!",
    magicSentText: "Controllai vostra e-mail",
    magicSentSuffix: "e cliccat sin il link.",
    errorInvalid: "E-Mail u pled-clav nunvalaivel.",
    errorMagic: "Magic Link n'ha betg pudì vegnir tramess.",
    footer: "🇨🇭 Tut las datas vegnan memorisadas en Svizra",
  },
  en: {
    tagline: "Capture receipts easily – for Swiss freelancers",
    title: "Sign in",
    email: "Email",
    password: "Password",
    submit: "Sign in",
    loading: "Loading...",
    magicLink: "✨ Sign in with Magic Link",
    withPassword: "🔑 Sign in with Password",
    sendMagicLink: "Send Magic Link",
    noAccount: "Don't have an account?",
    register: "Register for free",
    magicSentTitle: "Magic Link sent!",
    magicSentText: "Please check your email",
    magicSentSuffix: "and click the link.",
    errorInvalid: "Invalid email or password.",
    errorMagic: "Magic Link could not be sent.",
    footer: "🇨🇭 All data is stored in Switzerland",
  },
  tr: {
    tagline: "Makbuzları kolayca kaydedin – İsviçreli serbest çalışanlar için",
    title: "Giriş Yap",
    email: "E-Posta",
    password: "Şifre",
    submit: "Giriş Yap",
    loading: "Yükleniyor...",
    magicLink: "✨ Magic Link ile Giriş",
    withPassword: "🔑 Şifre ile Giriş",
    sendMagicLink: "Magic Link Gönder",
    noAccount: "Hesabınız yok mu?",
    register: "Ücretsiz kayıt ol",
    magicSentTitle: "Magic Link gönderildi!",
    magicSentText: "Lütfen e-postanızı kontrol edin",
    magicSentSuffix: "ve bağlantıya tıklayın.",
    errorInvalid: "Geçersiz e-posta veya şifre.",
    errorMagic: "Magic Link gönderilemedi.",
    footer: "🇨🇭 Tüm veriler İsviçre'de saklanmaktadır",
  },
  sq: {
    tagline: "Kapni faturat lehtë – për të vetëpunësuarit zviceranë",
    title: "Hyr",
    email: "E-Mail",
    password: "Fjalëkalim",
    submit: "Hyr",
    loading: "Duke ngarkuar...",
    magicLink: "✨ Hyr me Magic Link",
    withPassword: "🔑 Hyr me fjalëkalim",
    sendMagicLink: "Dërgo Magic Link",
    noAccount: "Nuk keni llogari?",
    register: "Regjistrohu falas",
    magicSentTitle: "Magic Link u dërgua!",
    magicSentText: "Ju lutemi kontrolloni e-mailin tuaj",
    magicSentSuffix: "dhe klikoni lidhjen.",
    errorInvalid: "E-mail ose fjalëkalim i pavlefshëm.",
    errorMagic: "Magic Link nuk mund të dërgohej.",
    footer: "🇨🇭 Të gjitha të dhënat ruhen në Zvicër",
  },
} satisfies Record<SupportedLanguage, Record<string, string>>;

export default function LoginPage() {
  const router = useRouter();
  const { lang, setLang } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"password" | "magic">("password");

  const t = T[lang];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (mode === "magic") {
      const result = await signIn("email", { email, redirect: false });
      if (result?.ok) {
        setMagicLinkSent(true);
      } else {
        setError(t.errorMagic);
      }
    } else {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.ok) {
        router.push("/dashboard");
      } else {
        setError(t.errorInvalid);
      }
    }

    setLoading(false);
  }

  if (magicLinkSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-10 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📧</span>
          </div>
          <h2 className="text-xl font-bold mb-2 text-gray-900">{t.magicSentTitle}</h2>
          <p className="text-gray-500 text-sm">
            {t.magicSentText} <strong className="text-gray-800">{email}</strong> {t.magicSentSuffix}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top bar with language switcher */}
      <div className="flex justify-end p-4 pr-6">
        <LanguageSwitcher current={lang} onChange={setLang} />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="max-w-sm w-full">
          {/* Logo – prominent and centered */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-200 mb-4">
              <LogoIcon size={52} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Spezo</h1>
            <p className="text-sm text-gray-500 mt-1">{t.tagline}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-lg font-semibold mb-6 text-gray-900">{t.title}</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-gray-700">{t.email}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="max@muster.ch"
                  required
                  className="mt-1 border-gray-200 focus:border-emerald-400"
                />
              </div>

              {mode === "password" && (
                <div>
                  <Label htmlFor="password" className="text-gray-700">{t.password}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1 border-gray-200 focus:border-emerald-400"
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                disabled={loading}
              >
                {loading ? t.loading : mode === "magic" ? t.sendMagicLink : t.submit}
              </Button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-gray-400">oder</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-10 border-gray-200 text-gray-600 hover:bg-gray-50 text-sm"
              onClick={() => setMode(mode === "password" ? "magic" : "password")}
            >
              {mode === "password" ? t.magicLink : t.withPassword}
            </Button>

            <p className="text-center text-sm text-gray-500 mt-6">
              {t.noAccount}{" "}
              <Link href="/register" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                {t.register}
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">{t.footer}</p>
        </div>
      </div>
    </div>
  );
}
