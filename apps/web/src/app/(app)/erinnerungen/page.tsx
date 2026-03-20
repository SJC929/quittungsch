"use client";

import { useState, useEffect } from "react";
import { Button } from "@spezo/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@spezo/ui";
import { Input } from "@spezo/ui";
import { Label } from "@spezo/ui";
import { Bell, Info } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

interface ReminderSettings {
  weeklyEnabled: boolean;
  vatEnabled: boolean;
  yearEndEnabled: boolean;
  email: string;
}

const DEFAULT_SETTINGS: ReminderSettings = {
  weeklyEnabled: false,
  vatEnabled: true,
  yearEndEnabled: true,
  email: "",
};

const T = {
  de: {
    title: "Belegfrist-Erinnerungen",
    subtitle: "E-Mail Erinnerungen für wichtige Termine",
    coming_soon: "E-Mail Erinnerungen werden aktiviert sobald wir den E-Mail Service eingerichtet haben. Einstellungen werden bereits gespeichert.",
    weekly_title: "Wöchentliche Erinnerung",
    weekly_desc: "Jeden Montag: Belege der letzten Woche hochladen",
    vat_title: "MwSt-Abrechnung",
    vat_desc: "2 Wochen vor Quartalsende: MwSt-Abrechnung vorbereiten",
    year_title: "Jahresabschluss",
    year_desc: "1. Dezember: Jahresabschluss und Steuererklärung vorbereiten",
    email_title: "Erinnerungen per E-Mail",
    email_label: "Erinnerungen an diese E-Mail senden",
    email_hint: "Lassen Sie das Feld leer, um Ihre Konto-E-Mail zu verwenden.",
    save: "Einstellungen speichern",
    saved: "✓ Einstellungen gespeichert",
  },
  fr: {
    title: "Rappels de délais",
    subtitle: "Rappels par e-mail pour les échéances importantes",
    coming_soon: "Les rappels par e-mail seront activés dès que nous aurons configuré le service e-mail. Les paramètres sont déjà sauvegardés.",
    weekly_title: "Rappel hebdomadaire",
    weekly_desc: "Chaque lundi : télécharger les reçus de la semaine précédente",
    vat_title: "Décompte TVA",
    vat_desc: "2 semaines avant la fin du trimestre : préparer le décompte TVA",
    year_title: "Bilan annuel",
    year_desc: "1er décembre : préparer le bilan annuel et la déclaration d'impôts",
    email_title: "Rappels par e-mail",
    email_label: "Envoyer les rappels à cet e-mail",
    email_hint: "Laissez le champ vide pour utiliser l'e-mail de votre compte.",
    save: "Enregistrer les paramètres",
    saved: "✓ Paramètres enregistrés",
  },
  it: {
    title: "Promemoria scadenze",
    subtitle: "Promemoria via e-mail per le scadenze importanti",
    coming_soon: "I promemoria via e-mail saranno attivati non appena configureremo il servizio e-mail. Le impostazioni vengono già salvate.",
    weekly_title: "Promemoria settimanale",
    weekly_desc: "Ogni lunedì: caricare le ricevute della settimana precedente",
    vat_title: "Rendiconto IVA",
    vat_desc: "2 settimane prima della fine del trimestre: preparare il rendiconto IVA",
    year_title: "Chiusura annuale",
    year_desc: "1° dicembre: preparare la chiusura annuale e la dichiarazione dei redditi",
    email_title: "Promemoria via e-mail",
    email_label: "Inviare i promemoria a questa e-mail",
    email_hint: "Lascia il campo vuoto per usare l'e-mail del tuo account.",
    save: "Salva impostazioni",
    saved: "✓ Impostazioni salvate",
  },
  rm: {
    title: "Rememoranzas da termins",
    subtitle: "Rememoranzas per e-mail per termins impurtants",
    coming_soon: "Rememoranzas per e-mail vegnan activadas subit ch'avain configuro il servetsch. Parameters vegnan gia memorisads.",
    weekly_title: "Rememoranza settimana",
    weekly_desc: "Mintg'enviern: chargar quittanzas da la settimana passada",
    vat_title: "Decontaziun IVA",
    vat_desc: "2 emnas avant la fin dal quartal: preparar la decontaziun IVA",
    year_title: "Conclusiun annuala",
    year_desc: "1. december: preparar la conclusiun annuala e la declaraziun fiscala",
    email_title: "Rememoranzas per e-mail",
    email_label: "Trametter rememoranzas a quest e-mail",
    email_hint: "Laschar il champ vid per utilisar l'e-mail dal conto.",
    save: "Memorischar parameters",
    saved: "✓ Parameters memorisads",
  },
  en: {
    title: "Receipt Reminders",
    subtitle: "Email reminders for important deadlines",
    coming_soon: "Email reminders will be activated once we have set up the email service. Settings are already being saved.",
    weekly_title: "Weekly reminder",
    weekly_desc: "Every Monday: upload last week's receipts",
    vat_title: "VAT return",
    vat_desc: "2 weeks before quarter end: prepare VAT return",
    year_title: "Year-end closing",
    year_desc: "December 1st: prepare year-end closing and tax return",
    email_title: "Reminders by email",
    email_label: "Send reminders to this email",
    email_hint: "Leave blank to use your account email.",
    save: "Save settings",
    saved: "✓ Settings saved",
  },
  tr: {
    title: "Makbuz Hatırlatıcıları",
    subtitle: "Önemli tarihler için e-posta hatırlatıcıları",
    coming_soon: "E-posta hizmeti kurulduktan sonra e-posta hatırlatıcıları etkinleştirilecektir. Ayarlar zaten kaydediliyor.",
    weekly_title: "Haftalık hatırlatıcı",
    weekly_desc: "Her Pazartesi: geçen haftanın makbuzlarını yükleyin",
    vat_title: "KDV beyannamesi",
    vat_desc: "Çeyrek sonu öncesi 2 hafta: KDV beyannamesini hazırlayın",
    year_title: "Yıl sonu kapanışı",
    year_desc: "1 Aralık: yıl sonu kapanışı ve vergi beyannamesini hazırlayın",
    email_title: "E-posta ile hatırlatıcılar",
    email_label: "Hatırlatıcıları bu e-postaya gönder",
    email_hint: "Hesap e-postanızı kullanmak için boş bırakın.",
    save: "Ayarları kaydet",
    saved: "✓ Ayarlar kaydedildi",
  },
  sq: {
    title: "Kujtuesit e faturave",
    subtitle: "Kujtuese me e-mail për afate të rëndësishme",
    coming_soon: "Kujtueset me e-mail do të aktivizohen sapo të konfigurojmë shërbimin e-mail. Cilësimet po ruhen tashmë.",
    weekly_title: "Kujtues javor",
    weekly_desc: "Çdo të hënë: ngarkoni faturat e javës së kaluar",
    vat_title: "Deklarata e TVSH",
    vat_desc: "2 javë para fundit të tremujorit: përgatitni deklaratën e TVSH",
    year_title: "Mbyllja e vitit",
    year_desc: "1 dhjetor: përgatitni mbylljen e vitit dhe deklaratën tatimore",
    email_title: "Kujtuese me e-mail",
    email_label: "Dërgo kujtueset në këtë e-mail",
    email_hint: "Lini bosh për të përdorur e-mailin e llogarisë suaj.",
    save: "Ruaj cilësimet",
    saved: "✓ Cilësimet u ruajtën",
  },
};

interface ReminderCardProps {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

function ReminderCard({ title, description, enabled, onToggle }: ReminderCardProps) {
  return (
    <div className="flex items-start justify-between gap-4 p-5 bg-white border border-gray-100 rounded-xl hover:border-emerald-200 transition-colors">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${enabled ? "bg-emerald-100" : "bg-gray-100"}`}>
          <Bell className={`h-5 w-5 ${enabled ? "text-emerald-600" : "text-gray-400"}`} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${enabled ? "bg-emerald-500" : "bg-gray-200"}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  );
}

export default function ErinnerungenPage() {
  const { lang } = useLanguage();
  const t = T[lang] ?? T.de;

  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("spezo_reminder_settings");
    if (stored) {
      try { setSettings(JSON.parse(stored) as ReminderSettings); } catch { /* ignore */ }
    }
  }, []);

  function handleSave() {
    localStorage.setItem("spezo_reminder_settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
          <Bell className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-sm text-gray-500">{t.subtitle}</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700">{t.coming_soon}</p>
      </div>

      <div className="space-y-3">
        <ReminderCard
          title={t.weekly_title}
          description={t.weekly_desc}
          enabled={settings.weeklyEnabled}
          onToggle={() => setSettings({ ...settings, weeklyEnabled: !settings.weeklyEnabled })}
        />
        <ReminderCard
          title={t.vat_title}
          description={t.vat_desc}
          enabled={settings.vatEnabled}
          onToggle={() => setSettings({ ...settings, vatEnabled: !settings.vatEnabled })}
        />
        <ReminderCard
          title={t.year_title}
          description={t.year_desc}
          enabled={settings.yearEndEnabled}
          onToggle={() => setSettings({ ...settings, yearEndEnabled: !settings.yearEndEnabled })}
        />
      </div>

      <Card className="border-emerald-100">
        <CardHeader>
          <CardTitle className="text-base">{t.email_title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="reminder-email">{t.email_label}</Label>
            <Input
              id="reminder-email"
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              placeholder="max@muster.ch"
              className="mt-1"
            />
            <p className="text-xs text-gray-400 mt-1.5">{t.email_hint}</p>
          </div>
        </CardContent>
      </Card>

      <Button className="w-full bg-emerald-500 hover:bg-emerald-600" onClick={handleSave}>
        {saved ? t.saved : t.save}
      </Button>
    </div>
  );
}
