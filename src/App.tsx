import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layouts
import { PublicLayout } from "@/components/layout/PublicLayout";
import { EmbedLayout } from "@/components/layout/EmbedLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Public pages
import CompetitionsPage from "@/pages/public/CompetitionsPage";
import CompetitionDetailPage from "@/pages/public/CompetitionDetailPage";

// Embed pages
import EmbedCompetitionsPage from "@/pages/embed/EmbedCompetitionsPage";
import EmbedCompetitionDetailPage from "@/pages/embed/EmbedCompetitionDetailPage";

// Admin pages
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminCompetitionsPage from "@/pages/admin/AdminCompetitionsPage";
import AdminCompetitionFormPage from "@/pages/admin/AdminCompetitionFormPage";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";

import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<CompetitionsPage />} />
            <Route path="/concursuri" element={<CompetitionsPage />} />
            <Route path="/concursuri/:slug" element={<CompetitionDetailPage />} />
          </Route>

          {/* Embed routes (no header/footer) */}
          <Route path="/embed" element={<EmbedLayout />}>
            <Route path="concursuri" element={<EmbedCompetitionsPage />} />
            <Route path="concursuri/:slug" element={<EmbedCompetitionDetailPage />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="concursuri" element={<AdminCompetitionsPage />} />
            <Route path="concursuri/nou" element={<AdminCompetitionFormPage />} />
            <Route path="concursuri/:id" element={<AdminCompetitionFormPage />} />
            <Route path="utilizatori" element={<AdminUsersPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
