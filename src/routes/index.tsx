/**
 * Lazy-loaded route components
 * Routes are split into chunks for optimal loading performance
 */

import { lazy } from "react";

// Public pages - Loaded on demand
export const Index = lazy(() => import("@/pages/Index"));
export const Pricing = lazy(() => import("@/pages/Pricing"));
export const Blog = lazy(() => import("@/pages/Blog"));
export const BlogPost = lazy(() => import("@/pages/BlogPost"));
export const Press = lazy(() => import("@/pages/Press"));
export const Demo = lazy(() => import("@/pages/Demo"));
export const About = lazy(() => import("@/pages/About"));
export const Contact = lazy(() => import("@/pages/Contact"));
export const Auth = lazy(() => import("@/pages/Auth"));
export const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
export const SharedCatalog = lazy(() => import("@/pages/SharedCatalog"));
export const CustomOrder = lazy(() => import("@/pages/CustomOrder"));
export const NotFound = lazy(() => import("@/pages/NotFound"));
export const ImageOptimizationDemo = lazy(() => import("@/pages/ImageOptimizationDemo"));
export const DiamondCalculator = lazy(() => import("@/pages/DiamondCalculator"));
export const ManufacturingCost = lazy(() => import("@/pages/ManufacturingCost"));
export const Calculators = lazy(() => import("@/pages/Calculators"));
export const OrderTracking = lazy(() => import("@/pages/OrderTracking"));
export const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
export const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
export const CookiePolicyPage = lazy(() => import("@/pages/CookiePolicyPage"));

// Auth-only pages
export const PendingApproval = lazy(() => import("@/pages/PendingApproval"));

// Protected vendor pages - Loaded when authenticated and approved
export const Catalog = lazy(() => import("@/pages/Catalog"));
export const AddProduct = lazy(() => import("@/pages/AddProduct"));
export const Import = lazy(() => import("@/pages/Import"));
export const Share = lazy(() => import("@/pages/Share"));
export const Interests = lazy(() => import("@/pages/Interests"));
export const TeamManagement = lazy(() => import("@/pages/TeamManagement"));
export const VendorProfile = lazy(() => import("@/pages/VendorProfile"));
export const VideoRequests = lazy(() => import("@/pages/VideoRequests"));
export const VendorAnalytics = lazy(() => import("@/pages/VendorAnalytics"));
export const PurchaseInquiries = lazy(() => import("@/pages/PurchaseInquiries"));
export const Rewards = lazy(() => import("@/pages/Rewards"));

// Admin pages - Loaded only for admin users
export const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
export const AdminSettings = lazy(() => import("@/pages/AdminSettings"));
export const AdminBlog = lazy(() => import("@/pages/AdminBlog"));
export const AdminBrands = lazy(() => import("@/pages/AdminBrands"));
export const AdminComments = lazy(() => import("@/pages/AdminComments"));
export const AdminNewsletter = lazy(() => import("@/pages/AdminNewsletter"));
export const AdminPress = lazy(() => import("@/pages/AdminPress"));
export const SuperAdmin = lazy(() => import("@/pages/SuperAdmin"));
export const VendorApprovals = lazy(() => import("@/pages/VendorApprovals"));
export const VendorManagement = lazy(() => import("@/pages/VendorManagement"));
export const ActiveSessions = lazy(() => import("@/pages/ActiveSessions"));
export const GlobalSearch = lazy(() => import("@/pages/GlobalSearch"));
export const CustomerDatabase = lazy(() => import("@/pages/CustomerDatabase"));
export const AnalyticsDashboard = lazy(() => import("@/pages/AnalyticsDashboard"));
export const AuditLogs = lazy(() => import("@/pages/AuditLogs"));
export const ExportReports = lazy(() => import("@/pages/ExportReports"));
export const LoginHistory = lazy(() => import("@/pages/LoginHistory"));
export const PlanManagement = lazy(() => import("@/pages/PlanManagement"));
export const PermissionPresets = lazy(() => import("@/pages/PermissionPresets"));
export const MigrateImages = lazy(() => import("@/pages/MigrateImages"));
export const ScratchLeads = lazy(() => import("@/pages/ScratchLeads"));
export const AdminRewards = lazy(() => import("@/pages/AdminRewards"));
export const AdminDiamondPrices = lazy(() => import("@/pages/AdminDiamondPrices"));
export const AdminManufacturingOrders = lazy(() => import("@/pages/AdminManufacturingOrders"));
export const AdminLegalPages = lazy(() => import("@/pages/AdminLegalPages"));
export const GuestCalculatorAnalytics = lazy(() => import("@/pages/GuestCalculatorAnalytics"));
export const Wishlist = lazy(() => import("@/pages/Wishlist"));
