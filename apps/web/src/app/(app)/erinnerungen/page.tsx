"use client";

import { useState, useEffect } from "react";
import { Button } from "@spezo/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@spezo/ui";
import { Input } from "@spezo/ui";
import { Label } from "@spezo/ui";
import { Bell, Info } from "lucide-react";

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
        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
          enabled ? "bg-emerald-500" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

export default function ErinnerungenPage() {
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
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
          <Bell className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Belegfrist-Erinnerungen</h1>
          <p className="text-sm text-gray-500">E-Mail Erinnerungen für wichtige Termine</p>
        </div>
      </div>

      {/* Coming soon notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700">
          E-Mail Erinnerungen werden aktiviert sobald wir den E-Mail Service eingerichtet haben.
          Einstellungen werden bereits gespeichert.
        </p>
      </div>

      {/* Reminder toggles */}
      <div className="space-y-3">
        <ReminderCard
          title="Wöchentliche Erinnerung"
          description="Jeden Montag: Belege der letzten Woche hochladen"
          enabled={settings.weeklyEnabled}
          onToggle={() => setSettings({ ...settings, weeklyEnabled: !settings.weeklyEnabled })}
        />
        <ReminderCard
          title="MwSt-Abrechnung"
          description="2 Wochen vor Quartalsende: MwSt-Abrechnung vorbereiten"
          enabled={settings.vatEnabled}
          onToggle={() => setSettings({ ...settings, vatEnabled: !settings.vatEnabled })}
        />
        <ReminderCard
          title="Jahresabschluss"
          description="1. Dezember: Jahresabschluss und Steuererklärung vorbereiten"
          enabled={settings.yearEndEnabled}
          onToggle={() => setSettings({ ...settings, yearEndEnabled: !settings.yearEndEnabled })}
        />
      </div>

      {/* Email input */}
      <Card className="border-emerald-100">
        <CardHeader>
          <CardTitle className="text-base">Erinnerungen per E-Mail</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="reminder-email">Erinnerungen an diese E-Mail senden</Label>
            <Input
              id="reminder-email"
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              placeholder="max@muster.ch"
              className="mt-1"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Lassen Sie das Feld leer, um Ihre Konto-E-Mail zu verwenden.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save button */}
      <Button
        className="w-full bg-emerald-500 hover:bg-emerald-600"
        onClick={handleSave}
      >
        {saved ? "✓ Einstellungen gespeichert" : "Einstellungen speichern"}
      </Button>
    </div>
  );
}
