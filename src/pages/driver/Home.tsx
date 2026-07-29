import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MapPin, ChevronRight, CheckCircle2, Package, Clock, Loader2, Calendar } from "lucide-react";
import { api } from "@/services/api";
import type { Delivery } from "@/types";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuthStore } from "@/stores/auth.store";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function DriverHome() {
  const user = useAuthStore((s) => s.user);
  const { data: deliveries, isLoading } = useQuery({
    queryKey: ["my-deliveries"],
    queryFn: async () => (await api.get<Delivery[]>("/deliveries")).data,
    refetchInterval: 15_000
  });

  const today = new Date();
  const todays = deliveries ?? [];
  const completed = todays.filter((d) => d.status === "COMPLETED").length;
  const failed = todays.filter((d) => d.status === "FAILED").length;
  const remaining = todays.filter((d) => !["COMPLETED", "FAILED", "CANCELED"].includes(d.status));

  return (
    <div className="space-y-4">
      {/* Header do motorista */}
      <div className="card p-5">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-cyan-400 text-white flex items-center justify-center font-bold text-xl">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(today, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </div>
            <div className="font-bold text-lg truncate">Olá, {user?.name}</div>
            <div className="text-xs text-slate-500">Bom dia! Suas entregas de hoje:</div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3 text-center">
          <Package className="w-5 h-5 mx-auto text-brand-500" />
          <div className="text-2xl font-extrabold mt-1">{todays.length}</div>
          <div className="text-[11px] text-slate-500">Total</div>
        </div>
        <div className="card p-3 text-center">
          <CheckCircle2 className="w-5 h-5 mx-auto text-emerald-500" />
          <div className="text-2xl font-extrabold mt-1">{completed}</div>
          <div className="text-[11px] text-slate-500">Concluídas</div>
        </div>
        <div className="card p-3 text-center">
          <Clock className="w-5 h-5 mx-auto text-amber-500" />
          <div className="text-2xl font-extrabold mt-1">{remaining.length}</div>
          <div className="text-[11px] text-slate-500">Restantes</div>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
        </div>
      )}

      {/* Lista de entregas */}
      <div className="space-y-2">
        <h2 className="font-bold text-lg px-1">Minhas entregas</h2>
        {todays.length === 0 && !isLoading && (
          <div className="card p-6 text-center text-slate-500">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
            Nenhuma entrega atribuída hoje.
          </div>
        )}
        {todays.map((d) => (
          <Link
            key={d.id}
            to={`/motorista/entrega/${d.id}`}
            className="card p-4 flex items-center gap-3 hover:shadow-lg active:scale-[0.99] transition"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300 flex items-center justify-center font-bold">
              {d.sequence}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold truncate">{d.customer.name}</div>
              <div className="text-xs text-slate-500 flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 shrink-0" /> {d.customer.address}
              </div>
              <div className="mt-1">
                <StatusBadge status={d.status} />
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
          </Link>
        ))}
      </div>

      {failed > 0 && (
        <div className="card p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
          ⚠ {failed} entrega(s) marcada(s) como falha hoje.
        </div>
      )}
    </div>
  );
}
