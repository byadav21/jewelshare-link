/**
 * Main application component
 * Sets up routing, providers, global components, and PWA
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { RouteSuspense } from "@/components/RouteSuspense";
import { AuthGuard } from "@/components/AuthGuard";
import { ApprovalGuard } from "@/components/ApprovalGuard";
import { AdminGuard } from "@/components/AdminGuard";
import { ROUTES } from "@/constants/routes";
import { usePWA } from "@/hooks/usePWA";

// Lazy-loaded page imports
import * as Pages from "@/routes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AppContent = () => {
  // Initialize PWA
  usePWA();

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path={ROUTES.HOME} 
        element={<RouteSuspense><Pages.Index /></RouteSuspense>} 
      />
      <Route 
        path={ROUTES.PRICING} 
        element={<RouteSuspense><Pages.Pricing /></RouteSuspense>} 
      />
      <Route 
        path={ROUTES.BLOG} 
        element={<RouteSuspense><Pages.Blog /></RouteSuspense>} 
      />
      <Route 
        path={ROUTES.BLOG_POST} 
        element={<RouteSuspense><Pages.BlogPost /></RouteSuspense>} 
      />
      <Route 
        path={ROUTES.PRESS} 
        element={<RouteSuspense><Pages.Press /></RouteSuspense>} 
      />
      <Route 
        path={ROUTES.DEMO} 
        element={<RouteSuspense><Pages.Demo /></RouteSuspense>} 
      />
      <Route 
        path={ROUTES.ABOUT} 
        element={<RouteSuspense><Pages.About /></RouteSuspense>} 
      />
      <Route 
        path={ROUTES.CONTACT} 
        element={<RouteSuspense><Pages.Contact /></RouteSuspense>} 
      />
      <Route 
        path={ROUTES.AUTH} 
        element={<RouteSuspense><Pages.Auth /></RouteSuspense>} 
      />
      <Route 
        path={ROUTES.RESET_PASSWORD} 
        element={<RouteSuspense><Pages.ResetPassword /></RouteSuspense>} 
      />
      <Route 
        path={ROUTES.SHARED_CATALOG} 
        element={<RouteSuspense><Pages.SharedCatalog /></RouteSuspense>} 
      />
      <Route 
        path={ROUTES.CUSTOM_ORDER} 
        element={<RouteSuspense><Pages.CustomOrder /></RouteSuspense>} 
      />
      <Route 
        path={ROUTES.IMAGE_DEMO} 
        element={<RouteSuspense><Pages.ImageOptimizationDemo /></RouteSuspense>} 
      />

      {/* Auth-only route (requires login but not approval) */}
      <Route 
        path={ROUTES.PENDING_APPROVAL} 
        element={
          <AuthGuard>
            <RouteSuspense><Pages.PendingApproval /></RouteSuspense>
          </AuthGuard>
        } 
      />
      
      {/* Protected vendor routes (requires login + approval) */}
      <Route 
        path={ROUTES.CATALOG} 
        element={
          <ApprovalGuard>
            <RouteSuspense><Pages.Catalog /></RouteSuspense>
          </ApprovalGuard>
        } 
      />
      <Route 
        path={ROUTES.ADD_PRODUCT} 
        element={
          <ApprovalGuard>
            <RouteSuspense><Pages.AddProduct /></RouteSuspense>
          </ApprovalGuard>
        } 
      />
      <Route 
        path={ROUTES.IMPORT} 
        element={
          <ApprovalGuard>
            <RouteSuspense><Pages.Import /></RouteSuspense>
          </ApprovalGuard>
        } 
      />
      <Route 
        path={ROUTES.SHARE} 
        element={
          <ApprovalGuard>
            <RouteSuspense><Pages.Share /></RouteSuspense>
          </ApprovalGuard>
        } 
      />
      <Route 
        path={ROUTES.INTERESTS} 
        element={
          <ApprovalGuard>
            <RouteSuspense><Pages.Interests /></RouteSuspense>
          </ApprovalGuard>
        } 
      />
      <Route 
        path={ROUTES.TEAM} 
        element={
          <ApprovalGuard>
            <RouteSuspense><Pages.TeamManagement /></RouteSuspense>
          </ApprovalGuard>
        } 
      />
      <Route 
        path={ROUTES.VENDOR_PROFILE} 
        element={
          <ApprovalGuard>
            <RouteSuspense><Pages.VendorProfile /></RouteSuspense>
          </ApprovalGuard>
        } 
      />
      <Route 
        path={ROUTES.ACTIVE_SESSIONS} 
        element={
          <ApprovalGuard>
            <RouteSuspense><Pages.ActiveSessions /></RouteSuspense>
          </ApprovalGuard>
        } 
      />
      <Route 
        path={ROUTES.GLOBAL_SEARCH} 
        element={
          <ApprovalGuard>
            <RouteSuspense><Pages.GlobalSearch /></RouteSuspense>
          </ApprovalGuard>
        } 
      />
      <Route 
        path={ROUTES.VIDEO_REQUESTS} 
        element={
          <ApprovalGuard>
            <RouteSuspense><Pages.VideoRequests /></RouteSuspense>
          </ApprovalGuard>
        } 
      />
      <Route 
        path={ROUTES.VENDOR_ANALYTICS} 
        element={
          <ApprovalGuard>
            <RouteSuspense><Pages.VendorAnalytics /></RouteSuspense>
          </ApprovalGuard>
        } 
      />
      
      {/* Admin routes (requires admin role) */}
      <Route 
        path={ROUTES.ADMIN}
        element={
          <AdminGuard>
            <RouteSuspense><Pages.AdminDashboard /></RouteSuspense>
          </AdminGuard>
        } 
      />
      <Route 
        path={ROUTES.ADMIN_SETTINGS} 
        element={
          <AdminGuard>
            <RouteSuspense><Pages.AdminSettings /></RouteSuspense>
          </AdminGuard>
        } 
      />
      <Route 
        path={ROUTES.ADMIN_BLOG} 
        element={
          <AdminGuard>
            <RouteSuspense><Pages.AdminBlog /></RouteSuspense>
          </AdminGuard>
        } 
      />
      <Route 
        path={ROUTES.ADMIN_BRANDS} 
        element={
          <AdminGuard>
            <RouteSuspense><Pages.AdminBrands /></RouteSuspense>
          </AdminGuard>
        } 
      />
      <Route 
        path={ROUTES.ADMIN_COMMENTS} 
        element={
          <AdminGuard>
            <RouteSuspense><Pages.AdminComments /></RouteSuspense>
          </AdminGuard>
        } 
      />
      <Route 
        path={ROUTES.ADMIN_NEWSLETTER} 
        element={
          <AdminGuard>
            <RouteSuspense><Pages.AdminNewsletter /></RouteSuspense>
          </AdminGuard>
        } 
      />
      <Route 
        path={ROUTES.ADMIN_PRESS} 
        element={
          <AdminGuard>
            <RouteSuspense><Pages.AdminPress /></RouteSuspense>
          </AdminGuard>
        } 
      />
      <Route 
        path={ROUTES.SUPER_ADMIN}
        element={
          <AdminGuard>
            <RouteSuspense><Pages.SuperAdmin /></RouteSuspense>
          </AdminGuard>
        } 
      />
      <Route 
        path={ROUTES.VENDOR_APPROVALS} 
        element={
          <AdminGuard>
            <RouteSuspense><Pages.VendorApprovals /></RouteSuspense>
          </AdminGuard>
        } 
      />
      <Route 
        path={ROUTES.VENDOR_MANAGEMENT} 
        element={
          <AdminGuard>
            <RouteSuspense><Pages.VendorManagement /></RouteSuspense>
          </AdminGuard>
        } 
      />
      <Route 
        path={ROUTES.CUSTOMER_DATABASE} 
        element={
          <AdminGuard>
            <RouteSuspense><Pages.CustomerDatabase /></RouteSuspense>
          </AdminGuard>
        } 
      />
      <Route 
        path={ROUTES.ANALYTICS_DASHBOARD} 
        element={
          <AdminGuard>
            <RouteSuspense><Pages.AnalyticsDashboard /></RouteSuspense>
          </AdminGuard>
        } 
      />
      <Route 
        path={ROUTES.AUDIT_LOGS} 
        element={
          <AdminGuard>
            <RouteSuspense><Pages.AuditLogs /></RouteSuspense>
          </AdminGuard>
        } 
      />
      <Route 
        path={ROUTES.EXPORT_REPORTS} 
        element={
          <AdminGuard>
            <RouteSuspense><Pages.ExportReports /></RouteSuspense>
          </AdminGuard>
        } 
      />
      <Route 
        path={ROUTES.LOGIN_HISTORY} 
        element={
          <AdminGuard>
            <RouteSuspense><Pages.LoginHistory /></RouteSuspense>
          </AdminGuard>
        } 
      />
      <Route 
        path={ROUTES.PLAN_MANAGEMENT} 
        element={
          <AdminGuard>
            <RouteSuspense><Pages.PlanManagement /></RouteSuspense>
          </AdminGuard>
        } 
      />
      <Route 
        path={ROUTES.PERMISSION_PRESETS} 
        element={
          <AdminGuard>
            <RouteSuspense><Pages.PermissionPresets /></RouteSuspense>
          </AdminGuard>
        } 
      />
      <Route 
        path={ROUTES.MIGRATE_IMAGES} 
        element={
          <AdminGuard>
            <RouteSuspense><Pages.MigrateImages /></RouteSuspense>
          </AdminGuard>
        } 
      />
      <Route 
        path={ROUTES.SCRATCH_LEADS} 
        element={
          <AdminGuard>
            <RouteSuspense><Pages.ScratchLeads /></RouteSuspense>
          </AdminGuard>
        } 
      />
      
      {/* 404 - must be last */}
      <Route 
        path={ROUTES.NOT_FOUND} 
        element={<RouteSuspense><Pages.NotFound /></RouteSuspense>} 
      />
    </Routes>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
