"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@spezo/ui";
import { Input } from "@spezo/ui";
import { Label } from "@spezo/ui";
import { LogoWithText } from "@/components/logo";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      setError(data.error ?? "Registrierung fehlgeschlagen");
      setLoading(false);
      return;
    }

    router.push("/onboarding");
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F0FDF9" }}>
      {/* Top bar with language switcher */}
      <div className="flex justify-end p-4">
        <LanguageSwitcher />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <LogoWithText iconSize={48} textSize="xl" />
          </div>
          <p className="text-center text-gray-500 -mt-4 mb-8 text-sm">14 Tage kostenlos testen</p>

          <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-8">
            <h2 className="text-xl font-bold mb-2 text-gray-900">Konto erstellen</h2>
            <p className="text-sm text-gray-400 mb-6">Kostenlos, keine Kreditkarte nötig</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
              <div>
                <Label htmlFor="name">Name / Firma</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Max Muster"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">E-Mail</Label>
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
                <Label htmlFor="password">Passwort</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min. 8 Zeichen"
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
                {loading ? "Konto wird erstellt..." : "Kostenlos registrieren"}
              </Button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-5 leading-relaxed">
              Mit der Registrierung stimmen Sie unseren AGB zu.
              Alle Daten werden in der Schweiz gespeichert.
            </p>

            <p className="text-center text-sm text-gray-500 mt-4">
              Bereits ein Konto?{" "}
              <Link href="/login" className="text-emerald-700 hover:underline font-semibold">
                Anmelden
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            🇨🇭 Alle Daten werden in der Schweiz gespeichert
          </p>
        </div>
      </div>
    </div>
  );
}
