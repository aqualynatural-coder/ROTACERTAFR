import { useEffect, useState } from "react";
import { WifiOff, Wifi, RefreshCw } from "lucide-react";
import { syncQueues } from "@/services/offlineQueue";
import { toast } from "sonner";

export default function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const on = () => {
      setOnline(true);
      handleSync();
    };
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const r = await syncQueues();
      if (r.pings + r.actions > 0) {
        toast.success(`Sincronizado: ${r.pings} pings e ${r.actions} ações`);
      }
    } finally {
      setSyncing(false);
    }
  };

  if (online) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium">
      <WifiOff className="w-4 h-4" />
      Sem conexão — trabalhando em modo offline. Dados serão sincronizados automaticamente.
    </div>
  );
}
