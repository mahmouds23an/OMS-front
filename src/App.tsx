import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import MainLayout from "@/components/Layout/MainLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import OrdersPage from "@/pages/OrdersPage";
import ClientsPage from "@/pages/ClientsPage";
import SettingsPage from "@/pages/SettingsPage";
import AccountSettingsPage from "@/pages/AccountSettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <DashboardPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <OrdersPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/clients"
                  element={
                    <ProtectedRoute adminOnly>
                      <MainLayout>
                        <ClientsPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <SettingsPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <AccountSettingsPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
