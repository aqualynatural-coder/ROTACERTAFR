import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Truck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";
import type { Driver } from "@/types";

export default function AdminDrivers() {
  const qc = useQueryClient();
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    licenseNumber: "",
    vehiclePlate: "",
    vehicleModel: ""
  });

  const { data: drivers, isLoading } = useQuery({
    queryKey: ["drivers"],
    queryFn: async () => (await api.get<Driver[]>("/drivers")).data
  });

  const create = useMutation({
    mutationFn: async () => (await api.post("/drivers", form)).data,
    onSuccess: () => {
      toast.success("Motorista cadastrado");
      qc.invalidateQueries({ queryKey: ["drivers"] });
      setOpenForm(false);
      setForm({ name: "", email: "", password: "", phone: "", licenseNumber: "", vehiclePlate: "", vehicleModel: "" });
    },
    onError: (e: any) => toast.error(e.response?.data?.error || "Erro ao cadastrar")
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">Motoristas</h1>
          <p className="text-slate-500">Gerencie a equipe de motoristas</p>
        </div>
        <button onClick={() => setOpenForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Novo motorista
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drivers?.map((d) => (
          <div key={d.id} className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold">
                {d.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold truncate">{d.user.name}</div>
                <div className="text-xs text-slate-500 truncate">{d.user.email}</div>
              </div>
              <span className={`badge ${d.user.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>
                {d.user.active ? "Ativo" : "Inativo"}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-slate-500">Telefone</div>
                <div className="font-medium">{d.phone ?? "—"}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">CNH</div>
                <div className="font-medium">{d.licenseNumber ?? "—"}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Placa</div>
                <div className="font-medium">{d.vehiclePlate ?? "—"}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Veículo</div>
                <div className="font-medium truncate">{d.vehicleModel ?? "—"}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {openForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setOpenForm(false)}>
          <div className="card p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-brand-500" /> Novo motorista
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className="input" placeholder="Nome completo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="input" placeholder="E-mail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input className="input" placeholder="Senha inicial" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <input className="input" placeholder="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <input className="input" placeholder="CNH" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} />
              <input className="input" placeholder="Placa" value={form.vehiclePlate} onChange={(e) => setForm({ ...form, vehiclePlate: e.target.value })} />
              <input className="input md:col-span-2" placeholder="Modelo do veículo" value={form.vehicleModel} onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="btn-secondary" onClick={() => setOpenForm(false)}>Cancelar</button>
              <button className="btn-primary" onClick={() => create.mutate()} disabled={create.isPending}>
                {create.isPending && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
