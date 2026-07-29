import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { ArrowLeft, LogOut, User, Mail, Truck } from "lucide-react";

export default function DriverProfile() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="space-y-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-brand-500">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="card p-6 text-center">
        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-brand-500 to-cyan-400 text-white flex items-center justify-center font-extrabold text-4xl">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-2xl font-extrabold mt-4">{user?.name}</h1>
        <div className="text-slate-500 text-sm">Motorista</div>
      </div>

      <div className="card divide-y divide-slate-200 dark:divide-slate-800">
        <div className="p-4 flex items-center gap-3">
          <User className="w-5 h-5 text-brand-500" />
          <div>
            <div className="text-xs text-slate-500">Nome</div>
            <div className="font-semibold">{user?.name}</div>
          </div>
        </div>
        <div className="p-4 flex items-center gap-3">
          <Mail className="w-5 h-5 text-brand-500" />
          <div>
            <div className="text-xs text-slate-500">E-mail</div>
            <div className="font-semibold">{user?.email}</div>
          </div>
        </div>
        <div className="p-4 flex items-center gap-3">
          <Truck className="w-5 h-5 text-brand-500" />
          <div>
            <div className="text-xs text-slate-500">Perfil</div>
            <div className="font-semibold">Motorista</div>
          </div>
        </div>
      </div>

      <button
        onClick={() => { logout(); navigate("/login", { replace: true }); }}
        className="btn-danger w-full flex items-center justify-center gap-2"
      >
        <LogOut className="w-5 h-5" /> Sair da conta
      </button>
    </div>
  );
}
