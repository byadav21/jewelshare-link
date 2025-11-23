/**
 * Suspense wrapper for lazy-loaded routes
 * Provides consistent loading UI across all routes
 */

import { Suspense, ReactNode } from "react";
import { LoadingSkeleton } from "./LoadingSkeleton";

interface RouteSuspenseProps {
  children: ReactNode;
}

export const RouteSuspense = ({ children }: RouteSuspenseProps) => {
  return <Suspense fallback={<LoadingSkeleton />}>{children}</Suspense>;
};
