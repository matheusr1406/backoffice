import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminLayout } from "@/components/layout/AdminLayout";
import Login from "@/pages/auth/Login";
import Dashboard from "@/pages/Dashboard";
import Users from "@/pages/Users";
import BackofficeTeam from "@/pages/BackofficeTeam";
import Community from "@/pages/Community";
import Coupons from "@/pages/Coupons";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AuthRedirect() {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) return null;

  if (user && isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Login />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthRedirect />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Users />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/team"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <BackofficeTeam />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/comunidade"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Community />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cupons"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Coupons />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
