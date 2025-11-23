import { Link, LinkProps, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavLinkProps extends LinkProps {
  activeClassName?: string;
  end?: boolean;
}

export function NavLink({ 
  to, 
  className, 
  activeClassName = "bg-primary/10 text-primary font-semibold", 
  children, 
  end,
  ...props 
}: NavLinkProps) {
  const location = useLocation();
  const isActive = end 
    ? location.pathname === to
    : location.pathname === to || 
      (typeof to === 'string' && location.pathname.startsWith(to) && to !== '/');

  return (
    <Link
      to={to}
      className={cn(className, isActive && activeClassName)}
      {...props}
    >
      {children}
    </Link>
  );
}
