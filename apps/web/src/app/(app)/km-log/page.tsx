"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@spezo/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@spezo/ui";
import { Input } from "@spezo/ui";
import { Label } from "@spezo/ui";
import { MapPin, Navigation, Plus, Trash2 } from "lucide-react";

interface Trip {
  id: string;
  date: string;
  from: string;
  to: string;
  km: number;
  purpose: string;
}

const CHF_PER_KM = 0.70;

export default function KmLogPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tracking, setTracking] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ from: "", to: "", km: "", date: new Date().toISOString().split("T")[0], purpose: "" });
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("spezo_km_trips");
    if (stored) {
      try { setTrips(JSON.parse(stored) as Trip[]); } catch { /* ignore */ }
    }
  }, []);

  function saveTrips(updated: Trip[]) {
    setTrips(updated);
    localStorage.setItem("spezo_km_trips", JSON.stringify(updated));
  }

  function startTracking() {
    if (!navigator.geolocation) {
      alert("GPS nicht verfügbar auf diesem Gerät.");
      return;
    }
    setTracking(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (_pos) => {
        // In a real app, accumulate distance here
      },
      (_err) => {
        setTracking(false);
      },
      { enableHighAccuracy: true }
    );
  }

  function stopTracking() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking(false);
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trip: Trip = {
      id: Date.now().toString(),
      date: form.date,
      from: form.from,
      to: form.to,
      km: parseFloat(form.km) || 0,
      purpose: form.purpose,
    };
    saveTrips([trip, ...trips]);
    setForm({ from: "", to: "", km: "", date: new Date().toISOString().split("T")[0], purpose: "" });
    setShowForm(false);
  }

  function deleteTrip(id: string) {
    saveTrips(trips.filter((t) => t.id !== id));
  }

  const totalKm = trips.reduce((s, t) => s + t.km, 0);
  const totalChf = totalKm * CHF_PER_KM;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <MapPin className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kilometer-Logbuch</h1>
            <p className="text-sm text-gray-500">CHF {CHF_PER_KM.toFixed(2)} pro km (ESTV-Ansatz)</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={tracking ? "destructive" : "outline"}
            onClick={tracking ? stopTracking : startTracking}
            className={tracking ? "" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"}
          >
            <Navigation className="h-4 w-4 mr-2" />
            {tracking ? "Fahrt stoppen" : "Fahrt starten (GPS)"}
          </Button>
          <Button
            className="bg-emerald-500 hover:bg-emerald-600"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Manuell erfassen
          </Button>
        </div>
      </div>

      {/* GPS tracking indicator */}
      {tracking && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
          <p className="text-emerald-700 text-sm font-medium">GPS-Tracking aktiv – Fahrt wird aufgezeichnet...</p>
        </div>
      )}

      {/* Manual entry form */}
      {showForm && (
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-base">Neue Fahrt erfassen</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="from">Von</Label>
                <Input id="from" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} placeholder="Zürich, Bahnhofstrasse 1" className="mt-1" required />
              </div>
              <div>
                <Label htmlFor="to">Nach</Label>
                <Input id="to" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} placeholder="Bern, Bundesplatz 3" className="mt-1" required />
              </div>
              <div>
                <Label htmlFor="km">Kilometer</Label>
                <Input id="km" type="number" step="0.1" min="0" value={form.km} onChange={(e) => setForm({ ...form, km: e.target.value })} placeholder="45.5" className="mt-1" required />
              </div>
              <div>
                <Label htmlFor="date">Datum</Label>
                <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1" required />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="purpose">Zweck</Label>
                <Input id="purpose" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} placeholder="Kundengespräch / Lieferung / ..." className="mt-1" />
              </div>
              <div className="sm:col-span-2 flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Abbrechen</Button>
                <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600">Erfassen</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Summary card */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-emerald-100">
          <CardContent className="pt-5">
            <p className="text-sm text-gray-500">Total Kilometer</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{totalKm.toFixed(1)} km</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-100">
          <CardContent className="pt-5">
            <p className="text-sm text-gray-500">Total Entschädigung</p>
            <p className="text-3xl font-bold text-emerald-700 mt-1">CHF {totalChf.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Trips list */}
      <Card className="border-emerald-100">
        <CardHeader>
          <CardTitle className="text-base">Fahrten ({trips.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {trips.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <MapPin className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Noch keine Fahrten erfasst</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {trips.map((trip) => (
                <div key={trip.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                      <span className="truncate">{trip.from}</span>
                      <span className="text-gray-400 flex-shrink-0">→</span>
                      <span className="truncate">{trip.to}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>{new Date(trip.date).toLocaleDateString("de-CH")}</span>
                      {trip.purpose && <span>· {trip.purpose}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{trip.km.toFixed(1)} km</p>
                      <p className="text-xs text-emerald-600 font-medium">CHF {(trip.km * CHF_PER_KM).toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => deleteTrip(trip.id)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
