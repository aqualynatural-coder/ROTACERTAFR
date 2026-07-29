import { Outlet, useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { Moon, Sun, Truck, UserCircle2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useThemeStore } from "@/stores/theme.store";
import OfflineBanner from "@/components/OfflineBanner";
import { getSocket } from "@/services/socket";
import { enqueuePing } from "@/services/offlineQueue";

export default function DriverLayout() {
  const user = useAuthStore((s) => s.user);
  const { theme, toggle } = useThemeStore();
  const navigate = useNavigate();

  // Rastreamento GPS contínuo — envia via socket ou enfileira offline
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const payload = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          speed: pos.coords.speed ?? undefined,
          heading: pos.coords.heading ?? undefined,
          accuracy: pos.coords.accuracy ?? undefined,
          recordedAt: new Date().toISOString()
        };
        if (navigator.onLine) {
          try {
            const s = getSocket();
            s.emit("driver:location", payload);
          } catch {
            enqueuePing(payload);
          }
        } else {
          enqueuePing(payload);
        }
      },
      (err) => console.warn("[gps] erro:", err),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-dark text-slate-900 dark:text-slate-100 flex flex-col">
      <OfflineBanner />
      <header className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-2xl mx-auto p-3 flex items-center justify-between">
          <button onClick={() => navigate("/motorista")} className="flex items-center gap-2">
            <div className="p-1.5 bg-brand-500 rounded-lg text-white">
              <Truck className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-sm leading-tight">RotaCerta</div>
              <div className="text-[10px] text-slate-500 leading-tight">App do Motorista</div>
            </div>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link
              to="/motorista/perfil"
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              aria-label="Perfil"
            >
              <UserCircle2 className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto p-4 pb-24">
        <Outlet />
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 md:hidden">
        <div className="max-w-2xl mx-auto p-3 text-center text-xs text-slate-500">
          Logado como <span className="font-semibold">{user?.name}</span>
        </div>
      </footer>
    </div>
  );
}
