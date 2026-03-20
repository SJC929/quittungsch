"use client";

import { useState, useEffect } from "react";
import { Button } from "@spezo/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@spezo/ui";
import { UserCheck, Copy, ExternalLink, Trash2, Plus, Info } from "lucide-react";

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

export default function TreuhanderPage() {
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <UserCheck className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Treuhänder-Zugang</h1>
            <p className="text-sm text-gray-500">Read-only Zugang für Ihren Treuhänder</p>
          </div>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={generateLink}>
          <Plus className="h-4 w-4 mr-2" />
          Zugangslink generieren
        </Button>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800">Read-only Zugang</p>
          <p className="text-sm text-blue-600 mt-0.5">
            Ihr Treuhänder sieht alle Belege, Exporte und Kategorien – kann aber nichts ändern oder löschen.
            Der Link ist 1 Jahr gültig und kann jederzeit deaktiviert werden.
          </p>
        </div>
      </div>

      {/* Description */}
      <Card className="border-emerald-100">
        <CardHeader>
          <CardTitle className="text-base">Wie funktioniert es?</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm text-gray-600">
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
              <span>Generieren Sie einen sicheren Zugangslink mit dem Button oben.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
              <span>Kopieren Sie den Link und senden Sie ihn an Ihren Treuhänder per E-Mail.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
              <span>Ihr Treuhänder kann alle Ihre Belege und Exporte einsehen – ohne Login.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
              <span>Deaktivieren Sie den Link jederzeit in der Liste unten.</span>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Active links */}
      <Card className="border-emerald-100">
        <CardHeader>
          <CardTitle className="text-base">Aktive Links ({links.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {links.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <UserCheck className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Noch kein Zugangslink erstellt</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {links.map((link) => (
                <div key={link.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span className="text-xs font-medium text-emerald-600 uppercase">Aktiv</span>
                        <span className="text-xs text-gray-400">
                          Erstellt am {new Date(link.createdAt).toLocaleDateString("de-CH")}
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
                        {copied === link.uuid ? "Kopiert!" : "Kopieren"}
                      </button>
                      <button
                        onClick={() => deactivateLink(link.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Deaktivieren
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
