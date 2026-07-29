import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./stores/auth.store";
import { useThemeStore } from "./stores/theme.store";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/Login";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminDrivers from "./pages/admin/Drivers";
import AdminCustomers from "./pages/admin/Customers";
import AdminRoutes from "./pages/admin/Routes";
import AdminRouteDetail from "./pages/admin/RouteDetail";
import AdminDeliveries from "./pages/admin/Deliveries";
import AdminReports from "./pages/admin/Reports";
import DriverLayout from "./pages/driver/DriverLayout";
import DriverHome from "./pages/driver/Home";
import DriverProfile from "./pages/driver/Profile";
import DriverDeliveryDetail from "./pages/driver/DeliveryDetail";
import DriverComplete from "./pages/driver/Complete";
import DriverFail from "./pages/driver/Fail";

export default function App() {
  const theme = useThemeStore((s) => s.theme);
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* ADMIN */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="motoristas" element={<AdminDrivers />} />
        <Route path="clientes" element={<AdminCustomers />} />
        <Route path="rotas" element={<AdminRoutes />} />
        <Route path="rotas/:id" element={<AdminRouteDetail />} />
        <Route path="entregas" element={<AdminDeliveries />} />
        <Route path="relatorios" element={<AdminReports />} />
      </Route>

      {/* MOTORISTA */}
      <Route
        path="/motorista"
        element={
          <ProtectedRoute roles={["DRIVER"]}>
            <DriverLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DriverHome />} />
        <Route path="perfil" element={<DriverProfile />} />
        <Route path="entrega/:id" element={<DriverDeliveryDetail />} />
        <Route path="entrega/:id/concluir" element={<DriverComplete />} />
        <Route path="entrega/:id/falha" element={<DriverFail />} />
      </Route>

      {/* Raiz — redireciona por perfil */}
      <Route
        path="/"
        element={
          <Navigate
            to={user ? (user.role === "ADMIN" ? "/admin" : "/motorista") : "/login"}
            replace
          />
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
