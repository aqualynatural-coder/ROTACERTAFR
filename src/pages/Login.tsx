import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, Loader2, Eye, EyeOff, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import { useThemeStore } from "@/stores/theme.store";

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const { theme, toggle } = useThemeStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      toast.success(`Bem-vindo, ${user.name}!`);
      navigate(user.role === "ADMIN" ? "/admin" : "/motorista", { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Credenciais inválidas");
    }
  };

  const fillDemo = (kind: "admin" | "driver") => {
    if (kind === "admin") {
      setEmail("admin@rotacerta.app");
      setPassword("admin123");
    } else {
      setEmail("motorista@rotacerta.app");
      setPassword("motorista123");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-surface-dark">
      {/* Lado esquerdo - branding */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-500 to-cyan-400 items-center justify-center p-12">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white,transparent_50%),radial-gradient(circle_at_80%_80%,white,transparent_40%)]" />
        <div className="relative z-10 text-white max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white/20 backdrop-blur rounded-2xl">
              <Truck className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold">RotaCerta</h1>
              <p className="text-white/90">Gestão de entregas em tempo real</p>
            </div>
          </div>
          <h2 className="text-3xl font-bold leading-tight mb-4">
            Sua rota, sua entrega, seu controle.
          </h2>
          <p className="text-lg text-white/90">
            Acompanhe motoristas em tempo real, confirme entregas com foto de prova, funcione offline
            e receba alertas imediatos.
          </p>
          <ul className="mt-8 space-y-2 text-white/90">
            <li>✔ Rastreamento GPS ao vivo</li>
            <li>✔ Funciona sem internet (offline-first)</li>
            <li>✔ Foto de prova + geo-fence</li>
            <li>✔ Relatórios completos</li>
          </ul>
        </div>
      </div>

      {/* Lado direito - form */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <button
          onClick={toggle}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          aria-label="Alternar tema"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="w-full max-w-md">
          <div className="md:hidden flex items-center gap-3 mb-6">
            <div className="p-2 bg-brand-500 rounded-xl text-white">
              <Truck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">RotaCerta</h1>
              <p className="text-sm text-slate-500">Gestão de entregas</p>
            </div>
          </div>

          <div className="card p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Entrar</h2>
            <p className="text-slate-500 mb-6">Acesse sua conta para continuar</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">E-mail</label>
                <input
                  type="email"
                  required
                  className="input mt-1"
                  placeholder="voce@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Senha</label>
                <div className="relative mt-1">
                  <input
                    type={showPwd ? "text" : "password"}
                    required
                    className="input pr-12"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Entrar
              </button>
            </form>

            <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-4">
              <p className="text-xs text-slate-500 mb-2">Credenciais de demonstração:</p>
              <div className="flex gap-2">
                <button onClick={() => fillDemo("admin")} className="flex-1 text-sm py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200">
                  👔 Admin
                </button>
                <button onClick={() => fillDemo("driver")} className="flex-1 text-sm py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200">
                  🚚 Motorista
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-slate-500 mt-6">
            © 2026 RotaCerta • Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
}
