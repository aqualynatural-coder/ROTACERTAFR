import { useParams, useNavigate, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { MapPin, Navigation, Phone, ArrowLeft, CheckCircle2, XCircle, Play, Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";
import type { Delivery } from "@/types";
import { StatusBadge } from "@/components/StatusBadge";
import { enqueueAction } from "@/services/offlineQueue";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function DriverDeliveryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: d, isLoading } = useQuery({
    queryKey: ["delivery", id],
    queryFn: async () => (await api.get<Delivery>(`/deliveries/${id}`)).data
  });

  const start = useMutation({
    mutationFn: async () => (await api.post(`/deliveries/${id}/start`)).data,
    onSuccess: () => {
      toast.success("Rota iniciada. Boa viagem!");
      qc.invalidateQueries({ queryKey: ["delivery", id] });
      qc.invalidateQueries({ queryKey: ["my-deliveries"] });
    }
  });

  const arrive = async () => {
    if (!navigator.geolocation) {
      toast.error("GPS não disponível");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const payload = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        try {
          await api.post(`/deliveries/${id}/arrive`, payload);
          toast.success("Chegada confirmada!");
          qc.invalidateQueries({ queryKey: ["delivery", id] });
        } catch {
          await enqueueAction({ kind: "ARRIVE", deliveryId: id!, payload, createdAt: new Date().toISOString() });
          toast.info("Sem conexão — chegada salva para sincronização");
        }
      },
      () => toast.error("Não foi possível obter localização"),
      { enableHighAccuracy: true }
    );
  };

  if (isLoading || !d) {
    return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>;
  }

  const openMap = (provider: "google" | "waze") => {
    const { latitude: lat, longitude: lng } = d.customer;
    const url = provider === "google"
      ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`
      : `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-brand-500">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-slate-500">Entrega #{d.sequence}</div>
          <StatusBadge status={d.status} />
        </div>
        <h1 className="text-2xl font-extrabold">{d.customer.name}</h1>
        <div className="text-slate-500 flex items-center gap-1 mt-1">
          <MapPin className="w-4 h-4" /> {d.customer.address}
          {d.customer.city && <span>, {d.customer.city}/{d.customer.state}</span>}
        </div>
        {d.scheduledAt && (
          <div className="text-xs text-slate-500 mt-2">
            Previsto para {format(new Date(d.scheduledAt), "HH:mm", { locale: ptBR })}
          </div>
        )}
        {d.notes && (
          <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-sm">
            📝 {d.notes}
          </div>
        )}
      </div>

      {/* Mapa */}
      <div className="card p-3">
        <div className="h-56 rounded-xl overflow-hidden">
          <MapContainer
            center={[d.customer.latitude, d.customer.longitude]}
            zoom={15}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[d.customer.latitude, d.customer.longitude]} />
          </MapContainer>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3">
          <button onClick={() => openMap("google")} className="btn-secondary flex items-center justify-center gap-2">
            <Navigation className="w-4 h-4" /> Google Maps
          </button>
          <button onClick={() => openMap("waze")} className="btn-secondary flex items-center justify-center gap-2">
            <Navigation className="w-4 h-4" /> Waze
          </button>
        </div>
      </div>

      {d.customer.phone && (
        <a href={`tel:${d.customer.phone}`} className="card p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60">
          <Phone className="w-5 h-5 text-emerald-500" />
          <div>
            <div className="font-semibold">Ligar para o cliente</div>
            <div className="text-xs text-slate-500">{d.customer.phone}</div>
          </div>
        </a>
      )}

      {/* Ações */}
      <div className="space-y-2">
        {(d.status === "ASSIGNED" || d.status === "PENDING") && (
          <button onClick={() => start.mutate()} disabled={start.isPending} className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-lg">
            <Play className="w-5 h-5" /> Iniciar entrega
          </button>
        )}

        {d.status === "IN_TRANSIT" && (
          <button onClick={arrive} className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-lg">
            <Flag className="w-5 h-5" /> Cheguei no cliente
          </button>
        )}

        {d.status === "ARRIVED" && (
          <>
            <Link to={`/motorista/entrega/${d.id}/concluir`} className="btn-success w-full flex items-center justify-center gap-2 py-4 text-lg">
              <CheckCircle2 className="w-5 h-5" /> Confirmar entrega
            </Link>
            <Link to={`/motorista/entrega/${d.id}/falha`} className="btn-danger w-full flex items-center justify-center gap-2 py-4 text-lg">
              <XCircle className="w-5 h-5" /> Registrar falha
            </Link>
          </>
        )}

        {(d.status === "COMPLETED" || d.status === "FAILED") && (
          <div className="card p-4 text-center">
            <div className="font-semibold">Entrega finalizada</div>
            {d.completedAt && (
              <div className="text-xs text-slate-500 mt-1">
                {format(new Date(d.completedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
