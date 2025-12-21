/**
 * Main application component
 * Sets up routing, providers, global components, and PWA
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { RouteSuspense } from "@/components/RouteSuspense";
import { AuthGuard } from "@/components/AuthGuard";
import { ApprovalGuard } from "@/components/ApprovalGuard";
import { AdminGuard } from "@/components/AdminGuard";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { ROUTES } from "@/constants/routes";
import { usePWA } from "@/hooks/usePWA";

// Lazy-loaded page imports
import * as Pages from "@/routes";
import * as InvoiceRoutes from "@/routes/invoiceRoutes";

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
        path={ROUTES.WISHLIST} 
        element={<RouteSuspense><Pages.Wishlist /></RouteSuspense>} 
      />
      <Route 
        path={ROUTES.CUSTOM_ORDER} 
        element={<RouteSuspense><Pages.CustomOrder /></RouteSuspense>} 
      />
      <Route 
        path={ROUTES.IMAGE_DEMO} 
        element={<RouteSuspense><Pages.ImageOptimizationDemo /></RouteSuspense>} 
      />
      <Route 
        path={ROUTES.DIAMOND_CALCULATOR} 
        element={<RouteSuspense><Pages.DiamondCalculator /></RouteSuspense>} 
      />
      <Route 
        path={ROUTES.DIAMOND_SIZING_CHART} 
        element={<RouteSuspense><Pages.DiamondSizingChart /></RouteSuspense>} 
      />
      {/* Redirect short URLs to full URLs */}
      <Route path="/diamond-sizing" element={<Navigate to={ROUTES.DIAMOND_SIZING_CHART} replace />} />
      <Route path="/diamond-sieve" element={<Navigate to={ROUTES.DIAMOND_SIEVE_CHART} replace />} />
      <Route 
        path={ROUTES.DIAMOND_SIEVE_CHART} 
        element={<RouteSuspense><Pages.DiamondSieveChart /></RouteSuspense>} 
      />
      <Route 
        path={ROUTES.DIAMOND_EDUCATION} 
        element={<RouteSuspense><Pages.DiamondEducation /></RouteSuspense>} 
      />
      <Route 
        path={ROUTES.MANUFACTURING_COST} 
        element={<RouteSuspense><Pages.ManufacturingCost /></RouteSuspense>} 
      />
      <Route
        path={ROUTES.INVOICE_GENERATOR} 
        element={<RouteSuspense><InvoiceRoutes.InvoiceGenerator /></RouteSuspense>} 
      />
      <Route 
        path={ROUTES.INVOICE_TEMPLATES} 
        element={<RouteSuspense><InvoiceRoutes.InvoiceTemplates /></RouteSuspense>} 
      />
      <Route 
        path={ROUTES.INVOICE_TEMPLATE_BUILDER} 
        element={<RouteSuspense><InvoiceRoutes.InvoiceTemplateBuilder /></RouteSuspense>} 
      />
      <Route 
        path={ROUTES.INVOICE_TEMPLATE_BUILDER_EDIT} 
        element={<RouteSuspense><InvoiceRoutes.InvoiceTemplateBuilder /></RouteSuspense>} 
      />
      <Route 
        path={ROUTES.CALCULATORS} 
        element={<RouteSuspense><Pages.Calculators /></RouteSuspense>} 
      />
      <Route 
        path={ROUTES.ORDER_TRACKING} 
        element={<RouteSuspense><Pages.OrderTracking /></RouteSuspense>} 
      />
      <Route 
        path={ROUTES.PRIVACY_POLICY} 
        element={<RouteSuspense><Pages.PrivacyPolicy /></RouteSuspense>} 
      />
      <Route 
        path={ROUTES.TERMS_OF_SERVICE} 
        element={<RouteSuspense><Pages.TermsOfService /></RouteSuspense>} 
      />
      <Route 
        path={ROUTES.COOKIE_POLICY} 
        element={<RouteSuspense><Pages.CookiePolicyPage /></RouteSuspense>} 
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
      <Route 
        path={ROUTES.PURCHASE_INQUIRIES} 
        element={
          <ApprovalGuard>
            <RouteSuspense><Pages.PurchaseInquiries /></RouteSuspense>
          </ApprovalGuard>
        } 
      />
      <Route 
        path={ROUTES.REWARDS} 
        element={
          <ApprovalGuard>
            <RouteSuspense><Pages.Rewards /></RouteSuspense>
          </ApprovalGuard>
        } 
      />
      <Route 
        path={ROUTES.INVOICE_HISTORY} 
        element={
          <ApprovalGuard>
            <RouteSuspense><InvoiceRoutes.InvoiceHistory /></RouteSuspense>
          </ApprovalGuard>
        } 
      />
      <Route 
        path={ROUTES.ESTIMATE_HISTORY} 
        element={
          <ApprovalGuard>
            <RouteSuspense><InvoiceRoutes.EstimateHistory /></RouteSuspense>
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
        path={ROUTES.ADMIN_REWARDS} 
        element={
          <AdminGuard>
            <RouteSuspense><Pages.AdminRewards /></RouteSuspense>
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
        path={ROUTES.ADMIN_MANUFACTURING_ORDERS} 
        element={
          <AdminGuard>
            <RouteSuspense><Pages.AdminManufacturingOrders /></RouteSuspense>
          </AdminGuard>
        } 
      />
      <Route 
        path={ROUTES.GUEST_CALCULATOR_ANALYTICS} 
        element={
          <AdminGuard>
            <RouteSuspense><Pages.GuestCalculatorAnalytics /></RouteSuspense>
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
      <Route 
        path={ROUTES.ADMIN_DIAMOND_PRICES} 
        element={
          <AdminGuard>
            <RouteSuspense><Pages.AdminDiamondPrices /></RouteSuspense>
          </AdminGuard>
        } 
      />
      <Route 
        path={ROUTES.ADMIN_LEGAL_PAGES} 
        element={
          <AdminGuard>
            <RouteSuspense><Pages.AdminLegalPages /></RouteSuspense>
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
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ThemeSwitcher />
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
