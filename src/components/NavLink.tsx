/**
 * Enhanced NavLink component with route prefetching
 * Preloads route chunks on hover for instant navigation
 */

import { forwardRef, MouseEvent } from "react";
import { Link, LinkProps, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { prefetchRoute } from "@/utils/prefetch";

interface NavLinkProps extends Omit<LinkProps, "to"> {
  to: string;
  activeClassName?: string;
  end?: boolean;
  prefetch?: boolean; // Enable/disable prefetching
}

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ to, className, activeClassName = "bg-primary/10 text-primary font-semibold", children, end, prefetch = true, ...props }, ref) => {
    const location = useLocation();
    const isActive = end 
      ? location.pathname === to
      : location.pathname === to || 
        (location.pathname.startsWith(to) && to !== "/");

    const handleMouseEnter = (e: MouseEvent<HTMLAnchorElement>) => {
      // Prefetch route on hover
      if (prefetch) {
        prefetchRoute(to);
      }

      // Call original onMouseEnter if provided
      if (props.onMouseEnter) {
        props.onMouseEnter(e);
      }
    };

    const handleTouchStart = (e: any) => {
      // Prefetch on touch for mobile devices
      if (prefetch) {
        prefetchRoute(to);
      }

      // Call original onTouchStart if provided
      if (props.onTouchStart) {
        props.onTouchStart(e);
      }
    };

    return (
      <Link
        ref={ref}
        to={to}
        className={cn(className, isActive && activeClassName)}
        onMouseEnter={handleMouseEnter}
        onTouchStart={handleTouchStart}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

NavLink.displayName = "NavLink";
