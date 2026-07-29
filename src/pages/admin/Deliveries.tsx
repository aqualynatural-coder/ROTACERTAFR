import { useQuery } from "@tanstack/react-query";
import { api, API_BASE_URL } from "@/services/api";
import type { Delivery } from "@/types";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Camera, MapPin, Loader2 } from "lucide-react";

export default function AdminDeliveries() {
  const { data, isLoading } = useQuery({
    queryKey: ["all-deliveries"],
    queryFn: async () => (await api.get<Delivery[]>("/deliveries")).data,
    refetchInterval: 20_000
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold">Entregas</h1>
        <p className="text-slate-500">Todas as entregas do sistema</p>
      </div>

      {isLoading && <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data?.map((d) => (
          <div key={d.id} className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-bold truncate">{d.customer.name}</div>
                <div className="text-xs text-slate-500 flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3" /> {d.customer.address}
                </div>
                {d.scheduledAt && (
                  <div className="text-xs text-slate-500 mt-1">
                    Previsto: {format(new Date(d.scheduledAt), "dd/MM HH:mm", { locale: ptBR })}
                  </div>
                )}
              </div>
              <StatusBadge status={d.status} />
            </div>
            {d.proof && (
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <Camera className="w-4 h-4" />
                <a href={`${API_BASE_URL}${d.proof.photoUrl}`} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                  Ver foto de prova
                </a>
              </div>
            )}
            {d.failure && (
              <div className="mt-3 text-xs text-red-500">
                Falha: {d.failure.code}
                {d.failure.notes && <> — {d.failure.notes}</>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
