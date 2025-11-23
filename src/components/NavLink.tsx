import { forwardRef } from "react";
import { Link, LinkProps, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
  activeClassName?: string;
  end?: boolean;
}

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ to, className, activeClassName = "bg-primary/10 text-primary font-semibold", children, end, ...props }, ref) => {
    const location = useLocation();
    const isActive = end 
      ? location.pathname === to
      : location.pathname === to || 
        (location.pathname.startsWith(to) && to !== '/');

    return (
      <Link
        ref={ref}
        to={to}
        className={cn(className, isActive && activeClassName)}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

NavLink.displayName = "NavLink";
