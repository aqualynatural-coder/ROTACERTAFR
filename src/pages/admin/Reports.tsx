import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Download, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

export default function AdminReports() {
  const [from, setFrom] = useState(new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["report-period", from, to],
    queryFn: async () =>
      (await api.get("/reports/period", { params: { from, to } })).data
  });

  const exportCsv = () => {
    if (!data?.deliveries) return;
    const header = "Cliente,Motorista,Status,Criada em,Concluída em\n";
    const rows = data.deliveries.map((d: any) =>
      [
        d.customer.name,
        d.driver?.user?.name ?? "",
        d.status,
        format(new Date(d.createdAt), "dd/MM/yyyy HH:mm"),
        d.completedAt ? format(new Date(d.completedAt), "dd/MM/yyyy HH:mm") : ""
      ].join(",")
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `rotacerta-relatorio-${from}-a-${to}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">Relatórios</h1>
          <p className="text-slate-500">Entregas por período</p>
        </div>
        <button onClick={exportCsv} className="btn-primary flex items-center gap-2">
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
      </div>

      <div className="card p-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="text-sm text-slate-500">De</label>
          <input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-slate-500">Até</label>
          <input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <button className="btn-secondary" onClick={() => refetch()}>Filtrar</button>
        <div className="ml-auto text-sm text-slate-500">
          {data?.count ?? 0} entregas no período
        </div>
      </div>

      {isLoading && <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800 text-left">
            <tr>
              <th className="p-3">Cliente</th>
              <th className="p-3">Motorista</th>
              <th className="p-3">Status</th>
              <th className="p-3">Criada em</th>
              <th className="p-3">Concluída em</th>
            </tr>
          </thead>
          <tbody>
            {data?.deliveries?.map((d: any) => (
              <tr key={d.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="p-3 font-medium">{d.customer.name}</td>
                <td className="p-3">{d.driver?.user?.name ?? "—"}</td>
                <td className="p-3"><StatusBadge status={d.status} /></td>
                <td className="p-3 text-slate-500">{format(new Date(d.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}</td>
                <td className="p-3 text-slate-500">{d.completedAt ? format(new Date(d.completedAt), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
