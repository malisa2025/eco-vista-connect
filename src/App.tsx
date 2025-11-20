import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Businesses from "./pages/Businesses";
import BusinessDetail from "./pages/BusinessDetail";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import RegisterBusiness from "./pages/RegisterBusiness";
import MyBusinesses from "./pages/MyBusinesses";
import Favorites from "./pages/Favorites";
import Inbox from "./pages/Inbox";
import PurchaseAd from "./pages/PurchaseAd";
import AdminDashboard from "./pages/admin/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/businesses" element={<Businesses />} />
            <Route path="/businesses/:id" element={<BusinessDetail />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/inbox"
              element={
                <ProtectedRoute>
                  <Inbox />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/register-business"
              element={
                <ProtectedRoute>
                  <RegisterBusiness />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-businesses"
              element={
                <ProtectedRoute requireRole="business_owner">
                  <MyBusinesses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/purchase-ad"
              element={
                <ProtectedRoute requireRole="business_owner">
                  <PurchaseAd />
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requireRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
