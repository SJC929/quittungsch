"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@spezo/ui";
import { Input } from "@spezo/ui";
import { Label } from "@spezo/ui";
import { LogoWithText } from "@/components/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { SupportedLanguage } from "@spezo/i18n";

const T = {
  de: {
    tagline: "14 Tage kostenlos testen",
    title: "Konto erstellen",
    subtitle: "Kostenlos, keine Kreditkarte nötig",
    name: "Name / Firma",
    email: "E-Mail",
    password: "Passwort",
    passwordHint: "Min. 8 Zeichen",
    submit: "Kostenlos registrieren",
    loading: "Konto wird erstellt...",
    terms: "Mit der Registrierung stimmen Sie unseren AGB zu. Alle Daten werden in der Schweiz gespeichert.",
    alreadyAccount: "Bereits ein Konto?",
    login: "Anmelden",
    footer: "🇨🇭 Alle Daten werden in der Schweiz gespeichert",
    errorFailed: "Registrierung fehlgeschlagen",
  },
  fr: {
    tagline: "14 jours d'essai gratuit",
    title: "Créer un compte",
    subtitle: "Gratuit, aucune carte de crédit requise",
    name: "Nom / Entreprise",
    email: "E-Mail",
    password: "Mot de passe",
    passwordHint: "Min. 8 caractères",
    submit: "S'inscrire gratuitement",
    loading: "Création du compte...",
    terms: "En vous inscrivant, vous acceptez nos CGU. Toutes les données sont stockées en Suisse.",
    alreadyAccount: "Déjà un compte ?",
    login: "Se connecter",
    footer: "🇨🇭 Toutes les données sont stockées en Suisse",
    errorFailed: "Échec de l'inscription",
  },
  it: {
    tagline: "14 giorni di prova gratuita",
    title: "Crea un account",
    subtitle: "Gratuito, nessuna carta di credito richiesta",
    name: "Nome / Azienda",
    email: "E-Mail",
    password: "Password",
    passwordHint: "Min. 8 caratteri",
    submit: "Registrati gratuitamente",
    loading: "Creazione account...",
    terms: "Registrandoti accetti i nostri termini. Tutti i dati sono archiviati in Svizzera.",
    alreadyAccount: "Hai già un account?",
    login: "Accedi",
    footer: "🇨🇭 Tutti i dati sono archiviati in Svizzera",
    errorFailed: "Registrazione fallita",
  },
  rm: {
    tagline: "14 dis da prova gratuita",
    title: "Crear in conto",
    subtitle: "Gratuit, nagina carta da credit necessaria",
    name: "Num / Firma",
    email: "E-Mail",
    password: "Pled-clav",
    passwordHint: "Min. 8 caracters",
    submit: "Registrar gratuitamain",
    loading: "Conto vegn creà...",
    terms: "Cun la registraziun acceptais vus nossas CGU. Tut las datas vegnan memorisadas en Svizra.",
    alreadyAccount: "Avais vus gia in conto?",
    login: "S'annunziar",
    footer: "🇨🇭 Tut las datas vegnan memorisadas en Svizra",
    errorFailed: "Registraziun n'ha betg reussì",
  },
  en: {
    tagline: "14-day free trial",
    title: "Create an account",
    subtitle: "Free, no credit card required",
    name: "Name / Company",
    email: "Email",
    password: "Password",
    passwordHint: "Min. 8 characters",
    submit: "Register for free",
    loading: "Creating account...",
    terms: "By registering you agree to our Terms. All data is stored in Switzerland.",
    alreadyAccount: "Already have an account?",
    login: "Sign in",
    footer: "🇨🇭 All data is stored in Switzerland",
    errorFailed: "Registration failed",
  },
  tr: {
    tagline: "14 günlük ücretsiz deneme",
    title: "Hesap oluştur",
    subtitle: "Ücretsiz, kredi kartı gerekmez",
    name: "Ad / Şirket",
    email: "E-Posta",
    password: "Şifre",
    passwordHint: "Min. 8 karakter",
    submit: "Ücretsiz kayıt ol",
    loading: "Hesap oluşturuluyor...",
    terms: "Kaydolarak şartlarımızı kabul etmiş olursunuz. Tüm veriler İsviçre'de saklanmaktadır.",
    alreadyAccount: "Zaten hesabınız var mı?",
    login: "Giriş Yap",
    footer: "🇨🇭 Tüm veriler İsviçre'de saklanmaktadır",
    errorFailed: "Kayıt başarısız",
  },
  sq: {
    tagline: "14 ditë provë falas",
    title: "Krijo një llogari",
    subtitle: "Falas, nuk kërkohet kartë krediti",
    name: "Emri / Kompania",
    email: "E-Mail",
    password: "Fjalëkalim",
    passwordHint: "Min. 8 karaktere",
    submit: "Regjistrohu falas",
    loading: "Duke krijuar llogarinë...",
    terms: "Duke u regjistruar pranoni kushtet tona. Të gjitha të dhënat ruhen në Zvicër.",
    alreadyAccount: "Keni tashmë një llogari?",
    login: "Hyr",
    footer: "🇨🇭 Të gjitha të dhënat ruhen në Zvicër",
    errorFailed: "Regjistrimi dështoi",
  },
} satisfies Record<SupportedLanguage, Record<string, string>>;

export default function RegisterPage() {
  const router = useRouter();
  const [lang, setLang] = useState<SupportedLanguage>("de");
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const t = T[lang];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json() as { error?: string };

    if (!res.ok) {
      setError(data.error ?? t.errorFailed);
      setLoading(false);
      return;
    }

    router.push("/onboarding");
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F0FDF9" }}>
      {/* Top bar with language switcher */}
      <div className="flex justify-end p-4 pr-6">
        <LanguageSwitcher current={lang} onChange={setLang} />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <LogoWithText iconSize={48} textSize="xl" />
          </div>
          <p className="text-center text-gray-500 -mt-4 mb-8 text-sm">{t.tagline}</p>

          <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-8">
            <h2 className="text-xl font-bold mb-2 text-gray-900">{t.title}</h2>
            <p className="text-sm text-gray-400 mb-6">{t.subtitle}</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
              <div>
                <Label htmlFor="name">{t.name}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Max Muster"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">{t.email}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="max@muster.ch"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">{t.password}</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={t.passwordHint}
                  required
                  minLength={8}
                  className="mt-1"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-sm font-semibold bg-emerald-700 hover:bg-emerald-800"
                disabled={loading}
              >
                {loading ? t.loading : t.submit}
              </Button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-5 leading-relaxed">{t.terms}</p>

            <p className="text-center text-sm text-gray-500 mt-4">
              {t.alreadyAccount}{" "}
              <Link href="/login" className="text-emerald-700 hover:underline font-semibold">
                {t.login}
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">{t.footer}</p>
        </div>
      </div>
    </div>
  );
}
