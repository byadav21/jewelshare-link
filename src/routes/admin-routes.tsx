import { Route } from "react-router-dom";
import { AdminLayout } from "@/components/AdminLayout";
import {
  AdminDashboard,
  AdminSettings,
  AdminBlog,
  AdminBrands,
  AdminComments,
  AdminNewsletter,
  AdminPress,
  SuperAdmin,
  VendorApprovals,
  VendorManagement,
  ActiveSessions,
  GlobalSearch,
  CustomerDatabase,
  AnalyticsDashboard,
  AuditLogs,
  ExportReports,
  LoginHistory,
  PlanManagement,
  PermissionPresets,
  MigrateImages,
  ScratchLeads,
} from "./index";
import AdminRewards from "@/pages/AdminRewards";

export const adminRoutes = (
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<AdminDashboard />} />
    <Route path="settings" element={<AdminSettings />} />
    <Route path="blog" element={<AdminBlog />} />
    <Route path="brands" element={<AdminBrands />} />
    <Route path="comments" element={<AdminComments />} />
    <Route path="newsletter" element={<AdminNewsletter />} />
    <Route path="press" element={<AdminPress />} />
    <Route path="rewards" element={<AdminRewards />} />
    <Route path="super" element={<SuperAdmin />} />
    <Route path="approvals" element={<VendorApprovals />} />
    <Route path="vendors" element={<VendorManagement />} />
    <Route path="sessions" element={<ActiveSessions />} />
    <Route path="search" element={<GlobalSearch />} />
    <Route path="customers" element={<CustomerDatabase />} />
    <Route path="analytics" element={<AnalyticsDashboard />} />
    <Route path="audit" element={<AuditLogs />} />
    <Route path="reports" element={<ExportReports />} />
    <Route path="login-history" element={<LoginHistory />} />
    <Route path="plans" element={<PlanManagement />} />
    <Route path="presets" element={<PermissionPresets />} />
    <Route path="migrate-images" element={<MigrateImages />} />
    <Route path="scratch-leads" element={<ScratchLeads />} />
  </Route>
);
