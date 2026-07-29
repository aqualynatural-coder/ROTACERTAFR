import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from "react-leaflet";
import L from "leaflet";
import {
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  MapPin,
  Bell
} from "lucide-react";
import { api } from "@/services/api";
import { getSocket } from "@/services/socket";
import { StatusBadge } from "@/components/StatusBadge";
import type { LivePosition, Delivery, Notification } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

// Ícone customizado para motorista
const truckIcon = L.divIcon({
  className: "custom-driver-icon",
  html: `<div style="width:38px;height:38px;background:#0EA5E9;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(14,165,233,.5);">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
  </div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 19]
});

function KPI({
  icon: Icon,
  label,
  value,
  accent
}: {
  icon: any;
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div className="card p-4 md:p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${accent}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <div className="text-2xl md:text-3xl font-extrabold">{value}</div>
        <div className="text-sm text-slate-500">{label}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [live, setLive] = useState<LivePosition[]>([]);

  const { data: summary } = useQuery({
    queryKey: ["summary"],
    queryFn: async () => (await api.get("/reports/summary")).data,
    refetchInterval: 15_000
  });

  const { data: liveInitial } = useQuery({
    queryKey: ["live-initial"],
    queryFn: async () => (await api.get<LivePosition[]>("/locations/live")).data
  });

  const { data: deliveries } = useQuery({
    queryKey: ["deliveries-recent"],
    queryFn: async () => (await api.get<Delivery[]>("/deliveries")).data,
    refetchInterval: 20_000
  });

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await api.get<Notification[]>("/notifications")).data,
    refetchInterval: 20_000
  });

  useEffect(() => {
    if (liveInitial) setLive(liveInitial);
  }, [liveInitial]);

  useEffect(() => {
    const socket = getSocket();
    const onLoc = (p: LivePosition) => {
      setLive((prev) => {
        const next = prev.filter((x) => x.driverId !== p.driverId);
        return [...next, p];
      });
    };
    socket.on("driver:location", onLoc);
    return () => {
      socket.off("driver:location", onLoc);
    };
  }, []);

  const inTransit = useMemo(
    () => deliveries?.filter((d) => d.status === "IN_TRANSIT" || d.status === "ARRIVED") ?? [],
    [deliveries]
  );
  const completed = useMemo(
    () => deliveries?.filter((d) => d.status === "COMPLETED").slice(0, 5) ?? [],
    [deliveries]
  );
  const alerts = notifications?.filter((n) => !n.read).slice(0, 5) ?? [];

  const center: [number, number] = [-23.559120, -46.664050];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold">Dashboard</h1>
        <p className="text-slate-500">Visão geral operacional em tempo real</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPI icon={Package} label="Total entregas" value={summary?.total ?? 0} accent="bg-slate-600" />
        <KPI icon={Clock} label="Pendentes" value={summary?.pending ?? 0} accent="bg-amber-500" />
        <KPI icon={Truck} label="Em trânsito" value={summary?.inTransit ?? 0} accent="bg-brand-500" />
        <KPI icon={CheckCircle2} label="Concluídas" value={summary?.completed ?? 0} accent="bg-emerald-500" />
        <KPI icon={XCircle} label="Falhas" value={summary?.failed ?? 0} accent="bg-red-500" />
        <KPI icon={Users} label="Motoristas ativos" value={summary?.driversActive ?? 0} accent="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mapa */}
        <div className="lg:col-span-2 card p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-bold text-lg">Mapa em tempo real</h2>
              <p className="text-sm text-slate-500">
                {live.length} motorista(s) transmitindo localização
              </p>
            </div>
            <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              AO VIVO
            </span>
          </div>
          <div className="h-[420px] rounded-xl overflow-hidden">
            <MapContainer center={center} zoom={13} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {live.map((d) => (
                <Marker key={d.driverId} position={[d.latitude, d.longitude]} icon={truckIcon}>
                  <Popup>
                    <div className="font-semibold">{d.name}</div>
                    <div className="text-xs">Placa: {d.vehiclePlate ?? "—"}</div>
                    <div className="text-xs">Velocidade: {d.speed ? `${d.speed.toFixed(1)} m/s` : "—"}</div>
                    <div className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(d.recordedAt), { locale: ptBR, addSuffix: true })}
                    </div>
                  </Popup>
                </Marker>
              ))}
              {/* Clientes das entregas em trânsito */}
              {inTransit.map((d) => (
                <CircleMarker
                  key={d.id}
                  center={[d.customer.latitude, d.customer.longitude]}
                  radius={8}
                  pathOptions={{ color: "#F59E0B", fillColor: "#F59E0B", fillOpacity: 0.7 }}
                >
                  <Popup>
                    <div className="font-semibold">{d.customer.name}</div>
                    <div className="text-xs">{d.customer.address}</div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Alertas */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-brand-500" />
            <h2 className="font-bold text-lg">Alertas recentes</h2>
          </div>
          {alerts.length === 0 && (
            <div className="text-sm text-slate-500 py-8 text-center">Nenhum alerta no momento</div>
          )}
          <ul className="space-y-2">
            {alerts.map((n) => (
              <li key={n.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <div className="font-semibold text-sm">{n.title}</div>
                <div className="text-xs text-slate-500">{n.body}</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {formatDistanceToNow(new Date(n.createdAt), { locale: ptBR, addSuffix: true })}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Listas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-4">
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
            <Truck className="w-5 h-5 text-brand-500" /> Entregas em andamento
          </h2>
          <ul className="space-y-2">
            {inTransit.length === 0 && <li className="text-sm text-slate-500">Nenhuma no momento.</li>}
            {inTransit.map((d) => (
              <li key={d.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{d.customer.name}</div>
                  <div className="text-xs text-slate-500 truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {d.customer.address}
                  </div>
                </div>
                <StatusBadge status={d.status} />
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-4">
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Concluídas recentemente
          </h2>
          <ul className="space-y-2">
            {completed.length === 0 && <li className="text-sm text-slate-500">Nenhuma ainda.</li>}
            {completed.map((d) => (
              <li key={d.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{d.customer.name}</div>
                  <div className="text-xs text-slate-500">
                    {d.completedAt
                      ? formatDistanceToNow(new Date(d.completedAt), { locale: ptBR, addSuffix: true })
                      : ""}
                  </div>
                </div>
                <StatusBadge status={d.status} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
