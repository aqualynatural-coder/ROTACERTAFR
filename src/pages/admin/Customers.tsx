import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, MapPin, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";
import type { Customer } from "@/types";

const empty = {
  name: "", phone: "", email: "", address: "", city: "", state: "", zipCode: "",
  latitude: -23.5613, longitude: -46.6558, notes: ""
};

export default function AdminCustomers() {
  const qc = useQueryClient();
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<any>(empty);

  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => (await api.get<Customer[]>("/customers")).data
  });

  const create = useMutation({
    mutationFn: async () => (await api.post("/customers", {
      ...form,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude)
    })).data,
    onSuccess: () => {
      toast.success("Cliente cadastrado");
      qc.invalidateQueries({ queryKey: ["customers"] });
      setOpenForm(false);
      setForm(empty);
    },
    onError: (e: any) => toast.error(e.response?.data?.error || "Erro ao cadastrar")
  });

  const remove = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/customers/${id}`)).data,
    onSuccess: () => {
      toast.success("Cliente removido");
      qc.invalidateQueries({ queryKey: ["customers"] });
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">Clientes</h1>
          <p className="text-slate-500">Cadastro de destinatários</p>
        </div>
        <button onClick={() => setOpenForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Novo cliente
        </button>
      </div>

      {isLoading && <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800 text-left">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Endereço</th>
              <th className="p-3">Telefone</th>
              <th className="p-3">Coordenadas</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {customers?.map((c) => (
              <tr key={c.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="p-3 font-semibold">{c.name}</td>
                <td className="p-3">
                  <div className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3 h-3" /> {c.address}
                    {c.city && <span>, {c.city}/{c.state}</span>}
                  </div>
                </td>
                <td className="p-3">{c.phone ?? "—"}</td>
                <td className="p-3 text-xs text-slate-500">{c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}</td>
                <td className="p-3">
                  <button onClick={() => remove.mutate(c.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setOpenForm(false)}>
          <div className="card p-6 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Novo cliente</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className="input md:col-span-2" placeholder="Nome do cliente" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="input" placeholder="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <input className="input" placeholder="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input className="input md:col-span-2" placeholder="Endereço completo" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <input className="input" placeholder="Cidade" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <input className="input" placeholder="UF" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              <input className="input" placeholder="CEP" value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} />
              <div />
              <input className="input" type="number" step="0.000001" placeholder="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
              <input className="input" type="number" step="0.000001" placeholder="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
              <textarea className="input md:col-span-2" placeholder="Observações" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
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
