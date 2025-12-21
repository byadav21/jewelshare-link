/**
 * Centralized route definitions
 * Single source of truth for all application routes
 */

export const ROUTES = {
  // Public routes
  HOME: "/",
  PRICING: "/pricing",
  BLOG: "/blog",
  BLOG_POST: "/blog/:id",
  PRESS: "/press",
  DEMO: "/demo",
  IMAGE_DEMO: "/image-optimization-demo",
  DIAMOND_CALCULATOR: "/diamond-calculator",
  DIAMOND_SIZING_CHART: "/diamond-sizing-chart",
  DIAMOND_SIEVE_CHART: "/diamond-sieve-chart",
  DIAMOND_EDUCATION: "/diamond-education",
  MANUFACTURING_COST: "/manufacturing-cost",
  INVOICE_HISTORY: "/invoice-history",
  ESTIMATE_HISTORY: "/estimate-history",
  INVOICE_GENERATOR: "/invoice-generator",
  INVOICE_TEMPLATES: "/invoice-templates",
  INVOICE_TEMPLATE_BUILDER: "/invoice-template-builder",
  INVOICE_TEMPLATE_BUILDER_EDIT: "/invoice-template-builder/:id",
  CALCULATORS: "/calculators",
  ABOUT: "/about",
  CONTACT: "/contact",
  PRIVACY_POLICY: "/privacy-policy",
  TERMS_OF_SERVICE: "/terms-of-service",
  COOKIE_POLICY: "/cookie-policy",
  FAQ: "/faq",
  AUTH: "/auth",
  RESET_PASSWORD: "/reset-password",

  SHARED_CATALOG: "/shared/:token",
  WISHLIST: "/wishlist/:token?",
  CUSTOM_ORDER: "/custom-order",
  ORDER_TRACKING: "/order-tracking/:token",

  // Auth-only routes
  PENDING_APPROVAL: "/pending-approval",

  // Protected vendor routes
  CATALOG: "/catalog",
  ADD_PRODUCT: "/add-product",
  IMPORT: "/import",
  SHARE: "/share",
  INTERESTS: "/interests",
  TEAM: "/team",
  VENDOR_PROFILE: "/vendor-profile",
  ACTIVE_SESSIONS: "/active-sessions",
  GLOBAL_SEARCH: "/global-search",
  VIDEO_REQUESTS: "/video-requests",
  VENDOR_ANALYTICS: "/vendor-analytics",
  PURCHASE_INQUIRIES: "/purchase-inquiries",
  REWARDS: "/rewards",

  // Admin routes
  ADMIN: "/admin",
  ADMIN_SETTINGS: "/admin/settings",
  ADMIN_BLOG: "/admin/blog",
  ADMIN_BRANDS: "/admin/brands",
  ADMIN_COMMENTS: "/admin/comments",
  ADMIN_NEWSLETTER: "/admin/newsletter",
  ADMIN_PRESS: "/admin/press",
  ADMIN_REWARDS: "/admin/rewards",
  ADMIN_DIAMOND_PRICES: "/admin/diamond-prices",
  ADMIN_MANUFACTURING_ORDERS: "/admin/manufacturing-orders",
  ADMIN_LEGAL_PAGES: "/admin/legal-pages",
  SCRATCH_LEADS: "/admin/scratch-leads",
  
  SUPER_ADMIN: "/super-admin",
  VENDOR_APPROVALS: "/vendor-approvals",
  VENDOR_MANAGEMENT: "/vendor-management",
  CUSTOMER_DATABASE: "/customer-database",
  ANALYTICS_DASHBOARD: "/analytics-dashboard",
  GUEST_CALCULATOR_ANALYTICS: "/admin/calculator-analytics",
  AUDIT_LOGS: "/audit-logs",
  EXPORT_REPORTS: "/export-reports",
  LOGIN_HISTORY: "/login-history",
  PLAN_MANAGEMENT: "/plan-management",
  PERMISSION_PRESETS: "/permission-presets",
  MIGRATE_IMAGES: "/migrate-images",

  // Fallback
  NOT_FOUND: "*",
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = typeof ROUTES[RouteKey];
