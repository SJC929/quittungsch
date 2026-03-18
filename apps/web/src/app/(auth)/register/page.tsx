"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@quittungsch/ui";
import { Input } from "@quittungsch/ui";
import { Label } from "@quittungsch/ui";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">QuittungsCH</h1>
          <p className="text-gray-500 mt-1">14 Tage kostenlos testen</p>
        </div>

        <div className="bg-white rounded-xl shadow p-8">
          <h2 className="text-xl font-semibold mb-6">Konto erstellen</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Konto wird erstellt..." : "Kostenlos registrieren"}
            </Button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            Mit der Registrierung stimmen Sie unseren AGB und Datenschutzbestimmungen zu.
            Alle Daten werden in der Schweiz gespeichert.
          </p>

          <p className="text-center text-sm text-gray-500 mt-4">
            Bereits ein Konto?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Anmelden
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
