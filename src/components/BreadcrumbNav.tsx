import { useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home, ChevronRight, Gem } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BreadcrumbItemType {
  label: string;
  href?: string;
}

interface BreadcrumbNavProps {
  items?: BreadcrumbItemType[];
  className?: string;
  showStructuredData?: boolean;
}

// Route to label mapping for automatic breadcrumb generation
const routeLabels: Record<string, string> = {
  "": "Home",
  "about": "About Us",
  "pricing": "Pricing",
  "contact": "Contact",
  "blog": "Blog",
  "faq": "FAQ",
  "demo": "Demo",
  "press": "Press",
  "calculators": "Calculators",
  "diamond-calculator": "Diamond Calculator",
  "diamond-education": "Diamond Education",
  "diamond-sizing-chart": "Diamond Sizing Chart",
  "diamond-sieve-chart": "Sieve Chart",
  "manufacturing-cost": "Cost Estimator",
  "catalog": "Catalog",
  "wishlist": "Wishlist",
  "auth": "Sign In",
  "reset-password": "Reset Password",
  "privacy-policy": "Privacy Policy",
  "terms-of-service": "Terms of Service",
  "cookie-policy": "Cookie Policy",
  "rewards": "Rewards",
  "admin": "Dashboard",
  "vendor-profile": "Vendor Profile",
  "add-product": "Add Product",
  "import": "Import",
  "interests": "Interests",
  "share": "Share Catalog",
  "invoice-generator": "Invoice Generator",
  "invoice-history": "Invoice History",
  "invoice-templates": "Templates",
  "invoice-template-builder": "Template Builder",
  "estimate-history": "Estimates",
  "custom-order": "Custom Order",
  "order-tracking": "Order Tracking",
  "analytics": "Analytics",
  "export-reports": "Export Reports",
  "team": "Team",
  "active-sessions": "Sessions",
  "login-history": "Login History",
  "settings": "Settings",
  "purchase-inquiries": "Purchase Inquiries",
  "video-requests": "Video Requests",
};

// Base URL for schema
const BASE_URL = "https://cataleon.io";

export const BreadcrumbNav = ({ 
  items, 
  className,
  showStructuredData = true 
}: BreadcrumbNavProps) => {
  const location = useLocation();
  
  // Generate breadcrumbs from current path if items not provided
  const breadcrumbItems = useMemo((): BreadcrumbItemType[] => {
    if (items) return items;
    
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItemType[] = [];
    
    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = routeLabels[segment] || segment.split("-").map(
        word => word.charAt(0).toUpperCase() + word.slice(1)
      ).join(" ");
      
      breadcrumbs.push({
        label,
        href: index < pathSegments.length - 1 ? currentPath : undefined,
      });
    });
    
    return breadcrumbs;
  }, [items, location.pathname]);

  // Generate structured data schema
  const schemaData = useMemo(() => {
    const schemaItems = [
      { name: "Home", url: BASE_URL }
    ];
    
    let currentPath = "";
    breadcrumbItems.forEach((item) => {
      currentPath = item.href || location.pathname;
      schemaItems.push({
        name: item.label,
        url: `${BASE_URL}${currentPath}`
      });
    });

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": schemaItems.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url
      }))
    };
  }, [breadcrumbItems, location.pathname]);

  // Inject structured data into document head
  useEffect(() => {
    if (!showStructuredData || location.pathname === "/" || breadcrumbItems.length === 0) {
      return;
    }

    const scriptId = "breadcrumb-structured-data";
    
    // Remove existing script
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    // Create new script element
    const script = document.createElement("script");
    script.id = scriptId;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schemaData);
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      const script = document.getElementById(scriptId);
      if (script) {
        script.remove();
      }
    };
  }, [schemaData, showStructuredData, location.pathname, breadcrumbItems.length]);

  // Don't render on home page
  if (location.pathname === "/" || breadcrumbItems.length === 0) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  return (
    <motion.nav 
      aria-label="Breadcrumb" 
      className={cn(
        "py-3 px-4 rounded-xl",
        "bg-gradient-to-r from-primary/5 via-transparent to-accent/5",
        "border border-border/50 backdrop-blur-sm",
        "shadow-sm",
        className
      )}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Breadcrumb>
        <BreadcrumbList className="flex-wrap">
          {/* Home Link */}
          <motion.div variants={itemVariants} className="contents">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link 
                  to="/" 
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded-md",
                    "text-muted-foreground hover:text-primary",
                    "hover:bg-primary/10 transition-all duration-200",
                    "group"
                  )}
                >
                  <Home className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  <span className="sr-only sm:not-sr-only text-sm font-medium">Home</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </motion.div>
          
          {breadcrumbItems.map((item, index) => (
            <motion.div key={index} variants={itemVariants} className="contents">
              {/* Separator */}
              <BreadcrumbSeparator className="text-primary/40">
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              
              {/* Breadcrumb Item */}
              <BreadcrumbItem>
                {item.href ? (
                  <BreadcrumbLink asChild>
                    <Link 
                      to={item.href} 
                      className={cn(
                        "px-2 py-1 rounded-md text-sm font-medium",
                        "text-muted-foreground hover:text-primary",
                        "hover:bg-primary/10 transition-all duration-200",
                        "relative group"
                      )}
                    >
                      {item.label}
                      <span className="absolute inset-x-2 -bottom-0.5 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left rounded-full" />
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md",
                    "bg-gradient-to-r from-primary/15 to-accent/15",
                    "text-foreground font-semibold text-sm",
                    "border border-primary/20",
                    "shadow-sm"
                  )}>
                    <Gem className="h-3.5 w-3.5 text-primary" />
                    {item.label}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </motion.div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </motion.nav>
  );
};

export default BreadcrumbNav;
