"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@quittungsch/ui";
import { Input } from "@quittungsch/ui";
import { Label } from "@quittungsch/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"password" | "magic">("password");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (mode === "magic") {
      const result = await signIn("email", { email, redirect: false });
      if (result?.ok) {
        setMagicLinkSent(true);
      } else {
        setError("Magic Link konnte nicht gesendet werden.");
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
        setError("Ungültige E-Mail oder Passwort.");
      }
    }

    setLoading(false);
  }

  if (magicLinkSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow p-8 text-center">
          <div className="text-4xl mb-4">📧</div>
          <h2 className="text-xl font-semibold mb-2">Magic Link gesendet!</h2>
          <p className="text-gray-600">
            Bitte prüfen Sie Ihre E-Mail <strong>{email}</strong> und klicken Sie den Link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-700">QuittungsCH</h1>
          <p className="text-gray-500 mt-1">Belege einfach erfassen</p>
        </div>

        <div className="bg-white rounded-xl shadow p-8">
          <h2 className="text-xl font-semibold mb-6">Anmelden</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div>
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="max@muster.ch"
                required
                className="mt-1"
              />
            </div>

            {mode === "password" && (
              <div>
                <Label htmlFor="password">Passwort</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Lädt..."
                : mode === "magic"
                ? "Magic Link senden"
                : "Anmelden"}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-400">oder</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setMode(mode === "password" ? "magic" : "password")}
          >
            {mode === "password"
              ? "Mit Magic Link anmelden"
              : "Mit Passwort anmelden"}
          </Button>

          <p className="text-center text-sm text-gray-500 mt-6">
            Noch kein Konto?{" "}
            <Link href="/register" className="text-emerald-700 hover:underline font-medium">
              Registrieren
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
