"use client";

import { useState, useEffect } from "react";
import { Button } from "@spezo/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@spezo/ui";
import { UserCheck, Copy, ExternalLink, Trash2, Plus, Info } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

interface ShareLink {
  id: string;
  uuid: string;
  createdAt: string;
  active: boolean;
}

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const T = {
  de: {
    title: "Treuhänder-Zugang",
    subtitle: "Read-only Zugang für Ihren Treuhänder",
    generate: "Zugangslink generieren",
    info_title: "Read-only Zugang",
    info_text: "Ihr Treuhänder sieht alle Belege, Exporte und Kategorien – kann aber nichts ändern oder löschen. Der Link ist 1 Jahr gültig und kann jederzeit deaktiviert werden.",
    how_title: "Wie funktioniert es?",
    step1: "Generieren Sie einen sicheren Zugangslink mit dem Button oben.",
    step2: "Kopieren Sie den Link und senden Sie ihn an Ihren Treuhänder per E-Mail.",
    step3: "Ihr Treuhänder kann alle Ihre Belege und Exporte einsehen – ohne Login.",
    step4: "Deaktivieren Sie den Link jederzeit in der Liste unten.",
    links_title: "Aktive Links",
    no_links: "Noch kein Zugangslink erstellt",
    active: "Aktiv",
    created: "Erstellt am",
    copy: "Kopieren",
    copied: "Kopiert!",
    deactivate: "Deaktivieren",
  },
  fr: {
    title: "Accès fiduciaire",
    subtitle: "Accès en lecture seule pour votre fiduciaire",
    generate: "Générer un lien d'accès",
    info_title: "Accès en lecture seule",
    info_text: "Votre fiduciaire voit tous les reçus, exports et catégories – mais ne peut rien modifier ni supprimer. Le lien est valable 1 an et peut être désactivé à tout moment.",
    how_title: "Comment ça fonctionne ?",
    step1: "Générez un lien d'accès sécurisé avec le bouton ci-dessus.",
    step2: "Copiez le lien et envoyez-le à votre fiduciaire par e-mail.",
    step3: "Votre fiduciaire peut consulter tous vos reçus et exports – sans connexion.",
    step4: "Désactivez le lien à tout moment dans la liste ci-dessous.",
    links_title: "Liens actifs",
    no_links: "Aucun lien d'accès créé",
    active: "Actif",
    created: "Créé le",
    copy: "Copier",
    copied: "Copié !",
    deactivate: "Désactiver",
  },
  it: {
    title: "Accesso fiduciario",
    subtitle: "Accesso in sola lettura per il tuo fiduciario",
    generate: "Genera link di accesso",
    info_title: "Accesso in sola lettura",
    info_text: "Il tuo fiduciario vede tutte le ricevute, gli export e le categorie – ma non può modificare o eliminare nulla. Il link è valido 1 anno e può essere disattivato in qualsiasi momento.",
    how_title: "Come funziona?",
    step1: "Genera un link di accesso sicuro con il pulsante sopra.",
    step2: "Copia il link e invialo al tuo fiduciario via e-mail.",
    step3: "Il tuo fiduciario può visualizzare tutte le ricevute e gli export – senza login.",
    step4: "Disattiva il link in qualsiasi momento dall'elenco sottostante.",
    links_title: "Link attivi",
    no_links: "Nessun link di accesso creato",
    active: "Attivo",
    created: "Creato il",
    copy: "Copia",
    copied: "Copiato!",
    deactivate: "Disattiva",
  },
  rm: {
    title: "Access dal fiduciar",
    subtitle: "Access da lectura per Voss fiduciar",
    generate: "Generar link d'access",
    info_title: "Access da lectura sulettamain",
    info_text: "Voss fiduciar vesa tut ils quittanzas, exports e categorias – ma na po pon ni midar ni stizzar. Il link è valid 1 onn ed po vegnir deactivà en mintga mument.",
    how_title: "Cun funcziuna quai?",
    step1: "Generai in link d'access segir cun il buttun sura.",
    step2: "Copiai il link e tramettai el a Voss fiduciar per e-mail.",
    step3: "Voss fiduciar po vesair tut ils quittanzas ed exports – senza login.",
    step4: "Deactivai il link en mintga mument en la glista sutvart.",
    links_title: "Links actifs",
    no_links: "Anc nagin link d'access creà",
    active: "Actif",
    created: "Creà ils",
    copy: "Copiar",
    copied: "Copià!",
    deactivate: "Deactivar",
  },
  en: {
    title: "Accountant Access",
    subtitle: "Read-only access for your accountant",
    generate: "Generate access link",
    info_title: "Read-only access",
    info_text: "Your accountant can view all receipts, exports and categories – but cannot modify or delete anything. The link is valid for 1 year and can be deactivated at any time.",
    how_title: "How does it work?",
    step1: "Generate a secure access link using the button above.",
    step2: "Copy the link and send it to your accountant by email.",
    step3: "Your accountant can view all your receipts and exports – without logging in.",
    step4: "Deactivate the link at any time from the list below.",
    links_title: "Active links",
    no_links: "No access links created yet",
    active: "Active",
    created: "Created on",
    copy: "Copy",
    copied: "Copied!",
    deactivate: "Deactivate",
  },
  tr: {
    title: "Muhasebeci Erişimi",
    subtitle: "Muhasebeciniz için salt okunur erişim",
    generate: "Erişim bağlantısı oluştur",
    info_title: "Salt okunur erişim",
    info_text: "Muhasebeciniz tüm makbuzları, dışa aktarımları ve kategorileri görebilir – ancak hiçbir şeyi değiştiremez veya silemez. Bağlantı 1 yıl geçerlidir ve istediğiniz zaman devre dışı bırakılabilir.",
    how_title: "Nasıl çalışır?",
    step1: "Yukarıdaki düğmeyi kullanarak güvenli bir erişim bağlantısı oluşturun.",
    step2: "Bağlantıyı kopyalayın ve muhasebecinize e-posta ile gönderin.",
    step3: "Muhasebeciniz tüm makbuzlarınızı ve dışa aktarımlarınızı görüntüleyebilir – oturum açmadan.",
    step4: "Bağlantıyı istediğiniz zaman aşağıdaki listeden devre dışı bırakın.",
    links_title: "Aktif bağlantılar",
    no_links: "Henüz erişim bağlantısı oluşturulmadı",
    active: "Aktif",
    created: "Oluşturulma tarihi",
    copy: "Kopyala",
    copied: "Kopyalandı!",
    deactivate: "Devre dışı bırak",
  },
  sq: {
    title: "Akses i Kontabilistit",
    subtitle: "Akses vetëm-lexim për kontabilistin tuaj",
    generate: "Gjeneroni lidhje aksesi",
    info_title: "Akses vetëm-lexim",
    info_text: "Kontabilisti juaj mund të shohë të gjitha faturat, eksportet dhe kategoritë – por nuk mund të ndryshojë ose fshijë asgjë. Lidhja është e vlefshme 1 vit dhe mund të çaktivizohet në çdo kohë.",
    how_title: "Si funksionon?",
    step1: "Gjeneroni një lidhje aksesi të sigurt duke përdorur butonin e mësipërm.",
    step2: "Kopjoni lidhjen dhe dërgojeni kontabilistit tuaj me e-mail.",
    step3: "Kontabilisti juaj mund të shohë të gjitha faturat dhe eksportet – pa hyrur.",
    step4: "Çaktivizoni lidhjen në çdo kohë nga lista e mëposhtme.",
    links_title: "Lidhje aktive",
    no_links: "Asnjë lidhje aksesi e krijuar ende",
    active: "Aktive",
    created: "Krijuar më",
    copy: "Kopjo",
    copied: "U kopjua!",
    deactivate: "Çaktivizo",
  },
};

export default function TreuhanderPage() {
  const { lang } = useLanguage();
  const t = T[lang] ?? T.de;

  const [links, setLinks] = useState<ShareLink[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("spezo_treuhander_links");
    if (stored) {
      try { setLinks(JSON.parse(stored) as ShareLink[]); } catch { /* ignore */ }
    }
  }, []);

  function saveLinks(updated: ShareLink[]) {
    setLinks(updated);
    localStorage.setItem("spezo_treuhander_links", JSON.stringify(updated));
  }

  function generateLink() {
    const newLink: ShareLink = {
      id: Date.now().toString(),
      uuid: generateUUID(),
      createdAt: new Date().toISOString(),
      active: true,
    };
    saveLinks([newLink, ...links]);
  }

  function deactivateLink(id: string) {
    saveLinks(links.filter((l) => l.id !== id));
  }

  function copyLink(uuid: string) {
    void navigator.clipboard.writeText(`https://spezo.ch/share/${uuid}`);
    setCopied(uuid);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <UserCheck className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
            <p className="text-sm text-gray-500">{t.subtitle}</p>
          </div>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={generateLink}>
          <Plus className="h-4 w-4 mr-2" />
          {t.generate}
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800">{t.info_title}</p>
          <p className="text-sm text-blue-600 mt-0.5">{t.info_text}</p>
        </div>
      </div>

      <Card className="border-emerald-100">
        <CardHeader>
          <CardTitle className="text-base">{t.how_title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm text-gray-600">
            {([t.step1, t.step2, t.step3, t.step4] as string[]).map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card className="border-emerald-100">
        <CardHeader>
          <CardTitle className="text-base">{t.links_title} ({links.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {links.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <UserCheck className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">{t.no_links}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {links.map((link) => (
                <div key={link.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span className="text-xs font-medium text-emerald-600 uppercase">{t.active}</span>
                        <span className="text-xs text-gray-400">
                          {t.created} {new Date(link.createdAt).toLocaleDateString("de-CH")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                        <ExternalLink className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        <code className="text-xs text-gray-600 truncate">
                          https://spezo.ch/share/{link.uuid}
                        </code>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => copyLink(link.uuid)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        {copied === link.uuid ? t.copied : t.copy}
                      </button>
                      <button
                        onClick={() => deactivateLink(link.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {t.deactivate}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
