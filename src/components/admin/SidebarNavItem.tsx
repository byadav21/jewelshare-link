/**
 * Reusable sidebar navigation item component
 * Handles rendering of individual navigation items with optional badges
 */

import { NavLink } from "@/components/NavLink";
import { Badge } from "@/components/ui/badge";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { NavigationItem } from "@/types";

interface SidebarNavItemProps {
  item: NavigationItem;
  badgeCount?: number;
}

export const SidebarNavItem = ({ item, badgeCount }: SidebarNavItemProps) => {
  const showBadge = badgeCount !== undefined && badgeCount > 0;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <NavLink
          to={item.url}
          className="hover:bg-muted/50 flex items-center justify-between"
          activeClassName="bg-primary/10 text-primary font-semibold"
        >
          <div className="flex items-center gap-2">
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </div>
          {showBadge && (
            <Badge variant="destructive" className="ml-auto">
              {badgeCount > 9 ? "9+" : badgeCount}
            </Badge>
          )}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};
