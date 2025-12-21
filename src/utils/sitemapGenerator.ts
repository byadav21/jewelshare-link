/**
 * Sitemap Generator Utility
 * Automatically generates sitemap.xml content based on route definitions
 */

import { ROUTES } from "@/constants/routes";

interface SitemapEntry {
  path: string;
  priority: number;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  lastmod?: string;
}

// Routes that should be included in the sitemap (public, indexable routes)
const PUBLIC_ROUTES: Record<string, { priority: number; changefreq: SitemapEntry["changefreq"] }> = {
  HOME: { priority: 1.0, changefreq: "daily" },
  PRICING: { priority: 0.9, changefreq: "weekly" },
  ABOUT: { priority: 0.8, changefreq: "monthly" },
  CONTACT: { priority: 0.8, changefreq: "monthly" },
  FAQ: { priority: 0.8, changefreq: "weekly" },
  BLOG: { priority: 0.9, changefreq: "daily" },
  PRESS: { priority: 0.7, changefreq: "weekly" },
  DIAMOND_CALCULATOR: { priority: 0.9, changefreq: "weekly" },
  DIAMOND_SIZING_CHART: { priority: 0.8, changefreq: "monthly" },
  DIAMOND_SIEVE_CHART: { priority: 0.8, changefreq: "monthly" },
  DIAMOND_EDUCATION: { priority: 0.8, changefreq: "monthly" },
  MANUFACTURING_COST: { priority: 0.8, changefreq: "weekly" },
  CALCULATORS: { priority: 0.9, changefreq: "weekly" },
  INVOICE_GENERATOR: { priority: 0.7, changefreq: "weekly" },
  INVOICE_TEMPLATES: { priority: 0.6, changefreq: "monthly" },
  PRIVACY_POLICY: { priority: 0.3, changefreq: "yearly" },
  TERMS_OF_SERVICE: { priority: 0.3, changefreq: "yearly" },
  COOKIE_POLICY: { priority: 0.3, changefreq: "yearly" },
  AUTH: { priority: 0.5, changefreq: "monthly" },
  DEMO: { priority: 0.7, changefreq: "monthly" },
};

// Routes to exclude from sitemap (dynamic, protected, or admin routes)
const EXCLUDED_PATTERNS = [
  /^\/admin/,
  /^\/catalog$/,
  /^\/shared\//,
  /^\/wishlist/,
  /^\/order-tracking/,
  /^\/vendor-/,
  /^\/team$/,
  /^\/import$/,
  /^\/share$/,
  /^\/interests$/,
  /^\/rewards$/,
  /^\/pending-approval$/,
  /^\/active-sessions$/,
  /^\/global-search$/,
  /^\/video-requests$/,
  /^\/purchase-inquiries$/,
  /^\/invoice-history$/,
  /^\/estimate-history$/,
  /^\/add-product$/,
  /^\/custom-order$/,
  /^\/reset-password$/,
  /^\/migrate-images$/,
  /^\/image-optimization-demo$/,
  /:\w+/, // Any route with dynamic parameters
  /\*$/, // Catch-all routes
];

const BASE_URL = "https://cataleon.io";

/**
 * Check if a route should be included in the sitemap
 */
function shouldIncludeRoute(path: string): boolean {
  if (path === "*") return false;
  return !EXCLUDED_PATTERNS.some(pattern => pattern.test(path));
}

/**
 * Get route configuration for a given route key
 */
function getRouteConfig(routeKey: string): { priority: number; changefreq: SitemapEntry["changefreq"] } | null {
  return PUBLIC_ROUTES[routeKey] || null;
}

/**
 * Generate sitemap entries from routes
 */
export function generateSitemapEntries(): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  const today = new Date().toISOString().split("T")[0];

  for (const [key, path] of Object.entries(ROUTES)) {
    if (!shouldIncludeRoute(path)) continue;

    const config = getRouteConfig(key);
    if (!config) continue;

    entries.push({
      path: path === "/" ? "" : path,
      priority: config.priority,
      changefreq: config.changefreq,
      lastmod: today,
    });
  }

  // Sort by priority (highest first)
  return entries.sort((a, b) => b.priority - a.priority);
}

/**
 * Generate XML sitemap content
 */
export function generateSitemapXML(): string {
  const entries = generateSitemapEntries();

  const urlEntries = entries
    .map(
      (entry) => `  <url>
    <loc>${BASE_URL}${entry.path}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlEntries}
</urlset>`;
}

/**
 * Log sitemap entries for debugging
 */
export function logSitemapEntries(): void {
  const entries = generateSitemapEntries();
  console.log("📍 Sitemap Entries:");
  entries.forEach((entry) => {
    console.log(`  ${BASE_URL}${entry.path} (priority: ${entry.priority}, changefreq: ${entry.changefreq})`);
  });
  console.log(`\n📊 Total URLs: ${entries.length}`);
}

// Export for use in build scripts or API endpoints
export default {
  generateSitemapEntries,
  generateSitemapXML,
  logSitemapEntries,
};
