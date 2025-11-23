/**
 * Main application component
 * Sets up routing, providers, and global components
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthGuard } from "@/components/AuthGuard";
import { ApprovalGuard } from "@/components/ApprovalGuard";
import { AdminGuard } from "@/components/AdminGuard";
import { ROUTES } from "@/constants/routes";

// Page imports
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Press from "./pages/Press";
import Demo from "./pages/Demo";
import AdminDashboard from "./pages/AdminDashboard";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Catalog from "./pages/Catalog";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import AddProduct from "./pages/AddProduct";
import Import from "./pages/Import";
import Share from "./pages/Share";
import SharedCatalog from "./pages/SharedCatalog";
import Interests from "./pages/Interests";
import TeamManagement from "./pages/TeamManagement";
import SuperAdmin from "./pages/SuperAdmin";
import CustomOrder from "./pages/CustomOrder";
import NotFound from "./pages/NotFound";
import PendingApproval from "./pages/PendingApproval";
import VendorApprovals from "./pages/VendorApprovals";
import VendorProfile from "./pages/VendorProfile";
import ActiveSessions from "./pages/ActiveSessions";
import VendorManagement from "./pages/VendorManagement";
import GlobalSearch from "./pages/GlobalSearch";
import CustomerDatabase from "./pages/CustomerDatabase";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import AuditLogs from "./pages/AuditLogs";
import ExportReports from "./pages/ExportReports";
import LoginHistory from "./pages/LoginHistory";
import PlanManagement from "./pages/PlanManagement";
import PermissionPresets from "./pages/PermissionPresets";
import MigrateImages from "./pages/MigrateImages";
import VideoRequests from "./pages/VideoRequests";
import VendorAnalytics from "./pages/VendorAnalytics";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path={ROUTES.HOME} element={<Index />} />
            <Route path={ROUTES.PRICING} element={<Pricing />} />
            <Route path={ROUTES.BLOG} element={<Blog />} />
            <Route path={ROUTES.BLOG_POST} element={<BlogPost />} />
            <Route path={ROUTES.PRESS} element={<Press />} />
            <Route path={ROUTES.DEMO} element={<Demo />} />
            <Route path={ROUTES.ABOUT} element={<About />} />
            <Route path={ROUTES.CONTACT} element={<Contact />} />
            <Route path={ROUTES.AUTH} element={<Auth />} />
            <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
            <Route path={ROUTES.SHARED_CATALOG} element={<SharedCatalog />} />
            <Route path={ROUTES.CUSTOM_ORDER} element={<CustomOrder />} />
            
            {/* Auth-only route (requires login but not approval) */}
            <Route 
              path={ROUTES.PENDING_APPROVAL} 
              element={<AuthGuard><PendingApproval /></AuthGuard>} 
            />
            
            {/* Protected routes (requires login + approval) */}
            <Route path={ROUTES.CATALOG} element={<ApprovalGuard><Catalog /></ApprovalGuard>} />
            <Route path={ROUTES.ADD_PRODUCT} element={<ApprovalGuard><AddProduct /></ApprovalGuard>} />
            <Route path={ROUTES.IMPORT} element={<ApprovalGuard><Import /></ApprovalGuard>} />
            <Route path={ROUTES.SHARE} element={<ApprovalGuard><Share /></ApprovalGuard>} />
            <Route path={ROUTES.INTERESTS} element={<ApprovalGuard><Interests /></ApprovalGuard>} />
            <Route path={ROUTES.TEAM} element={<ApprovalGuard><TeamManagement /></ApprovalGuard>} />
            <Route path={ROUTES.VENDOR_PROFILE} element={<ApprovalGuard><VendorProfile /></ApprovalGuard>} />
            <Route path={ROUTES.ACTIVE_SESSIONS} element={<ApprovalGuard><ActiveSessions /></ApprovalGuard>} />
            <Route path={ROUTES.GLOBAL_SEARCH} element={<ApprovalGuard><GlobalSearch /></ApprovalGuard>} />
            <Route path={ROUTES.VIDEO_REQUESTS} element={<ApprovalGuard><VideoRequests /></ApprovalGuard>} />
            <Route path={ROUTES.VENDOR_ANALYTICS} element={<ApprovalGuard><VendorAnalytics /></ApprovalGuard>} />
            
            {/* Admin routes (requires admin role) */}
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path={ROUTES.SUPER_ADMIN} element={<AdminGuard><SuperAdmin /></AdminGuard>} />
            <Route path={ROUTES.VENDOR_APPROVALS} element={<AdminGuard><VendorApprovals /></AdminGuard>} />
            <Route path={ROUTES.VENDOR_MANAGEMENT} element={<AdminGuard><VendorManagement /></AdminGuard>} />
            <Route path={ROUTES.CUSTOMER_DATABASE} element={<AdminGuard><CustomerDatabase /></AdminGuard>} />
            <Route path={ROUTES.ANALYTICS_DASHBOARD} element={<AdminGuard><AnalyticsDashboard /></AdminGuard>} />
            <Route path={ROUTES.AUDIT_LOGS} element={<AdminGuard><AuditLogs /></AdminGuard>} />
            <Route path={ROUTES.EXPORT_REPORTS} element={<AdminGuard><ExportReports /></AdminGuard>} />
            <Route path={ROUTES.LOGIN_HISTORY} element={<AdminGuard><LoginHistory /></AdminGuard>} />
            <Route path={ROUTES.PLAN_MANAGEMENT} element={<AdminGuard><PlanManagement /></AdminGuard>} />
            <Route path={ROUTES.PERMISSION_PRESETS} element={<AdminGuard><PermissionPresets /></AdminGuard>} />
            <Route path={ROUTES.MIGRATE_IMAGES} element={<AdminGuard><MigrateImages /></AdminGuard>} />
            
            {/* 404 - must be last */}
            <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
