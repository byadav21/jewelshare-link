import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, LogOut, Share2, FileSpreadsheet, Trash2, Heart, Users, LayoutDashboard, Menu, Building2, Shield, FileDown, Edit } from "lucide-react";

interface CatalogActionsProps {
  isAdmin: boolean;
  permissions: any;
  selectedProductsCount: number;
  onNavigate: (path: string) => void;
  onSignOut: () => void;
  onExportPDF: () => void;
  onDeleteSelected: () => void;
}

export const CatalogActions = ({
  isAdmin,
  permissions,
  selectedProductsCount,
  onNavigate,
  onSignOut,
  onExportPDF,
  onDeleteSelected,
}: CatalogActionsProps) => {
  return (
    <div className="flex items-center justify-center gap-2 mt-2.5 pt-2.5 border-t border-border/50">
      <div className="hidden lg:flex items-center gap-2">
        {(permissions.can_view_interests || isAdmin) && (
          <Button variant="outline" size="sm" onClick={() => onNavigate("/interests")}>
            <Heart className="h-4 w-4 mr-2" />
            Interests
          </Button>
        )}
        {(permissions.can_edit_profile || isAdmin) && (
          <Button variant="outline" size="sm" onClick={() => onNavigate("/vendor-profile")}>
            <Building2 className="h-4 w-4 mr-2" />
            Profile
          </Button>
        )}
        {(permissions.can_share_catalog || isAdmin) && (
          <Button variant="outline" size="sm" onClick={() => onNavigate("/share")}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        )}
        {isAdmin && (
          <Button variant="outline" size="sm" onClick={() => onNavigate("/admin")}>
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Admin
          </Button>
        )}
        {(permissions.can_add_products || isAdmin) && (
          <Button variant="outline" size="sm" onClick={() => onNavigate("/add-product")}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        )}
        {(permissions.can_import_data || isAdmin) && (
          <Button variant="outline" size="sm" onClick={() => onNavigate("/import")}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Import
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onExportPDF}>
          <FileDown className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
        {(permissions.can_manage_team || isAdmin) && (
          <Button variant="outline" size="sm" onClick={() => onNavigate("/team")}>
            <Users className="h-4 w-4 mr-2" />
            Team
          </Button>
        )}
        {(permissions.can_delete_products || isAdmin) && selectedProductsCount > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete ({selectedProductsCount})
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Selected Products?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete {selectedProductsCount} selected product(s). This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDeleteSelected} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete Selected
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        {(permissions.can_view_sessions || isAdmin) && (
          <Button variant="outline" size="sm" onClick={() => onNavigate("/active-sessions")}>
            <Shield className="h-4 w-4 mr-2" />
            Sessions
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      {/* Mobile Menu */}
      <div className="lg:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Menu className="h-4 w-4 mr-2" />
              Menu
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-popover z-50">
            {(permissions.can_view_interests || isAdmin) && (
              <DropdownMenuItem onClick={() => onNavigate("/interests")}>
                <Heart className="h-4 w-4 mr-2" />
                View Interests
              </DropdownMenuItem>
            )}
            {(permissions.can_edit_profile || isAdmin) && (
              <DropdownMenuItem onClick={() => onNavigate("/vendor-profile")}>
                <Building2 className="h-4 w-4 mr-2" />
                Vendor Profile
              </DropdownMenuItem>
            )}
            {(permissions.can_share_catalog || isAdmin) && (
              <DropdownMenuItem onClick={() => onNavigate("/share")}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Catalog
              </DropdownMenuItem>
            )}
            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onNavigate("/admin")}>
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Admin Dashboard
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            {(permissions.can_add_products || isAdmin) && (
              <DropdownMenuItem onClick={() => onNavigate("/add-product")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </DropdownMenuItem>
            )}
            {(permissions.can_import_data || isAdmin) && (
              <DropdownMenuItem onClick={() => onNavigate("/import")}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Import Data
              </DropdownMenuItem>
            )}
            {(permissions.can_manage_team || isAdmin) && (
              <DropdownMenuItem onClick={() => onNavigate("/team")}>
                <Users className="h-4 w-4 mr-2" />
                Manage Team
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {(permissions.can_view_sessions || isAdmin) && (
              <DropdownMenuItem onClick={() => onNavigate("/active-sessions")}>
                <Shield className="h-4 w-4 mr-2" />
                Active Sessions
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
