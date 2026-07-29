import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import type { Role } from "@/types";

interface Props {
  roles?: Role[];
  children: React.ReactNode;
}

export default function ProtectedRoute({ roles, children }: Props) {
  const user = useAuthStore((s) => s.user);

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={user.role === "ADMIN" ? "/admin" : "/motorista"} replace />;
  }
  return <>{children}</>;
}
