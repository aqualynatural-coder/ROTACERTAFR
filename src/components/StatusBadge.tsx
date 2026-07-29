import clsx from "clsx";
import type { DeliveryStatus } from "@/types";

const LABEL: Record<DeliveryStatus, string> = {
  PENDING: "Pendente",
  ASSIGNED: "Atribuída",
  IN_TRANSIT: "Em trânsito",
  ARRIVED: "No cliente",
  COMPLETED: "Concluída",
  FAILED: "Falha",
  CANCELED: "Cancelada"
};

const COLOR: Record<DeliveryStatus, string> = {
  PENDING: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
  ASSIGNED: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  IN_TRANSIT: "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300",
  ARRIVED: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  CANCELED: "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
};

export function StatusBadge({ status }: { status: DeliveryStatus }) {
  return <span className={clsx("badge", COLOR[status])}>{LABEL[status]}</span>;
}
