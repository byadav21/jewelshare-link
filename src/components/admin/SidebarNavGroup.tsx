/**
 * Sidebar navigation group component
 * Renders a labeled group of navigation items
 */

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { SidebarNavItem } from "./SidebarNavItem";
import { NavigationGroup, NotificationCounts } from "@/types";
import { NOTIFICATION_BADGE_MAP } from "@/config/admin-navigation";

interface SidebarNavGroupProps {
  group: NavigationGroup;
  notificationCounts?: NotificationCounts;
}

export const SidebarNavGroup = ({ group, notificationCounts }: SidebarNavGroupProps) => {
  const getBadgeCount = (itemTitle: string): number | undefined => {
    if (!notificationCounts) return undefined;
    
    const badgeKey = NOTIFICATION_BADGE_MAP[itemTitle as keyof typeof NOTIFICATION_BADGE_MAP];
    return badgeKey ? notificationCounts[badgeKey] : undefined;
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {group.items.map((item) => (
            <SidebarNavItem
              key={item.title}
              item={item}
              badgeCount={getBadgeCount(item.title)}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
