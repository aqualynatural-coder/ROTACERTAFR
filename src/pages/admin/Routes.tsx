import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Map as MapIcon, Loader2, Play, Square, Trash2, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";
import type { Route, Driver, Customer } from "@/types";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminRoutes() {
  const qc = useQueryClient();
  const [openForm, setOpenForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState<any>({
    name: "",
    driverId: "",
    scheduledFor: new Date().toISOString().slice(0, 16),
    deliveries: [] as { customerId: string }[]
  });

  const { data: routes, isLoading } = useQuery({
    queryKey: ["routes"],
    queryFn: async () => (await api.get<Route[]>("/routes")).data
  });
  const { data: drivers } = useQuery({
    queryKey: ["drivers"],
    queryFn: async () => (await api.get<Driver[]>("/drivers")).data
  });
  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => (await api.get<Customer[]>("/customers")).data
  });

  const create = useMutation({
    mutationFn: async () =>
      (await api.post("/routes", {
        name: form.name,
        driverId: form.driverId || undefined,
        scheduledFor: new Date(form.scheduledFor).toISOString(),
        deliveries: form.deliveries
      })).data,
    onSuccess: () => {
      toast.success("Rota criada");
      qc.invalidateQueries({ queryKey: ["routes"] });
      setOpenForm(false);
      setForm({ name: "", driverId: "", scheduledFor: new Date().toISOString().slice(0, 16), deliveries: [] });
    },
    onError: (e: any) => toast.error(e.response?.data?.error || "Erro ao criar rota")
  });

  const startRoute = useMutation({
    mutationFn: async (id: string) => (await api.post(`/routes/${id}/start`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["routes"] })
  });
  const endRoute = useMutation({
    mutationFn: async (id: string) => (await api.post(`/routes/${id}/end`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["routes"] })
  });
  const del = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/routes/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["routes"] })
  });

  const toggleCustomer = (id: string) => {
    setForm((f: any) => {
      const has = f.deliveries.some((d: any) => d.customerId === id);
      return { ...f, deliveries: has ? f.deliveries.filter((d: any) => d.customerId !== id) : [...f.deliveries, { customerId: id }] };
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">Rotas</h1>
          <p className="text-slate-500">Planeje e acompanhe rotas de entrega</p>
        </div>
        <button onClick={() => setOpenForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nova rota
        </button>
      </div>

      {isLoading && <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>}

      <div className="space-y-3">
        {routes?.map((r) => (
          <div key={r.id} className="card p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300">
                  <MapIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold truncate">{r.name}</div>
                  <div className="text-xs text-slate-500">
                    {format(new Date(r.scheduledFor), "dd 'de' MMM 'de' yyyy HH:mm", { locale: ptBR })}
                    {r.driver?.user?.name && <> • {r.driver.user.name}</>}
                    <> • {r.deliveries.length} entrega(s)</>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${
                  r.status === "ACTIVE" ? "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300" :
                  r.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" :
                  r.status === "CANCELED" ? "bg-red-100 text-red-700" :
                  "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                }`}>{r.status}</span>
                <Link to={`/admin/rotas/${r.id}`} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="Detalhes">
                  <ExternalLink className="w-4 h-4" />
                </Link>
                {r.status === "PLANNED" && (
                  <button onClick={() => startRoute.mutate(r.id)} className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30">
                    <Play className="w-4 h-4" />
                  </button>
                )}
                {r.status === "ACTIVE" && (
                  <button onClick={() => endRoute.mutate(r.id)} className="p-2 rounded-lg text-amber-600 hover:bg-amber-50">
                    <Square className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => del.mutate(r.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setExpanded(expanded === r.id ? null : r.id)} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                  {expanded === r.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {expanded === r.id && (
              <div className="mt-3 border-t border-slate-200 dark:border-slate-800 pt-3 space-y-1">
                {r.deliveries.map((d, i) => (
                  <div key={d.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                    <div>
                      <span className="text-slate-500 mr-2">#{i + 1}</span>
                      <span className="font-medium">{d.customer.name}</span>
                      <span className="text-slate-500 ml-2">{d.customer.address}</span>
                    </div>
                    <StatusBadge status={d.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {openForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setOpenForm(false)}>
          <div className="card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Nova rota</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className="input md:col-span-2" placeholder="Nome da rota" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <select className="input" value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })}>
                <option value="">Motorista (opcional)</option>
                {drivers?.map((d) => (
                  <option key={d.id} value={d.id}>{d.user.name}</option>
                ))}
              </select>
              <input className="input" type="datetime-local" value={form.scheduledFor} onChange={(e) => setForm({ ...form, scheduledFor: e.target.value })} />
            </div>
            <div className="mt-4">
              <div className="text-sm font-semibold mb-2">Selecione clientes para as entregas:</div>
              <div className="max-h-64 overflow-y-auto space-y-1 border border-slate-200 dark:border-slate-800 rounded-xl p-2">
                {customers?.map((c) => {
                  const checked = form.deliveries.some((d: any) => d.customerId === c.id);
                  return (
                    <label key={c.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                      <input type="checkbox" checked={checked} onChange={() => toggleCustomer(c.id)} />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{c.name}</div>
                        <div className="text-xs text-slate-500">{c.address}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="btn-secondary" onClick={() => setOpenForm(false)}>Cancelar</button>
              <button className="btn-primary" onClick={() => create.mutate()} disabled={create.isPending || form.deliveries.length === 0 || !form.name}>
                {create.isPending && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}
                Criar rota
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
