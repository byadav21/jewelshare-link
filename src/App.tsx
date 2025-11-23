import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthGuard } from "@/components/AuthGuard";
import { ApprovalGuard } from "@/components/ApprovalGuard";
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
import MigrateImages from "./pages/MigrateImages";
import VideoRequests from "./pages/VideoRequests";
import VendorAnalytics from "./pages/VendorAnalytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/press" element={<Press />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/shared/:token" element={<SharedCatalog />} />
          <Route path="/custom-order" element={<CustomOrder />} />
          
          {/* Auth-only route (requires login but not approval) */}
          <Route path="/pending-approval" element={<AuthGuard><PendingApproval /></AuthGuard>} />
          
          {/* Protected routes (requires login + approval) */}
          <Route path="/catalog" element={<ApprovalGuard><Catalog /></ApprovalGuard>} />
          <Route path="/add-product" element={<ApprovalGuard><AddProduct /></ApprovalGuard>} />
          <Route path="/import" element={<ApprovalGuard><Import /></ApprovalGuard>} />
          <Route path="/share" element={<ApprovalGuard><Share /></ApprovalGuard>} />
          <Route path="/interests" element={<ApprovalGuard><Interests /></ApprovalGuard>} />
          <Route path="/team" element={<ApprovalGuard><TeamManagement /></ApprovalGuard>} />
          <Route path="/vendor-profile" element={<ApprovalGuard><VendorProfile /></ApprovalGuard>} />
          <Route path="/active-sessions" element={<ApprovalGuard><ActiveSessions /></ApprovalGuard>} />
          <Route path="/global-search" element={<ApprovalGuard><GlobalSearch /></ApprovalGuard>} />
          <Route path="/video-requests" element={<ApprovalGuard><VideoRequests /></ApprovalGuard>} />
          <Route path="/vendor-analytics" element={<ApprovalGuard><VendorAnalytics /></ApprovalGuard>} />
          
          {/* Admin routes (requires admin role) */}
          <Route path="/admin" element={<ApprovalGuard><AdminDashboard /></ApprovalGuard>} />
          <Route path="/super-admin" element={<ApprovalGuard><SuperAdmin /></ApprovalGuard>} />
          <Route path="/vendor-approvals" element={<ApprovalGuard><VendorApprovals /></ApprovalGuard>} />
          <Route path="/vendor-management" element={<ApprovalGuard><VendorManagement /></ApprovalGuard>} />
          <Route path="/customer-database" element={<ApprovalGuard><CustomerDatabase /></ApprovalGuard>} />
          <Route path="/analytics-dashboard" element={<ApprovalGuard><AnalyticsDashboard /></ApprovalGuard>} />
          <Route path="/audit-logs" element={<ApprovalGuard><AuditLogs /></ApprovalGuard>} />
          <Route path="/export-reports" element={<ApprovalGuard><ExportReports /></ApprovalGuard>} />
          <Route path="/login-history" element={<ApprovalGuard><LoginHistory /></ApprovalGuard>} />
          <Route path="/migrate-images" element={<ApprovalGuard><MigrateImages /></ApprovalGuard>} />
          
          {/* 404 - must be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
