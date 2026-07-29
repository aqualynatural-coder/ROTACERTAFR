import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Camera, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";
import { enqueueAction } from "@/services/offlineQueue";

export default function DriverComplete() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async () => {
    if (!photo) {
      toast.error("Tire uma foto de prova antes de finalizar");
      return;
    }
    setSubmitting(true);
    if (!navigator.geolocation) {
      toast.error("GPS obrigatório");
      setSubmitting(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const payload = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          notes
        };
        try {
          const form = new FormData();
          form.append("latitude", String(payload.latitude));
          form.append("longitude", String(payload.longitude));
          if (notes) form.append("notes", notes);
          form.append("photo", photo, "proof.jpg");
          await api.post(`/deliveries/${id}/complete`, form, {
            headers: { "Content-Type": "multipart/form-data" }
          });
          toast.success("Entrega concluída com sucesso!");
          navigate("/motorista", { replace: true });
        } catch {
          await enqueueAction({
            kind: "COMPLETE",
            deliveryId: id!,
            payload,
            photoBlob: photo,
            createdAt: new Date().toISOString()
          });
          toast.info("Sem conexão — entrega será sincronizada assim que possível");
          navigate("/motorista", { replace: true });
        } finally {
          setSubmitting(false);
        }
      },
      () => {
        toast.error("Não foi possível obter localização");
        setSubmitting(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-brand-500">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="card p-4">
        <h1 className="text-2xl font-extrabold flex items-center gap-2">
          <CheckCircle2 className="w-7 h-7 text-emerald-500" />
          Confirmar entrega
        </h1>
        <p className="text-slate-500 mt-1">Tire uma foto do produto entregue ou do recebedor.</p>
      </div>

      <div className="card p-4">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhoto}
        />
        {preview ? (
          <div>
            <img src={preview} alt="Prova" className="w-full max-h-96 object-cover rounded-xl" />
            <button onClick={() => fileRef.current?.click()} className="btn-secondary w-full mt-3 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Tirar outra
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full aspect-video border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-brand-500 hover:text-brand-500 transition"
          >
            <Camera className="w-10 h-10" />
            <span className="font-semibold">Tirar foto de prova</span>
            <span className="text-xs">Toque para abrir a câmera</span>
          </button>
        )}
      </div>

      <div className="card p-4">
        <label className="text-sm font-medium">Observações (opcional)</label>
        <textarea
          className="input mt-1"
          rows={3}
          placeholder="Ex.: Entregue ao porteiro João"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <button
        onClick={submit}
        disabled={submitting || !photo}
        className="btn-success w-full flex items-center justify-center gap-2 py-4 text-lg"
      >
        {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
        <CheckCircle2 className="w-5 h-5" />
        Finalizar entrega
      </button>
    </div>
  );
}
