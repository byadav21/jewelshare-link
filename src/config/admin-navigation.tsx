/**
 * Admin navigation configuration
 * Centralized definition of all admin sidebar navigation items
 */

import {
  Settings,
  FileText,
  Image,
  MessageSquare,
  Mail,
  Users,
  Shield,
  Crown,
  Bookmark,
  Monitor,
  Search,
  TrendingUp,
  Database,
  FileDown,
  History,
  Newspaper,
  LayoutDashboard,
} from "lucide-react";
import { NavigationItem, NavigationGroup } from "@/types";
import { ROUTES } from "@/constants/routes";

export const DASHBOARD_ITEM: NavigationItem = {
  title: "Dashboard",
  url: ROUTES.ADMIN,
  icon: LayoutDashboard,
};

export const CONTENT_MANAGEMENT_ITEMS: NavigationItem[] = [
  { title: "Site Settings", url: ROUTES.ADMIN_SETTINGS, icon: Settings },
  { title: "Blog Posts", url: ROUTES.ADMIN_BLOG, icon: FileText },
  { title: "Brand Logos", url: ROUTES.ADMIN_BRANDS, icon: Image },
  { title: "Comments", url: ROUTES.ADMIN_COMMENTS, icon: MessageSquare },
  { title: "Newsletter", url: ROUTES.ADMIN_NEWSLETTER, icon: Mail },
  { title: "Press Releases", url: ROUTES.ADMIN_PRESS, icon: Newspaper },
];

export const VENDOR_MANAGEMENT_ITEMS: NavigationItem[] = [
  { title: "Vendor Approvals", url: ROUTES.VENDOR_APPROVALS, icon: Users },
  { title: "Vendor Management", url: ROUTES.VENDOR_MANAGEMENT, icon: Shield },
  { title: "Plan Management", url: ROUTES.PLAN_MANAGEMENT, icon: Crown },
  { title: "Permission Presets", url: ROUTES.PERMISSION_PRESETS, icon: Bookmark },
];

export const SYSTEM_ITEMS: NavigationItem[] = [
  { title: "Active Sessions", url: ROUTES.ACTIVE_SESSIONS, icon: Monitor },
  { title: "Global Search", url: ROUTES.GLOBAL_SEARCH, icon: Search },
  { title: "Customer Database", url: ROUTES.CUSTOMER_DATABASE, icon: Database },
  { title: "Analytics", url: ROUTES.ANALYTICS_DASHBOARD, icon: TrendingUp },
  { title: "Audit Logs", url: ROUTES.AUDIT_LOGS, icon: Shield },
  { title: "Export Reports", url: ROUTES.EXPORT_REPORTS, icon: FileDown },
  { title: "Login History", url: ROUTES.LOGIN_HISTORY, icon: History },
];

export const ADMIN_NAVIGATION_GROUPS: NavigationGroup[] = [
  {
    label: "Content Management",
    items: CONTENT_MANAGEMENT_ITEMS,
  },
  {
    label: "Vendor Management",
    items: VENDOR_MANAGEMENT_ITEMS,
  },
  {
    label: "System & Analytics",
    items: SYSTEM_ITEMS,
  },
];

// Items that should display notification badges
export const NOTIFICATION_BADGE_MAP = {
  Comments: "comments",
  "Vendor Approvals": "approvals",
} as const;
