import { getSession } from "@/lib/auth";
import { prisma } from "@spezo/db/client";
import { isPaymentEnabled } from "@spezo/payments/feature-flags";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@spezo/ui";
import { Button } from "@spezo/ui";
import { LanguageSelector } from "@/components/settings/language-selector";
import { cookies } from "next/headers";
import type { SupportedLanguage } from "@spezo/i18n";

export const metadata = { title: "Einstellungen" };

const T = {
  de: {
    title: "Einstellungen",
    subtitle: "Konto & Abonnement",
    account: "Konto",
    email: "E-Mail",
    company: "Firmenname",
    plan: "Plan",
    trial_ends: "Trial endet",
    subscription: "Abonnement",
    subscription_desc: "CHF 10 / Monat · Kündigung jederzeit möglich",
    payment_soon: "Zahlungen folgen bald – kostenlose Nutzung bis zum Launch",
    status: "Status",
    next_payment: "Nächste Zahlung",
    manage_subscription: "Abonnement verwalten",
    subscribe_now: "Jetzt abonnieren",
    language_title: "Sprache / Langue / Lingua / Lingua",
    language_desc: "Wählen Sie Ihre bevorzugte Sprache",
    privacy: "Datenschutz",
    privacy_1: "Alle Daten werden ausschliesslich in der Schweiz gespeichert (DSG-konform).",
    privacy_2: "OCR-Analysen werden via Google Cloud Vision und Claude (Anthropic) durchgeführt.",
    privacy_3: "Belegbilder werden verschlüsselt gespeichert und nie öffentlich zugänglich gemacht.",
  },
  fr: {
    title: "Paramètres",
    subtitle: "Compte & Abonnement",
    account: "Compte",
    email: "E-Mail",
    company: "Nom de l'entreprise",
    plan: "Plan",
    trial_ends: "Essai se termine",
    subscription: "Abonnement",
    subscription_desc: "CHF 10 / mois · Résiliation possible à tout moment",
    payment_soon: "Paiements bientôt disponibles – utilisation gratuite jusqu'au lancement",
    status: "Statut",
    next_payment: "Prochain paiement",
    manage_subscription: "Gérer l'abonnement",
    subscribe_now: "S'abonner maintenant",
    language_title: "Langue / Sprache / Lingua / Lingua",
    language_desc: "Choisissez votre langue préférée",
    privacy: "Confidentialité",
    privacy_1: "Toutes les données sont stockées exclusivement en Suisse (conforme LPD).",
    privacy_2: "Les analyses OCR sont effectuées via Google Cloud Vision et Claude (Anthropic).",
    privacy_3: "Les images de reçus sont chiffrées et jamais accessibles publiquement.",
  },
  it: {
    title: "Impostazioni",
    subtitle: "Account & Abbonamento",
    account: "Account",
    email: "E-Mail",
    company: "Nome azienda",
    plan: "Piano",
    trial_ends: "Prova termina",
    subscription: "Abbonamento",
    subscription_desc: "CHF 10 / mese · Disdetta possibile in qualsiasi momento",
    payment_soon: "Pagamenti presto disponibili – uso gratuito fino al lancio",
    status: "Stato",
    next_payment: "Prossimo pagamento",
    manage_subscription: "Gestisci abbonamento",
    subscribe_now: "Abbonati ora",
    language_title: "Lingua / Langue / Sprache / Lingua",
    language_desc: "Scegli la tua lingua preferita",
    privacy: "Privacy",
    privacy_1: "Tutti i dati sono archiviati esclusivamente in Svizzera (conforme LPD).",
    privacy_2: "Le analisi OCR vengono effettuate tramite Google Cloud Vision e Claude (Anthropic).",
    privacy_3: "Le immagini delle ricevute sono crittografate e mai accessibili pubblicamente.",
  },
  rm: {
    title: "Parameters",
    subtitle: "Conto & Abonnament",
    account: "Conto",
    email: "E-Mail",
    company: "Num da la firma",
    plan: "Plan",
    trial_ends: "Prova terminescha",
    subscription: "Abonnament",
    subscription_desc: "CHF 10 / mais · Rescissiun pussaivel en mintga mument",
    payment_soon: "Pajaments suondan bainprest – utilisaziun gratuita fin al launch",
    status: "Status",
    next_payment: "Proxim pajament",
    manage_subscription: "Administrar abonnament",
    subscribe_now: "Abonnar ussa",
    language_title: "Lingua / Langue / Sprache / Lingua",
    language_desc: "Tscherni Vostra lingua preferida",
    privacy: "Protecziun da datas",
    privacy_1: "Tut las datas vegnan memorisadas exclusivamain en Svizra (cunfurm LPD).",
    privacy_2: "Las analisis OCR vegnan fatgas via Google Cloud Vision e Claude (Anthropic).",
    privacy_3: "Las imagens da quittanzas vegnan encryptadas e nunzamei accessiblas publicamain.",
  },
  en: {
    title: "Settings",
    subtitle: "Account & Subscription",
    account: "Account",
    email: "Email",
    company: "Company name",
    plan: "Plan",
    trial_ends: "Trial ends",
    subscription: "Subscription",
    subscription_desc: "CHF 10 / month · Cancel anytime",
    payment_soon: "Payments coming soon – free use until launch",
    status: "Status",
    next_payment: "Next payment",
    manage_subscription: "Manage subscription",
    subscribe_now: "Subscribe now",
    language_title: "Language / Langue / Sprache / Lingua",
    language_desc: "Choose your preferred language",
    privacy: "Privacy",
    privacy_1: "All data is stored exclusively in Switzerland (FADP compliant).",
    privacy_2: "OCR analysis is performed via Google Cloud Vision and Claude (Anthropic).",
    privacy_3: "Receipt images are encrypted and never publicly accessible.",
  },
  tr: {
    title: "Ayarlar",
    subtitle: "Hesap & Abonelik",
    account: "Hesap",
    email: "E-Posta",
    company: "Şirket adı",
    plan: "Plan",
    trial_ends: "Deneme bitiyor",
    subscription: "Abonelik",
    subscription_desc: "CHF 10 / ay · İstediğiniz zaman iptal edin",
    payment_soon: "Ödemeler yakında geliyor – lansmanına kadar ücretsiz kullanım",
    status: "Durum",
    next_payment: "Sonraki ödeme",
    manage_subscription: "Aboneliği yönet",
    subscribe_now: "Şimdi abone ol",
    language_title: "Dil / Langue / Sprache / Lingua",
    language_desc: "Tercih ettiğiniz dili seçin",
    privacy: "Gizlilik",
    privacy_1: "Tüm veriler yalnızca İsviçre'de saklanmaktadır (KVKK uyumlu).",
    privacy_2: "OCR analizleri Google Cloud Vision ve Claude (Anthropic) aracılığıyla yapılmaktadır.",
    privacy_3: "Makbuz görüntüleri şifrelenir ve asla kamuya açık hale getirilmez.",
  },
  sq: {
    title: "Cilësimet",
    subtitle: "Llogaria & Abonimi",
    account: "Llogaria",
    email: "E-Mail",
    company: "Emri i kompanisë",
    plan: "Plani",
    trial_ends: "Prova mbaron",
    subscription: "Abonimi",
    subscription_desc: "CHF 10 / muaj · Anulim i mundshëm në çdo kohë",
    payment_soon: "Pagesat vijnë së shpejti – përdorim falas deri në lansim",
    status: "Statusi",
    next_payment: "Pagesa tjetër",
    manage_subscription: "Menaxho abonimin",
    subscribe_now: "Abonohu tani",
    language_title: "Gjuha / Langue / Sprache / Lingua",
    language_desc: "Zgjidhni gjuhën tuaj të preferuar",
    privacy: "Privatësia",
    privacy_1: "Të gjitha të dhënat ruhen ekskluzivisht në Zvicër (konforme me ligjin).",
    privacy_2: "Analizat OCR kryhen nëpërmjet Google Cloud Vision dhe Claude (Anthropic).",
    privacy_3: "Imazhet e faturave janë të enkriptuara dhe asnjëherë të aksesueshme publikisht.",
  },
} satisfies Record<SupportedLanguage, Record<string, string>>;

export default async function SettingsPage() {
  const session = await getSession();
  if (!session?.user) return null;

  const lang = (cookies().get("spezo_lang")?.value ?? "de") as SupportedLanguage;
  const t = T[lang] ?? T.de;

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.tenantId },
    include: { subscriptions: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  const subscription = tenant?.subscriptions[0];
  const paymentEnabled = isPaymentEnabled();

  return (
    <div className="p-8 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <p className="text-gray-500 mt-1">{t.subtitle}</p>
      </div>

      {/* Account info */}
      <Card>
        <CardHeader>
          <CardTitle>{t.account}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{t.email}</span>
            <span className="font-medium">{session.user.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{t.company}</span>
            <span className="font-medium">{tenant?.name ?? "-"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{t.plan}</span>
            <span className="font-medium capitalize">{tenant?.plan.toLowerCase() ?? "-"}</span>
          </div>
          {tenant?.trialEndsAt && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{t.trial_ends}</span>
              <span className="font-medium">
                {new Date(tenant.trialEndsAt).toLocaleDateString("de-CH")}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>{t.subscription}</CardTitle>
          <CardDescription>{t.subscription_desc}</CardDescription>
        </CardHeader>
        <CardContent>
          {!paymentEnabled ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <p className="text-emerald-700 text-sm font-medium">
                {t.payment_soon}
              </p>
            </div>
          ) : subscription ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t.status}</span>
                <span className={`font-medium capitalize ${
                  subscription.status === "ACTIVE"
                    ? "text-green-600"
                    : subscription.status === "TRIALING"
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}>
                  {subscription.status}
                </span>
              </div>
              {subscription.currentPeriodEnd && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t.next_payment}</span>
                  <span className="font-medium">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString("de-CH")}
                  </span>
                </div>
              )}
              <Link href="/api/payments/portal">
                <Button variant="outline" className="w-full mt-2">
                  {t.manage_subscription}
                </Button>
              </Link>
            </div>
          ) : (
            <Link href="/checkout">
              <Button className="w-full">{t.subscribe_now}</Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader>
          <CardTitle>{t.language_title}</CardTitle>
          <CardDescription>{t.language_desc}</CardDescription>
        </CardHeader>
        <CardContent>
          <LanguageSelector current={tenant?.preferredLanguage ?? "de"} />
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle>{t.privacy}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>{t.privacy_1}</p>
          <p>{t.privacy_2}</p>
          <p>{t.privacy_3}</p>
        </CardContent>
      </Card>
    </div>
  );
}
