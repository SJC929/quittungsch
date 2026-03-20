"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@spezo/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@spezo/ui";
import { Input } from "@spezo/ui";
import { Label } from "@spezo/ui";
import { MapPin, Navigation, Plus, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

interface Trip {
  id: string;
  date: string;
  from: string;
  to: string;
  km: number;
  purpose: string;
}

const CHF_PER_KM = 0.70;

const T = {
  de: {
    title: "Kilometer-Logbuch",
    subtitle: "CHF 0.70 pro km (ESTV-Ansatz)",
    stop: "Fahrt stoppen",
    start: "Fahrt starten (GPS)",
    manual: "Manuell erfassen",
    gps_active: "GPS-Tracking aktiv – Fahrt wird aufgezeichnet...",
    new_trip: "Neue Fahrt erfassen",
    from: "Von",
    to: "Nach",
    km: "Kilometer",
    date: "Datum",
    purpose: "Zweck",
    purpose_ph: "Kundengespräch / Lieferung / ...",
    cancel: "Abbrechen",
    save: "Erfassen",
    total_km: "Total Kilometer",
    total_chf: "Total Entschädigung",
    trips: "Fahrten",
    no_trips: "Noch keine Fahrten erfasst",
    gps_err: "GPS nicht verfügbar auf diesem Gerät.",
  },
  fr: {
    title: "Journal kilométrique",
    subtitle: "CHF 0.70 par km (taux AFC)",
    stop: "Arrêter le trajet",
    start: "Démarrer le trajet (GPS)",
    manual: "Saisie manuelle",
    gps_active: "Suivi GPS actif – trajet en cours d'enregistrement...",
    new_trip: "Nouveau trajet",
    from: "De",
    to: "À",
    km: "Kilomètres",
    date: "Date",
    purpose: "Motif",
    purpose_ph: "Réunion client / Livraison / ...",
    cancel: "Annuler",
    save: "Enregistrer",
    total_km: "Total kilomètres",
    total_chf: "Total indemnisation",
    trips: "Trajets",
    no_trips: "Aucun trajet enregistré",
    gps_err: "GPS non disponible sur cet appareil.",
  },
  it: {
    title: "Registro chilometrico",
    subtitle: "CHF 0.70 per km (tariffa AFC)",
    stop: "Ferma il viaggio",
    start: "Avvia il viaggio (GPS)",
    manual: "Inserimento manuale",
    gps_active: "Tracciamento GPS attivo – viaggio in registrazione...",
    new_trip: "Nuovo viaggio",
    from: "Da",
    to: "A",
    km: "Chilometri",
    date: "Data",
    purpose: "Scopo",
    purpose_ph: "Incontro cliente / Consegna / ...",
    cancel: "Annulla",
    save: "Registra",
    total_km: "Totale chilometri",
    total_chf: "Totale indennità",
    trips: "Viaggi",
    no_trips: "Nessun viaggio registrato",
    gps_err: "GPS non disponibile su questo dispositivo.",
  },
  rm: {
    title: "Liber da kilometers",
    subtitle: "CHF 0.70 per km (tariffa AFC)",
    stop: "Fermar il viadi",
    start: "Entschaiver il viadi (GPS)",
    manual: "Registrar manualmaing",
    gps_active: "GPS activ – il viadi vegn registrà...",
    new_trip: "Nov viadi",
    from: "Da",
    to: "A",
    km: "Kilometers",
    date: "Data",
    purpose: "Intent",
    purpose_ph: "Visita client / Delivranza / ...",
    cancel: "Interrumper",
    save: "Registrar",
    total_km: "Total kilometers",
    total_chf: "Total indemnisaziun",
    trips: "Viadis",
    no_trips: "Anc nagins viadis registrads",
    gps_err: "GPS betg disponibel sin quest apparat.",
  },
  en: {
    title: "Mileage Log",
    subtitle: "CHF 0.70 per km (ESTV rate)",
    stop: "Stop trip",
    start: "Start trip (GPS)",
    manual: "Manual entry",
    gps_active: "GPS tracking active – trip being recorded...",
    new_trip: "New trip",
    from: "From",
    to: "To",
    km: "Kilometres",
    date: "Date",
    purpose: "Purpose",
    purpose_ph: "Client meeting / Delivery / ...",
    cancel: "Cancel",
    save: "Save",
    total_km: "Total kilometres",
    total_chf: "Total reimbursement",
    trips: "Trips",
    no_trips: "No trips recorded yet",
    gps_err: "GPS not available on this device.",
  },
  tr: {
    title: "Kilometre Günlüğü",
    subtitle: "CHF 0.70/km (ESTV oranı)",
    stop: "Seyahati durdur",
    start: "Seyahati başlat (GPS)",
    manual: "Manuel giriş",
    gps_active: "GPS takibi aktif – seyahat kaydediliyor...",
    new_trip: "Yeni seyahat",
    from: "Nereden",
    to: "Nereye",
    km: "Kilometre",
    date: "Tarih",
    purpose: "Amaç",
    purpose_ph: "Müşteri görüşmesi / Teslimat / ...",
    cancel: "İptal",
    save: "Kaydet",
    total_km: "Toplam kilometre",
    total_chf: "Toplam tazminat",
    trips: "Seyahat",
    no_trips: "Henüz seyahat kaydedilmedi",
    gps_err: "Bu cihazda GPS mevcut değil.",
  },
  sq: {
    title: "Regjistri i kilometrave",
    subtitle: "CHF 0.70/km (norma ESTV)",
    stop: "Ndaloni udhëtimin",
    start: "Startoni udhëtimin (GPS)",
    manual: "Hyrje manuale",
    gps_active: "GPS aktiv – udhëtimi po regjistrohet...",
    new_trip: "Udhëtim i ri",
    from: "Nga",
    to: "Në",
    km: "Kilometra",
    date: "Data",
    purpose: "Qëllimi",
    purpose_ph: "Takim klienti / Dorëzim / ...",
    cancel: "Anulo",
    save: "Regjistro",
    total_km: "Gjithsej kilometra",
    total_chf: "Gjithsej kompensim",
    trips: "Udhëtime",
    no_trips: "Asnjë udhëtim i regjistruar",
    gps_err: "GPS nuk është i disponueshëm në këtë pajisje.",
  },
};

export default function KmLogPage() {
  const { lang } = useLanguage();
  const t = T[lang] ?? T.de;

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
      alert(t.gps_err);
      return;
    }
    setTracking(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (_pos) => { /* accumulate distance in real app */ },
      (_err) => { setTracking(false); },
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <MapPin className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
            <p className="text-sm text-gray-500">{t.subtitle}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={tracking ? "destructive" : "outline"}
            onClick={tracking ? stopTracking : startTracking}
            className={tracking ? "" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"}
          >
            <Navigation className="h-4 w-4 mr-2" />
            {tracking ? t.stop : t.start}
          </Button>
          <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            {t.manual}
          </Button>
        </div>
      </div>

      {tracking && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
          <p className="text-emerald-700 text-sm font-medium">{t.gps_active}</p>
        </div>
      )}

      {showForm && (
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-base">{t.new_trip}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="from">{t.from}</Label>
                <Input id="from" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} placeholder="Zürich, Bahnhofstrasse 1" className="mt-1" required />
              </div>
              <div>
                <Label htmlFor="to">{t.to}</Label>
                <Input id="to" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} placeholder="Bern, Bundesplatz 3" className="mt-1" required />
              </div>
              <div>
                <Label htmlFor="km">{t.km}</Label>
                <Input id="km" type="number" step="0.1" min="0" value={form.km} onChange={(e) => setForm({ ...form, km: e.target.value })} placeholder="45.5" className="mt-1" required />
              </div>
              <div>
                <Label htmlFor="date">{t.date}</Label>
                <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1" required />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="purpose">{t.purpose}</Label>
                <Input id="purpose" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} placeholder={t.purpose_ph} className="mt-1" />
              </div>
              <div className="sm:col-span-2 flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>{t.cancel}</Button>
                <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600">{t.save}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-emerald-100">
          <CardContent className="pt-5">
            <p className="text-sm text-gray-500">{t.total_km}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{totalKm.toFixed(1)} km</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-100">
          <CardContent className="pt-5">
            <p className="text-sm text-gray-500">{t.total_chf}</p>
            <p className="text-3xl font-bold text-emerald-700 mt-1">CHF {totalChf.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-emerald-100">
        <CardHeader>
          <CardTitle className="text-base">{t.trips} ({trips.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {trips.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <MapPin className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">{t.no_trips}</p>
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
