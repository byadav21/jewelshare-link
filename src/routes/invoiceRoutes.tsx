import { lazy } from "react";

export const InvoiceHistory = lazy(() => import("@/pages/InvoiceHistory"));
export const EstimateHistory = lazy(() => import("@/pages/EstimateHistory"));
export const InvoiceTemplates = lazy(() => import("@/pages/InvoiceTemplates"));
export const InvoiceTemplateBuilder = lazy(() => import("@/pages/InvoiceTemplateBuilder"));
export const InvoiceGenerator = lazy(() => import("@/pages/InvoiceGenerator"));
