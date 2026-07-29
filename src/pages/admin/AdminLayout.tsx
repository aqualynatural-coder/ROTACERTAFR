import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Truck,
  Map,
  Package,
  BarChart3,
  LogOut,
  Moon,
  Sun,
  Bell,
  Menu
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { useAuthStore } from "@/stores/auth.store";
import { useThemeStore } from "@/stores/theme.store";
import OfflineBanner from "@/components/OfflineBanner";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/motoristas", label: "Motoristas", icon: Truck },
  { to: "/admin/clientes", label: "Clientes", icon: Users },
  { to: "/admin/rotas", label: "Rotas", icon: Map },
  { to: "/admin/entregas", label: "Entregas", icon: Package },
  { to: "/admin/relatorios", label: "Relatórios", icon: BarChart3 }
];

export default function AdminLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { theme, toggle } = useThemeStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-surface-dark text-slate-900 dark:text-slate-100">
      <OfflineBanner />

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed md:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-brand-500 rounded-xl text-white">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="font-extrabold text-lg">RotaCerta</div>
            <div className="text-xs text-slate-500">Painel Admin</div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition",
                  isActive
                    ? "bg-brand-500 text-white shadow-soft"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                )
              }
            >
              <n.icon className="w-5 h-5" />
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
            <div className="w-9 h-9 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{user?.name}</div>
              <div className="text-xs text-slate-500 truncate">{user?.email}</div>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={toggle}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              Tema
            </button>
            <button
              onClick={() => {
                logout();
                navigate("/login", { replace: true });
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 text-sm"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <button onClick={() => setOpen(true)} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
            <Menu className="w-5 h-5" />
          </button>
          <div className="font-bold">RotaCerta</div>
          <button className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
            <Bell className="w-5 h-5" />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
