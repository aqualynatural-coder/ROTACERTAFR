import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Polyline, CircleMarker, Popup } from "react-leaflet";
import L from "leaflet";
import { ArrowLeft, Loader2, MapPin, Clock, User } from "lucide-react";
import { api } from "@/services/api";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const truckIcon = L.divIcon({
  className: "custom-driver-icon",
  html: `<div style="width:34px;height:34px;background:#0EA5E9;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(14,165,233,.5);">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
  </div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

export default function AdminRouteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: route, isLoading } = useQuery({
    queryKey: ["route-detail", id],
    queryFn: async () => (await api.get(`/routes/${id}`)).data,
    refetchInterval: 15_000
  });

  if (isLoading || !route) {
    return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>;
  }

  const pings = route.pings ?? [];
  const path: [number, number][] = pings.map((p: any) => [p.latitude, p.longitude]);
  const lastPing = pings[pings.length - 1];

  const center: [number, number] = lastPing
    ? [lastPing.latitude, lastPing.longitude]
    : route.deliveries[0]
    ? [route.deliveries[0].customer.latitude, route.deliveries[0].customer.longitude]
    : [-23.559120, -46.664050];

  return (
    <div className="space-y-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-brand-500">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="card p-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">{route.name}</h1>
            <div className="text-sm text-slate-500 flex items-center gap-2 mt-1 flex-wrap">
              <Clock className="w-4 h-4" />
              {format(new Date(route.scheduledFor), "dd 'de' MMM 'de' yyyy HH:mm", { locale: ptBR })}
              {route.driver?.user?.name && (
                <>
                  • <User className="w-4 h-4" /> {route.driver.user.name}
                </>
              )}
            </div>
          </div>
          <span className={`badge ${
            route.status === "ACTIVE" ? "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300" :
            route.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" :
            "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
          }`}>{route.status}</span>
        </div>
      </div>

      {/* Mapa com trajeto */}
      <div className="card p-4">
        <h2 className="font-bold text-lg mb-3">Trajeto histórico</h2>
        <div className="h-[420px] rounded-xl overflow-hidden">
          <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />

            {/* Trajeto do motorista */}
            {path.length > 1 && (
              <Polyline positions={path} pathOptions={{ color: "#0EA5E9", weight: 4, opacity: 0.7 }} />
            )}

            {/* Última posição do motorista */}
            {lastPing && (
              <Marker position={[lastPing.latitude, lastPing.longitude]} icon={truckIcon}>
                <Popup>
                  <div className="font-semibold">Posição atual</div>
                  <div className="text-xs">
                    {format(new Date(lastPing.recordedAt), "HH:mm:ss", { locale: ptBR })}
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Clientes de cada entrega */}
            {route.deliveries.map((d: any) => (
              <CircleMarker
                key={d.id}
                center={[d.customer.latitude, d.customer.longitude]}
                radius={9}
                pathOptions={{
                  color: d.status === "COMPLETED" ? "#10B981" :
                         d.status === "FAILED"    ? "#EF4444" :
                         d.status === "ARRIVED"   ? "#8B5CF6" :
                                                    "#F59E0B",
                  fillColor: d.status === "COMPLETED" ? "#10B981" :
                             d.status === "FAILED"    ? "#EF4444" :
                             d.status === "ARRIVED"   ? "#8B5CF6" :
                                                        "#F59E0B",
                  fillOpacity: 0.8
                }}
              >
                <Popup>
                  <div className="font-semibold">#{d.sequence} — {d.customer.name}</div>
                  <div className="text-xs">{d.customer.address}</div>
                  <div className="text-xs mt-1">Status: {d.status}</div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
        <div className="text-xs text-slate-500 mt-2">
          {pings.length} ponto(s) de rastreamento registrado(s)
        </div>
      </div>

      {/* Lista de entregas da rota */}
      <div className="card p-4">
        <h2 className="font-bold text-lg mb-3">Entregas ({route.deliveries.length})</h2>
        <div className="space-y-2">
          {route.deliveries.map((d: any) => (
            <div key={d.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300 flex items-center justify-center font-bold">
                  {d.sequence}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{d.customer.name}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3" /> {d.customer.address}
                  </div>
                </div>
              </div>
              <StatusBadge status={d.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
