import { Link } from "react-router-dom";
import { Truck, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-surface-dark p-6">
      <div className="text-center max-w-md">
        <div className="inline-flex p-4 bg-brand-500 rounded-2xl text-white mb-6">
          <Truck className="w-10 h-10" />
        </div>
        <div className="text-8xl font-extrabold text-brand-500">404</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">Rota não encontrada</h1>
        <p className="text-slate-500 mt-2">A página que você tentou acessar não existe ou foi movida.</p>
        <Link to="/login" className="btn-primary inline-flex items-center gap-2 mt-6">
          <Home className="w-4 h-4" /> Voltar ao início
        </Link>
      </div>
    </div>
  );
}
