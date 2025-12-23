/**
 * Route prefetching utility
 * Preloads route chunks on link hover for instant navigation
 */

import { lazy } from "react";

// Map of routes to their lazy-loaded components
const routePrefetchMap: Record<string, () => Promise<any>> = {
  "/": () => import("@/pages/Index"),
  "/pricing": () => import("@/pages/Pricing"),
  "/blog": () => import("@/pages/Blog"),
  "/press": () => import("@/pages/Press"),
  "/demo": () => import("@/pages/Demo"),
  "/about": () => import("@/pages/About"),
  "/contact": () => import("@/pages/Contact"),
  "/catalog": () => import("@/pages/Catalog"),
  "/add-product": () => import("@/pages/AddProduct"),
  "/import": () => import("@/pages/Import"),
  "/share": () => import("@/pages/Share"),
  "/interests": () => import("@/pages/Interests"),
  "/team": () => import("@/pages/TeamManagement"),
  "/vendor-profile": () => import("@/pages/VendorProfile"),
  "/vendor-analytics": () => import("@/pages/VendorAnalytics"),
  "/admin": () => import("@/pages/AdminDashboard"),
  "/vendor-approvals": () => import("@/pages/VendorApprovals"),
  "/vendor-management": () => import("@/pages/VendorManagement"),
  "/customer-database": () => import("@/pages/CustomerDatabase"),
  "/analytics-dashboard": () => import("@/pages/AnalyticsDashboard"),
  "/audit-logs": () => import("@/pages/AuditLogs"),
  "/export-reports": () => import("@/pages/ExportReports"),
  "/login-history": () => import("@/pages/LoginHistory"),
  "/plan-management": () => import("@/pages/PlanManagement"),
  "/permission-presets": () => import("@/pages/PermissionPresets"),
  "/active-sessions": () => import("@/pages/ActiveSessions"),
  "/global-search": () => import("@/pages/GlobalSearch"),
  "/video-requests": () => import("@/pages/VideoRequests"),
};

// Cache for prefetched routes to avoid duplicate requests
const prefetchedRoutes = new Set<string>();

/**
 * Prefetch a route's component
 * @param path - Route path to prefetch
 */
export const prefetchRoute = (path: string): void => {
  // Normalize path (remove trailing slash, handle dynamic segments)
  const normalizedPath = path.replace(/\/$/, "") || "/";
  
  // Check if already prefetched
  if (prefetchedRoutes.has(normalizedPath)) {
    return;
  }

  // Get the prefetch function for this route
  const prefetchFn = routePrefetchMap[normalizedPath];
  
  if (prefetchFn) {
    // Mark as prefetched before starting to avoid duplicate requests
    prefetchedRoutes.add(normalizedPath);
    
    // Prefetch the route chunk
    prefetchFn().catch((error) => {
      console.error(`Failed to prefetch route: ${normalizedPath}`, error);
      // Remove from cache on error so it can be retried
      prefetchedRoutes.delete(normalizedPath);
    });
  }
};

/**
 * Prefetch multiple routes
 * @param paths - Array of route paths to prefetch
 */
export const prefetchRoutes = (paths: string[]): void => {
  paths.forEach(prefetchRoute);
};

/**
 * Clear the prefetch cache (useful for testing)
 */
export const clearPrefetchCache = (): void => {
  prefetchedRoutes.clear();
};

/**
 * Check if a route has been prefetched
 * @param path - Route path to check
 */
export const isPrefetched = (path: string): boolean => {
  const normalizedPath = path.replace(/\/$/, "") || "/";
  return prefetchedRoutes.has(normalizedPath);
};
