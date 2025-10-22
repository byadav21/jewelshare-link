import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Catalog from "./pages/Catalog";
import Auth from "./pages/Auth";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/admin" element={<SuperAdmin />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/import" element={<Import />} />
          <Route path="/share" element={<Share />} />
          <Route path="/interests" element={<Interests />} />
          <Route path="/team" element={<TeamManagement />} />
          <Route path="/custom-order" element={<CustomOrder />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route path="/vendor-approvals" element={<VendorApprovals />} />
          <Route path="/vendor-profile" element={<VendorProfile />} />
          <Route path="/active-sessions" element={<ActiveSessions />} />
          <Route path="/vendor-management" element={<VendorManagement />} />
          <Route path="/global-search" element={<GlobalSearch />} />
          <Route path="/customer-database" element={<CustomerDatabase />} />
          <Route path="/analytics-dashboard" element={<AnalyticsDashboard />} />
          <Route path="/shared/:token" element={<SharedCatalog />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
