import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // PWA configuration
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt"],
      manifest: {
        name: "Jewelry Management Platform",
        short_name: "Jewelry App",
        description: "Comprehensive jewelry inventory and vendor management",
        theme_color: "#F5D547",
        background_color: "#1A1F2E",
        display: "standalone",
        orientation: "portrait",
        icons: [
          {
            src: "/favicon.ico",
            sizes: "64x64 32x32 24x24 16x16",
            type: "image/x-icon",
          },
          {
            src: "/placeholder.svg",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
          {
            src: "/placeholder.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: "module",
      },
    }),
    // Bundle analyzer - generates stats.html
    mode === "production" &&
      visualizer({
        filename: "./dist/stats.html",
        open: false,
        gzipSize: true,
        brotliSize: true,
        template: "treemap", // or 'sunburst', 'network'
      }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - Split large dependencies
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "query-vendor": ["@tanstack/react-query"],
          "supabase-vendor": ["@supabase/supabase-js"],
          "ui-vendor": ["lucide-react", "sonner"],

          // Feature-based chunks for better caching
          "admin-pages": [
            "./src/pages/AdminDashboard.tsx",
            "./src/pages/VendorApprovals.tsx",
            "./src/pages/VendorManagement.tsx",
            "./src/pages/CustomerDatabase.tsx",
            "./src/pages/AnalyticsDashboard.tsx",
            "./src/pages/AuditLogs.tsx",
            "./src/pages/ExportReports.tsx",
            "./src/pages/LoginHistory.tsx",
            "./src/pages/PlanManagement.tsx",
            "./src/pages/PermissionPresets.tsx",
          ],
          "vendor-pages": [
            "./src/pages/Catalog.tsx",
            "./src/pages/AddProduct.tsx",
            "./src/pages/Import.tsx",
            "./src/pages/Share.tsx",
            "./src/pages/Interests.tsx",
            "./src/pages/TeamManagement.tsx",
            "./src/pages/VendorProfile.tsx",
            "./src/pages/VendorAnalytics.tsx",
          ],
          "public-pages": [
            "./src/pages/Index.tsx",
            "./src/pages/Pricing.tsx",
            "./src/pages/Blog.tsx",
            "./src/pages/Press.tsx",
            "./src/pages/About.tsx",
            "./src/pages/Contact.tsx",
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: mode === "production",
  },
}));
