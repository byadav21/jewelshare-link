/**
 * Centralized type definitions for the application
 */

// Auth & User types
export type UserRole = "admin" | "team_member" | null;
export type ApprovalStatus = "pending" | "approved" | "rejected" | null;

// Navigation types
export interface NavigationItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

// Notification types
export interface NotificationCounts {
  comments: number;
  approvals: number;
}

// Product types
export interface Product {
  id: string;
  name: string;
  description?: string;
  price_inr?: number;
  price_usd?: number;
  image_url?: string;
  category?: string;
  // Add other product fields as needed
}

// Common hook return types
export interface UseUserRoleReturn {
  role: UserRole;
  loading: boolean;
  isAdmin: boolean;
  isTeamMember: boolean;
}

export interface UseApprovalStatusReturn {
  status: ApprovalStatus;
  loading: boolean;
  rejectionReason: string | null;
  isApproved: boolean;
}
