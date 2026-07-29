import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";
import { enqueueAction } from "@/services/offlineQueue";
import type { FailureCode } from "@/types";

const REASONS: { code: FailureCode; label: string; emoji: string }[] = [
  { code: "CUSTOMER_ABSENT",  label: "Cliente ausente",   emoji: "🚪" },
  { code: "WRONG_ADDRESS",    label: "Endereço incorreto", emoji: "📍" },
  { code: "CUSTOMER_REFUSED", label: "Cliente recusou",    emoji: "🙅" },
  { code: "VEHICLE_PROBLEM",  label: "Problema no veículo", emoji: "🔧" },
  { code: "OTHER",            label: "Outro motivo",       emoji: "❓" }
];

export default function DriverFail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState<FailureCode | "">("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!code) return toast.error("Selecione um motivo");
    setSubmitting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const payload = {
          code,
          notes,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        };
        try {
          await api.post(`/deliveries/${id}/fail`, payload);
          toast.success("Falha registrada");
          navigate("/motorista", { replace: true });
        } catch {
          await enqueueAction({
            kind: "FAIL",
            deliveryId: id!,
            payload,
            createdAt: new Date().toISOString()
          });
          toast.info("Sem conexão — dados salvos para sincronização");
          navigate("/motorista", { replace: true });
        } finally {
          setSubmitting(false);
        }
      },
      async () => {
        // sem GPS, envia sem coord
        try {
          await api.post(`/deliveries/${id}/fail`, { code, notes });
          toast.success("Falha registrada");
          navigate("/motorista", { replace: true });
        } catch {
          await enqueueAction({ kind: "FAIL", deliveryId: id!, payload: { code, notes }, createdAt: new Date().toISOString() });
          navigate("/motorista", { replace: true });
        } finally {
          setSubmitting(false);
        }
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  return (
    <div className="space-y-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-brand-500">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="card p-4">
        <h1 className="text-2xl font-extrabold flex items-center gap-2">
          <XCircle className="w-7 h-7 text-red-500" />
          Registrar falha
        </h1>
        <p className="text-slate-500 mt-1">Informe o motivo da não entrega.</p>
      </div>

      <div className="space-y-2">
        {REASONS.map((r) => (
          <button
            key={r.code}
            onClick={() => setCode(r.code)}
            className={`card p-4 w-full flex items-center gap-3 text-left transition ${
              code === r.code ? "border-brand-500 ring-2 ring-brand-500" : ""
            }`}
          >
            <div className="text-2xl">{r.emoji}</div>
            <div className="font-semibold">{r.label}</div>
          </button>
        ))}
      </div>

      <div className="card p-4">
        <label className="text-sm font-medium">Observação adicional</label>
        <textarea
          className="input mt-1"
          rows={3}
          placeholder="Detalhes do ocorrido..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <button onClick={submit} disabled={submitting || !code} className="btn-danger w-full flex items-center justify-center gap-2 py-4 text-lg">
        {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
        Registrar falha
      </button>
    </div>
  );
}
