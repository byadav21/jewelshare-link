import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
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
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'ui-vendor': ['lucide-react', 'sonner'],
          
          // Feature-based chunks for better caching
          'admin-pages': [
            './src/pages/AdminDashboard.tsx',
            './src/pages/VendorApprovals.tsx',
            './src/pages/VendorManagement.tsx',
            './src/pages/CustomerDatabase.tsx',
            './src/pages/AnalyticsDashboard.tsx',
            './src/pages/AuditLogs.tsx',
            './src/pages/ExportReports.tsx',
            './src/pages/LoginHistory.tsx',
            './src/pages/PlanManagement.tsx',
            './src/pages/PermissionPresets.tsx',
          ],
          'vendor-pages': [
            './src/pages/Catalog.tsx',
            './src/pages/AddProduct.tsx',
            './src/pages/Import.tsx',
            './src/pages/Share.tsx',
            './src/pages/Interests.tsx',
            './src/pages/TeamManagement.tsx',
            './src/pages/VendorProfile.tsx',
            './src/pages/VendorAnalytics.tsx',
          ],
          'public-pages': [
            './src/pages/Index.tsx',
            './src/pages/Pricing.tsx',
            './src/pages/Blog.tsx',
            './src/pages/Press.tsx',
            './src/pages/About.tsx',
            './src/pages/Contact.tsx',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}));
