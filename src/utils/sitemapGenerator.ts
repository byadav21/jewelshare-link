/**
 * Enhanced Sitemap Generator Utility
 * Automatically generates sitemap.xml content with images and news support
 */

import { ROUTES } from "@/constants/routes";

interface SitemapImage {
  url: string;
  title?: string;
  caption?: string;
}

interface SitemapEntry {
  path: string;
  priority: number;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  lastmod: string;
  images?: SitemapImage[];
  title?: string;
  description?: string;
}

// Route configurations with SEO metadata
const ROUTE_CONFIGS: Record<string, { 
  priority: number; 
  changefreq: SitemapEntry["changefreq"];
  title: string;
  description: string;
  images?: SitemapImage[];
}> = {
  HOME: { 
    priority: 1.0, 
    changefreq: "daily",
    title: "Cataleon - Professional Jewelry Catalog Management",
    description: "Manage inventory, share catalogs with custom pricing, and grow your jewelry business."
  },
  PRICING: { 
    priority: 0.9, 
    changefreq: "weekly",
    title: "Pricing Plans",
    description: "Choose the perfect plan for your jewelry business."
  },
  ABOUT: { 
    priority: 0.8, 
    changefreq: "monthly",
    title: "About Cataleon",
    description: "Learn about our mission to transform jewelry business management."
  },
  CONTACT: { 
    priority: 0.8, 
    changefreq: "monthly",
    title: "Contact Us",
    description: "Get in touch with the Cataleon team for support or inquiries."
  },
  FAQ: { 
    priority: 0.8, 
    changefreq: "weekly",
    title: "Frequently Asked Questions",
    description: "Find answers to common questions about Cataleon."
  },
  BLOG: { 
    priority: 0.9, 
    changefreq: "daily",
    title: "Jewelry Industry Blog",
    description: "Stay informed with the latest jewelry industry trends and tips."
  },
  PRESS: { 
    priority: 0.7, 
    changefreq: "weekly",
    title: "Press & Media",
    description: "Latest news and press releases about Cataleon."
  },
  DIAMOND_CALCULATOR: { 
    priority: 0.95, 
    changefreq: "weekly",
    title: "Diamond Price Calculator",
    description: "Calculate diamond prices based on the 4Cs with Rapaport pricing.",
    images: [{ 
      url: "https://cataleon.io/og-image.png", 
      title: "Diamond Price Calculator Tool" 
    }]
  },
  DIAMOND_SIZING_CHART: { 
    priority: 0.85, 
    changefreq: "monthly",
    title: "Diamond Sizing Chart",
    description: "Interactive diamond size guide with 3D visualization."
  },
  DIAMOND_SIEVE_CHART: { 
    priority: 0.85, 
    changefreq: "monthly",
    title: "Diamond Sieve Size Chart",
    description: "Complete sieve size reference for melee diamonds."
  },
  DIAMOND_EDUCATION: { 
    priority: 0.85, 
    changefreq: "monthly",
    title: "Diamond Education Center",
    description: "Learn about diamond grading with interactive 3D tools."
  },
  MANUFACTURING_COST: { 
    priority: 0.9, 
    changefreq: "weekly",
    title: "Manufacturing Cost Estimator",
    description: "Calculate jewelry manufacturing costs and generate quotes."
  },
  CALCULATORS: { 
    priority: 0.9, 
    changefreq: "weekly",
    title: "Jewelry Calculators & Tools",
    description: "Professional tools for diamond pricing and cost estimation."
  },
  INVOICE_GENERATOR: { 
    priority: 0.75, 
    changefreq: "weekly",
    title: "Invoice Generator",
    description: "Create professional jewelry invoices with GST calculations."
  },
  INVOICE_TEMPLATES: { 
    priority: 0.6, 
    changefreq: "monthly",
    title: "Invoice Templates",
    description: "Customizable invoice templates for jewelry businesses."
  },
  PRIVACY_POLICY: { 
    priority: 0.3, 
    changefreq: "yearly",
    title: "Privacy Policy",
    description: "How we protect and handle your data."
  },
  TERMS_OF_SERVICE: { 
    priority: 0.3, 
    changefreq: "yearly",
    title: "Terms of Service",
    description: "Terms and conditions for using Cataleon."
  },
  COOKIE_POLICY: { 
    priority: 0.3, 
    changefreq: "yearly",
    title: "Cookie Policy",
    description: "How we use cookies on our platform."
  },
  AUTH: { 
    priority: 0.5, 
    changefreq: "monthly",
    title: "Sign In / Sign Up",
    description: "Access your Cataleon account."
  },
  DEMO: { 
    priority: 0.75, 
    changefreq: "monthly",
    title: "Product Demo",
    description: "See Cataleon in action with our interactive demo."
  },
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
  /^\/login-history$/,
  /^\/export-reports$/,
  /^\/analytics$/,
  /^\/settings$/,
  /^\/super-admin$/,
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
function getRouteConfig(routeKey: string): typeof ROUTE_CONFIGS[string] | null {
  return ROUTE_CONFIGS[routeKey] || null;
}

/**
 * Get last modified date (today's date for dynamic content)
 */
function getLastModified(changefreq: SitemapEntry["changefreq"]): string {
  const now = new Date();
  
  switch (changefreq) {
    case "always":
    case "hourly":
    case "daily":
      return now.toISOString().split("T")[0];
    case "weekly":
      // Last Monday
      const lastMonday = new Date(now);
      lastMonday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
      return lastMonday.toISOString().split("T")[0];
    case "monthly":
      // First of current month
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    case "yearly":
      return `${now.getFullYear()}-01-01`;
    default:
      return now.toISOString().split("T")[0];
  }
}

/**
 * Generate sitemap entries from routes
 */
export function generateSitemapEntries(): SitemapEntry[] {
  const entries: SitemapEntry[] = [];

  for (const [key, path] of Object.entries(ROUTES)) {
    if (!shouldIncludeRoute(path)) continue;

    const config = getRouteConfig(key);
    if (!config) continue;

    entries.push({
      path: path === "/" ? "" : path,
      priority: config.priority,
      changefreq: config.changefreq,
      lastmod: getLastModified(config.changefreq),
      title: config.title,
      description: config.description,
      images: config.images,
    });
  }

  // Sort by priority (highest first)
  return entries.sort((a, b) => b.priority - a.priority);
}

/**
 * Generate image sitemap entries
 */
function generateImageXML(images: SitemapImage[]): string {
  return images.map(img => `
    <image:image>
      <image:loc>${img.url}</image:loc>
      ${img.title ? `<image:title>${escapeXml(img.title)}</image:title>` : ''}
      ${img.caption ? `<image:caption>${escapeXml(img.caption)}</image:caption>` : ''}
    </image:image>`).join('');
}

/**
 * Escape special XML characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate XML sitemap content with image support
 */
export function generateSitemapXML(): string {
  const entries = generateSitemapEntries();

  const urlEntries = entries
    .map((entry) => {
      const imageXml = entry.images ? generateImageXML(entry.images) : '';
      
      return `  <url>
    <loc>${BASE_URL}${entry.path}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority.toFixed(2)}</priority>${imageXml}
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlEntries}
</urlset>`;
}

/**
 * Generate robots.txt content
 */
export function generateRobotsTxt(): string {
  return `# Cataleon Robots.txt
# https://cataleon.io

User-agent: *
Allow: /

# Sitemaps
Sitemap: ${BASE_URL}/sitemap.xml

# Disallow admin and private routes
Disallow: /admin/
Disallow: /vendor-*
Disallow: /shared/
Disallow: /api/
Disallow: /pending-approval
Disallow: /active-sessions
Disallow: /login-history
Disallow: /estimate-history
Disallow: /invoice-history
Disallow: /video-requests
Disallow: /purchase-inquiries
Disallow: /export-reports
Disallow: /settings
Disallow: /super-admin
Disallow: /migrate-images
Disallow: /image-optimization-demo

# Crawl delay (be respectful to our servers)
Crawl-delay: 1

# AI Crawlers
User-agent: GPTBot
Allow: /
Allow: /blog/
Allow: /faq
Allow: /diamond-calculator
Allow: /diamond-education
Allow: /calculators
Allow: /about
Allow: /pricing

User-agent: ChatGPT-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Claude-Web
Allow: /
`;
}

/**
 * Log sitemap entries for debugging
 */
export function logSitemapEntries(): void {
  const entries = generateSitemapEntries();
  console.log("📍 Sitemap Entries:");
  entries.forEach((entry) => {
    console.log(`  ${BASE_URL}${entry.path}`);
    console.log(`     Priority: ${entry.priority} | Freq: ${entry.changefreq} | Modified: ${entry.lastmod}`);
    if (entry.images) {
      console.log(`     Images: ${entry.images.length}`);
    }
  });
  console.log(`\n📊 Total URLs: ${entries.length}`);
}

/**
 * Get sitemap statistics
 */
export function getSitemapStats(): {
  totalUrls: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  withImages: number;
} {
  const entries = generateSitemapEntries();
  
  return {
    totalUrls: entries.length,
    highPriority: entries.filter(e => e.priority >= 0.8).length,
    mediumPriority: entries.filter(e => e.priority >= 0.5 && e.priority < 0.8).length,
    lowPriority: entries.filter(e => e.priority < 0.5).length,
    withImages: entries.filter(e => e.images && e.images.length > 0).length,
  };
}

// Export for use in build scripts or API endpoints
export default {
  generateSitemapEntries,
  generateSitemapXML,
  generateRobotsTxt,
  logSitemapEntries,
  getSitemapStats,
};
