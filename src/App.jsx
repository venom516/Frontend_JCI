import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SiteConfigProvider } from "./contexts/SiteConfigContext";
import { SidebarProvider } from "./contexts/SidebarContext";
import { ThemeProvider } from "./components/layout/ThemeProvider";
import PublicLayout from "./components/layout/PublicLayout";
import DashboardLayout from "./components/layout/DashboardLayout";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoadingScreen from "./components/common/LoadingScreen";
import ProtectedRoute from "./components/common/ProtectedRoute";

import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPassword from "./components/auth/ForgotPassword";
import AboutPage from "./pages/AboutPage";
import ActualitesPage from "./pages/ActualitesPage";
import ContactPage from "./pages/ContactPage";
import FormationsPage from "./pages/FormationsPage";
import NewsDetailPage from "./pages/NewsDetailPage";
import VerificationPage from "./pages/VerificationPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import TasksPage from "./pages/TasksPage";
import EventsPage from "./pages/EventsPage";
import MembresPage from "./pages/MembresPage";

import PublicationsPage from "./pages/PublicationsPage";
import DocumentsPage from "./pages/DocumentsPage";
import NewsManagementPage from "./pages/NewsManagementPage";
import CalendarPage from "./pages/CalendarPage";
import MediaCalendarPage from "./pages/MediaCalendarPage";
import PresidentCalendarPage from "./pages/PresidentCalendarPage";
import GeneralCalendarPage from "./pages/GeneralCalendarPage";
import PresidentMediaCalendarPage from "./pages/PresidentMediaCalendarPage";
import AdminDashboard from "./pages/AdminDashboard";
import MembreDashboard from "./pages/MembreDashboard";
import PresidentValidations from "./pages/PresidentValidations";
import PresidentContacts from "./pages/PresidentContacts";
import PresidentSiteConfig from "./pages/PresidentSiteConfig";
import PresidentLink from "./pages/PresidentLink";
import MemberLink from "./pages/MemberLink";
import TasksEventsPage from "./pages/TasksEventsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false, staleTime: 30000 },
  },
});

function ProtectedLayout({ children }) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}

function AppRoutes() {
  const { loading, isAuthenticated } = useAuth();
  if (loading) return <LoadingScreen text="Chargement de l'application..." />;

  return (
    <Routes>
      {/* Publiques (accessibles sans auth) */}
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <PublicLayout><Home /></PublicLayout>} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <PublicLayout><LoginPage /></PublicLayout>} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <PublicLayout><RegisterPage /></PublicLayout>} />
      <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <PublicLayout><ForgotPassword /></PublicLayout>} />
      <Route path="/verify-email" element={<PublicLayout><VerificationPage /></PublicLayout>} />
      <Route path="/about" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <PublicLayout><AboutPage /></PublicLayout>} />
      <Route path="/contact" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <PublicLayout><ContactPage /></PublicLayout>} />
      <Route path="/formations" element={<ProtectedRoute><PublicLayout><FormationsPage /></PublicLayout></ProtectedRoute>} />
      <Route path="/actualites" element={<ProtectedRoute><PublicLayout><ActualitesPage /></PublicLayout></ProtectedRoute>} />
      <Route path="/news/:id" element={<ProtectedRoute><PublicLayout><NewsDetailPage /></PublicLayout></ProtectedRoute>} />
      <Route path="/auth/president-link" element={<PresidentLink />} />
      <Route path="/auth/member-link" element={<MemberLink />} />

      {/* Protégées */}
      <Route path="/dashboard" element={<ProtectedRoute><ProtectedLayout><DashboardPage /></ProtectedLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProtectedLayout><ProfilePage /></ProtectedLayout></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute excludeRoles={["Membre"]}><ProtectedLayout><CalendarPage /></ProtectedLayout></ProtectedRoute>} />
      <Route path="/members" element={<ProtectedRoute roles={["Admin", "President", "SecretaireGeneral", "ConseillerMedia"]}><ProtectedLayout><MembresPage /></ProtectedLayout></ProtectedRoute>} />
      <Route path="/tasks" element={<ProtectedRoute excludeRoles={["Membre"]}><ProtectedLayout><TasksPage /></ProtectedLayout></ProtectedRoute>} />
      <Route path="/tasks/normale" element={<ProtectedRoute excludeRoles={["Membre"]}><ProtectedLayout><TasksPage /></ProtectedLayout></ProtectedRoute>} />
      <Route path="/tasks/media" element={<ProtectedRoute roles={["President", "ConseillerMedia"]}><ProtectedLayout><TasksPage /></ProtectedLayout></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute excludeRoles={["Membre"]}><ProtectedLayout><EventsPage /></ProtectedLayout></ProtectedRoute>} />
      <Route path="/tasks-events" element={<ProtectedRoute roles={["Membre"]}><ProtectedLayout><TasksEventsPage /></ProtectedLayout></ProtectedRoute>} />
      <Route path="/news" element={<ProtectedRoute roles={["ConseillerMedia", "President"]}><ProtectedLayout><NewsManagementPage /></ProtectedLayout></ProtectedRoute>} />
      <Route path="/news/create" element={<ProtectedRoute roles={["ConseillerMedia", "President"]}><ProtectedLayout><NewsManagementPage /></ProtectedLayout></ProtectedRoute>} />
      <Route path="/news/edit/:id" element={<ProtectedRoute roles={["ConseillerMedia", "President"]}><ProtectedLayout><NewsManagementPage /></ProtectedLayout></ProtectedRoute>} />
      <Route path="/publications" element={<ProtectedRoute roles={["ConseillerMedia", "President"]}><ProtectedLayout><PublicationsPage /></ProtectedLayout></ProtectedRoute>} />
      <Route path="/calendar/media" element={<ProtectedRoute roles={["ConseillerMedia", "President"]}><ProtectedLayout><MediaCalendarPage /></ProtectedLayout></ProtectedRoute>} />
      <Route path="/calendar/president" element={<ProtectedRoute roles={["President"]}><ProtectedLayout><PresidentCalendarPage /></ProtectedLayout></ProtectedRoute>} />
      <Route path="/documents" element={<ProtectedRoute roles={["SecretaireGeneral", "President"]}><ProtectedLayout><DocumentsPage /></ProtectedLayout></ProtectedRoute>} />
      <Route path="/dashboard/admin" element={<ProtectedRoute roles={["Admin", "President"]}><ProtectedLayout><AdminDashboard /></ProtectedLayout></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute roles={["President"]}><Navigate to="/president/validations" replace /></ProtectedRoute>} />
      <Route path="/calendar/general" element={<ProtectedRoute roles={["President"]}><ProtectedLayout><GeneralCalendarPage /></ProtectedLayout></ProtectedRoute>} />
      <Route path="/calendar/president/media" element={<ProtectedRoute roles={["President"]}><ProtectedLayout><PresidentMediaCalendarPage /></ProtectedLayout></ProtectedRoute>} />
      <Route path="/president/validations" element={<ProtectedRoute roles={["President"]}><ProtectedLayout><PresidentValidations defaultTab="membres" /></ProtectedLayout></ProtectedRoute>} />
      <Route path="/president/entretiens" element={<ProtectedRoute roles={["President"]}><ProtectedLayout><PresidentValidations defaultTab="entretiens" /></ProtectedLayout></ProtectedRoute>} />
      <Route path="/president/contacts" element={<ProtectedRoute roles={["President"]}><ProtectedLayout><PresidentContacts /></ProtectedLayout></ProtectedRoute>} />
      <Route path="/president/config" element={<ProtectedRoute roles={["President"]}><ProtectedLayout><PresidentSiteConfig /></ProtectedLayout></ProtectedRoute>} />
      <Route path="/dashboard/membre" element={<ProtectedRoute roles={["Membre", "PP", "Past President", "PPI", "Sénateur"]}><ProtectedLayout><MembreDashboard /></ProtectedLayout></ProtectedRoute>} />
      <Route path="/dashboard/past-president" element={<ProtectedRoute roles={["PP", "Past President"]}><ProtectedLayout><MembreDashboard /></ProtectedLayout></ProtectedRoute>} />
      <Route path="/dashboard/senateur" element={<ProtectedRoute roles={["Sénateur"]}><ProtectedLayout><MembreDashboard /></ProtectedLayout></ProtectedRoute>} />
      <Route path="/dashboard/ppi" element={<ProtectedRoute roles={["PPI"]}><ProtectedLayout><MembreDashboard /></ProtectedLayout></ProtectedRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SiteConfigProvider>
          <SidebarProvider>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
              <TooltipProvider>
                <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                  <AppRoutes />
                  <Toaster />
                </Router>
              </TooltipProvider>
            </ThemeProvider>
          </SidebarProvider>
        </SiteConfigProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
