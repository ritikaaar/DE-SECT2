import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import { VehicleDataProvider } from "@/lib/vehicle-data";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./components/DashboardLayout";
import UserDashboard from "./pages/UserDashboard";
import PUCOfficerDashboard from "./pages/PUCOfficerDashboard";
import PatrolOfficerDashboard from "./pages/PatrolOfficerDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <VehicleDataProvider>
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route path="user" element={<UserDashboard />} />
                <Route path="puc-officer" element={<PUCOfficerDashboard />} />
                <Route path="patrol-officer" element={<PatrolOfficerDashboard />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </VehicleDataProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
