/**
 * @fileoverview Catalog page header component with vendor details and action buttons
 * @module components/catalog/CatalogHeader
 */

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Plus, LogOut, Share2, FileSpreadsheet, Trash2, Heart, 
  Users, LayoutDashboard, Menu, Building2, Shield, FileDown, 
  Edit, Video, ShoppingCart 
} from "lucide-react";

/**
 * Props for CatalogHeader component
 */
interface CatalogHeaderProps {
  /** Vendor profile data */
  vendorProfile: {
    logo_url?: string | null;
    business_name?: string | null;
    brand_tagline?: string | null;
  } | null;
  /** Total product count */
  productCount: number;
  /** Current gold rate per gram */
  goldRate: number;
  /** Total catalog value in INR */
  totalINR: number;
  /** User permissions object */
  permissions: {
    can_view_interests?: boolean;
    can_edit_profile?: boolean;
    can_share_catalog?: boolean;
    can_add_products?: boolean;
    can_import_data?: boolean;
    can_manage_team?: boolean;
    can_delete_products?: boolean;
    can_view_sessions?: boolean;
  };
  /** Whether user is admin */
  isAdmin: boolean;
  /** Whether user can add products (plan limit) */
  canAddProducts: boolean;
  /** Whether user can add share links (plan limit) */
  canAddShareLinks: boolean;
  /** Remaining products allowed */
  productsRemaining: number;
  /** Remaining share links allowed */
  shareLinksRemaining: number;
  /** Selected products count */
  selectedCount: number;
  /** Callback for export PDF action */
  onExportPDF: () => void;
  /** Callback for sign out action */
  onSignOut: () => void;
  /** Callback for bulk edit action */
  onBulkEdit: () => void;
  /** Callback for delete action */
  onDelete: () => void;
  /** Callback for upgrade dialog */
  onUpgradeDialog: (type: 'products' | 'share_links') => void;
}

/**
 * Catalog header component with vendor branding and action buttons
 * 
 * @description Displays vendor logo, business name, stats, and action buttons.
 * Handles responsive layout with desktop buttons and mobile dropdown menu.
 * 
 * @param props - Component props
 * @returns React component
 * 
 * @example
 * ```tsx
 * <CatalogHeader
 *   vendorProfile={profile}
 *   productCount={100}
 *   goldRate={8500}
 *   totalINR={500000}
 *   permissions={permissions}
 *   isAdmin={false}
 *   canAddProducts={true}
 *   canAddShareLinks={true}
 *   productsRemaining={50}
 *   shareLinksRemaining={5}
 *   selectedCount={3}
 *   onExportPDF={handleExport}
 *   onSignOut={handleSignOut}
 *   onBulkEdit={() => setBulkEditOpen(true)}
 *   onDelete={() => setDeleteDialogOpen(true)}
 *   onUpgradeDialog={setUpgradeLimitType}
 * />
 * ```
 */
export const CatalogHeader = ({
  vendorProfile,
  productCount,
  goldRate,
  totalINR,
  permissions,
  isAdmin,
  canAddProducts,
  canAddShareLinks,
  productsRemaining,
  shareLinksRemaining,
  selectedCount,
  onExportPDF,
  onSignOut,
  onBulkEdit,
  onDelete,
  onUpgradeDialog,
}: CatalogHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="relative border-b border-border/50 bg-card/95 backdrop-blur-xl shadow-xl z-10">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 max-w-[1800px] relative z-10">
        {/* Vendor Details */}
        {vendorProfile && (
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6 mb-4 pb-4 border-b border-border/30">
            <div className="flex items-start gap-3 sm:gap-4 flex-1 w-full lg:w-auto">
              {vendorProfile.logo_url && (
                <div className="flex-shrink-0">
                  <img 
                    src={vendorProfile.logo_url} 
                    alt="Logo" 
                    className="w-12 h-12 sm:w-16 sm:h-16 object-contain rounded-lg border border-border/30" 
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground truncate">
                  {vendorProfile.business_name || "My Catalog"}
                </h1>
                {vendorProfile.brand_tagline && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                    {vendorProfile.brand_tagline}
                  </p>
                )}
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm">
              <div className="text-center">
                <div className="font-bold text-foreground">{productCount}</div>
                <div className="text-muted-foreground">Products</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-foreground">₹{goldRate.toLocaleString('en-IN')}</div>
                <div className="text-muted-foreground">Gold Rate/g</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-foreground">₹{totalINR.toLocaleString('en-IN')}</div>
                <div className="text-muted-foreground">Total Value</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center flex-wrap gap-2 justify-center">
            {(permissions.can_view_interests || isAdmin) && (
              <Button variant="outline" size="sm" onClick={() => navigate("/interests")}>
                <Heart className="h-4 w-4 mr-2" />Interests
              </Button>
            )}
            {(permissions.can_view_interests || isAdmin) && (
              <Button variant="outline" size="sm" onClick={() => navigate("/video-requests")}>
                <Video className="h-4 w-4 mr-2" />Video Requests
              </Button>
            )}
            {(permissions.can_edit_profile || isAdmin) && (
              <Button variant="outline" size="sm" onClick={() => navigate("/vendor-profile")}>
                <Building2 className="h-4 w-4 mr-2" />Profile
              </Button>
            )}
            {(permissions.can_share_catalog || isAdmin) && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        if (!canAddShareLinks && !isAdmin) {
                          onUpgradeDialog('share_links');
                          return;
                        }
                        navigate("/share");
                      }}
                      disabled={!canAddShareLinks && !isAdmin}
                    >
                      <Share2 className="h-4 w-4 mr-2" />Share
                      {!isAdmin && shareLinksRemaining !== Infinity && shareLinksRemaining < 100 && (
                        <span className="ml-1 text-xs text-muted-foreground">({shareLinksRemaining} left)</span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  {!canAddShareLinks && !isAdmin && (
                    <TooltipContent><p>Share link limit reached</p></TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            )}
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
                <LayoutDashboard className="h-4 w-4 mr-2" />Admin
              </Button>
            )}
            {(permissions.can_add_products || isAdmin) && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        if (!canAddProducts && !isAdmin) {
                          onUpgradeDialog('products');
                          return;
                        }
                        navigate("/add-product");
                      }}
                      disabled={!canAddProducts && !isAdmin}
                    >
                      <Plus className="h-4 w-4 mr-2" />Add
                      {!isAdmin && productsRemaining !== Infinity && productsRemaining < 100 && (
                        <span className="ml-1 text-xs text-muted-foreground">({productsRemaining} left)</span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  {!canAddProducts && !isAdmin && (
                    <TooltipContent><p>Product limit reached</p></TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            )}
            {(permissions.can_import_data || isAdmin) && (
              <Button variant="outline" size="sm" onClick={() => navigate("/import")}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />Import
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onExportPDF}>
              <FileDown className="h-4 w-4 mr-2" />Export PDF
            </Button>
            {(permissions.can_manage_team || isAdmin) && (
              <Button variant="outline" size="sm" onClick={() => navigate("/team")}>
                <Users className="h-4 w-4 mr-2" />Team
              </Button>
            )}
            {(permissions.can_delete_products || isAdmin) && selectedCount > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={onBulkEdit}>
                  <Edit className="h-4 w-4 mr-2" />Update ({selectedCount})
                </Button>
                <Button variant="destructive" size="sm" onClick={onDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />Delete ({selectedCount})
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={onSignOut}>
              <LogOut className="h-4 w-4 mr-2" />Sign Out
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="lg:hidden w-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="default" className="w-full h-11">
                  <Menu className="h-5 w-5 mr-2" /><span className="font-medium">Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-[calc(100vw-2rem)] sm:w-80 max-h-[70vh] overflow-y-auto">
                {(permissions.can_view_interests || isAdmin) && (
                  <DropdownMenuItem onClick={() => navigate("/interests")} className="py-3">
                    <Heart className="h-5 w-5 mr-3 text-primary" />View Interests
                  </DropdownMenuItem>
                )}
                {(permissions.can_view_interests || isAdmin) && (
                  <DropdownMenuItem onClick={() => navigate("/video-requests")} className="py-3">
                    <Video className="h-5 w-5 mr-3 text-primary" />Video Requests
                  </DropdownMenuItem>
                )}
                {(permissions.can_view_interests || isAdmin) && (
                  <DropdownMenuItem onClick={() => navigate("/purchase-inquiries")} className="py-3">
                    <ShoppingCart className="h-5 w-5 mr-3 text-primary" />Purchase Inquiries
                  </DropdownMenuItem>
                )}
                {(permissions.can_edit_profile || isAdmin) && (
                  <DropdownMenuItem onClick={() => navigate("/vendor-profile")} className="py-3">
                    <Building2 className="h-5 w-5 mr-3 text-primary" />Vendor Profile
                  </DropdownMenuItem>
                )}
                {(permissions.can_share_catalog || isAdmin) && (
                  <DropdownMenuItem 
                    onClick={() => {
                      if (!canAddShareLinks && !isAdmin) {
                        onUpgradeDialog('share_links');
                        return;
                      }
                      navigate("/share");
                    }}
                    disabled={!canAddShareLinks && !isAdmin}
                    className="py-3"
                  >
                    <Share2 className="h-5 w-5 mr-3 text-primary" />Share Catalog
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/admin")} className="py-3">
                      <LayoutDashboard className="h-5 w-5 mr-3 text-primary" />Admin Dashboard
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                {(permissions.can_add_products || isAdmin) && (
                  <DropdownMenuItem 
                    onClick={() => {
                      if (!canAddProducts && !isAdmin) {
                        onUpgradeDialog('products');
                        return;
                      }
                      navigate("/add-product");
                    }}
                    disabled={!canAddProducts && !isAdmin}
                    className="py-3"
                  >
                    <Plus className="h-5 w-5 mr-3 text-primary" />Add Product
                  </DropdownMenuItem>
                )}
                {(permissions.can_import_data || isAdmin) && (
                  <DropdownMenuItem onClick={() => navigate("/import")} className="py-3">
                    <FileSpreadsheet className="h-5 w-5 mr-3 text-primary" />Import Data
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={onExportPDF} className="py-3">
                  <FileDown className="h-5 w-5 mr-3 text-primary" />Export PDF
                </DropdownMenuItem>
                {(permissions.can_manage_team || isAdmin) && (
                  <DropdownMenuItem onClick={() => navigate("/team")} className="py-3">
                    <Users className="h-5 w-5 mr-3 text-primary" />Manage Team
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {(permissions.can_view_sessions || isAdmin) && (
                  <DropdownMenuItem onClick={() => navigate("/active-sessions")} className="py-3">
                    <Shield className="h-5 w-5 mr-3 text-primary" />Active Sessions
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={onSignOut} className="py-3 text-destructive">
                  <LogOut className="h-5 w-5 mr-3" />Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
