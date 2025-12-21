import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbNavProps {
  items?: BreadcrumbItem[];
  className?: string;
}

// Route to label mapping for automatic breadcrumb generation
const routeLabels: Record<string, string> = {
  "": "Home",
  "about": "About",
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
  "diamond-sieve-chart": "Diamond Sieve Chart",
  "manufacturing-cost": "Manufacturing Estimator",
  "catalog": "Catalog",
  "wishlist": "Wishlist",
  "auth": "Sign In",
  "reset-password": "Reset Password",
  "privacy-policy": "Privacy Policy",
  "terms-of-service": "Terms of Service",
  "cookie-policy": "Cookie Policy",
  "rewards": "Rewards",
  "admin": "Admin Dashboard",
  "vendor-profile": "Vendor Profile",
  "add-product": "Add Product",
  "import": "Import",
  "interests": "Interests",
  "share": "Share Catalog",
  "invoice-generator": "Invoice Generator",
  "invoice-history": "Invoice History",
  "invoice-templates": "Invoice Templates",
  "invoice-template-builder": "Template Builder",
  "estimate-history": "Estimate History",
  "custom-order": "Custom Order",
  "order-tracking": "Order Tracking",
  "analytics": "Analytics",
  "export-reports": "Export Reports",
  "team": "Team Management",
  "active-sessions": "Active Sessions",
  "login-history": "Login History",
  "settings": "Settings",
  "purchase-inquiries": "Purchase Inquiries",
  "video-requests": "Video Requests",
};

export const BreadcrumbNav = ({ items, className }: BreadcrumbNavProps) => {
  const location = useLocation();
  
  // Generate breadcrumbs from current path if items not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items;
    
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];
    
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
  };

  const breadcrumbItems = generateBreadcrumbs();

  // Don't render on home page
  if (location.pathname === "/" || breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                <Home className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only">Home</span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          {breadcrumbItems.map((item, index) => (
            <span key={index} className="contents">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {item.href ? (
                  <BreadcrumbLink asChild>
                    <Link to={item.href} className="text-muted-foreground hover:text-foreground transition-colors">
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </span>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </nav>
  );
};

export default BreadcrumbNav;
