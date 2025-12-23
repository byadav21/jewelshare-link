/**
 * Admin Sidebar Component
 * Main navigation sidebar for the admin panel with real-time notifications
 */

import { useNavigate } from "react-router-dom";
import { LogOut, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { SidebarNavItem } from "@/components/admin/SidebarNavItem";
import { SidebarNavGroup } from "@/components/admin/SidebarNavGroup";
import { useNotificationCounts } from "@/hooks/useNotificationCounts";
import {
  DASHBOARD_ITEM,
  ADMIN_NAVIGATION_GROUPS,
} from "@/config/admin-navigation";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";

export function AdminSidebar() {
  const navigate = useNavigate();
  const { counts } = useNotificationCounts();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="font-bold text-lg">Admin Panel</h2>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Dashboard Overview */}
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarNavItem item={DASHBOARD_ITEM} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Dynamic Navigation Groups */}
        {ADMIN_NAVIGATION_GROUPS.map((group) => (
          <SidebarNavGroup
            key={group.label}
            group={group}
            notificationCounts={counts}
          />
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span>Sign Out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
