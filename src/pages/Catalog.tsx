import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ApprovalGuard } from "@/components/ApprovalGuard";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { CatalogFilters, FilterState } from "@/components/CatalogFilters";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Gem, Plus, LogOut, Share2, FileSpreadsheet, Trash2, Heart, Users, LayoutDashboard, Menu, Building2, Shield, FileDown, Edit, Loader2, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useVendorPermissions } from "@/hooks/useVendorPermissions";
import { exportCatalogToPDF } from "@/utils/pdfExport";

const Catalog = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usdRate, setUsdRate] = useState(87.67);
  const [goldRate, setGoldRate] = useState(85000);
  const [editingGoldRate, setEditingGoldRate] = useState(false);
  const [updatingGoldRate, setUpdatingGoldRate] = useState(false);
  const [tempGoldRate, setTempGoldRate] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const [filters, setFilters] = useState<FilterState>({
    category: "",
    metalType: "",
    minPrice: "",
    maxPrice: "",
    diamondColor: "",
    diamondClarity: "",
    searchQuery: "",
  });
  const navigate = useNavigate();
  const { isAdmin, isTeamMember, loading: roleLoading } = useUserRole();
  const { permissions, loading: permissionsLoading } = useVendorPermissions();

  useEffect(() => {
    if (!roleLoading && isAdmin) {
      navigate("/admin");
    }
  }, [isAdmin, roleLoading, navigate]);

  useEffect(() => {
    fetchProducts();
    fetchUSDRate();
    fetchVendorProfile();
  }, []);

  const fetchUSDRate = async () => {
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      if (data.rates?.INR) {
        setUsdRate(data.rates.INR);
      }
    } catch (error) {
      console.error("Failed to fetch USD rate:", error);
    }
  };

  const fetchVendorProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("vendor_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching vendor profile:", error);
      } else if (data) {
        setVendorProfile(data);
        if (data.gold_rate_24k_per_gram) {
          setGoldRate(data.gold_rate_24k_per_gram);
        }
      }
    } catch (error) {
      console.error("Failed to fetch vendor profile:", error);
    }
  };

  const handleUpdateGoldRate = async () => {
    const newRate = parseFloat(tempGoldRate);
    
    if (!tempGoldRate || tempGoldRate.trim() === "") {
      toast.error("Please enter a gold rate");
      return;
    }
    
    if (isNaN(newRate) || newRate <= 0) {
      toast.error("Please enter a valid positive number for gold rate");
      return;
    }

    if (newRate < 1000 || newRate > 200000) {
      toast.error("Gold rate must be between ₹1,000 and ₹2,00,000 per gram");
      return;
    }

    setUpdatingGoldRate(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUpdatingGoldRate(false);
        return;
      }

      const { error: profileError } = await supabase
        .from("vendor_profiles")
        .update({ 
          gold_rate_24k_per_gram: newRate,
          gold_rate_updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      const purity = 0.76;
      const updatedProducts = products
        .filter(p => p.weight_grams)
        .map(product => {
          const oldGoldValue = product.weight_grams * purity * goldRate;
          const newGoldValue = product.weight_grams * purity * newRate;
          const goldValueDifference = newGoldValue - oldGoldValue;
          
          return {
            id: product.id,
            cost_price: Math.max(0, product.cost_price + goldValueDifference),
            retail_price: Math.max(0, product.retail_price + goldValueDifference)
          };
        });

      let successCount = 0;
      for (const update of updatedProducts) {
        const { error } = await supabase
          .from("products")
          .update({ 
            cost_price: update.cost_price,
            retail_price: update.retail_price 
          })
          .eq("id", update.id);
        
        if (!error) successCount++;
      }

      setGoldRate(newRate);
      setEditingGoldRate(false);
      setTempGoldRate("");
      await fetchProducts();
      
      toast.success(`Gold rate updated to ₹${newRate.toLocaleString('en-IN')}/g and ${successCount} product prices recalculated!`);
      
      setTimeout(() => {
        setUpdatingGoldRate(false);
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Failed to update gold rate:", error);
      toast.error("Failed to update gold rate. Please try again.");
      setUpdatingGoldRate(false);
    }
  };

  // Predefined categories
  const predefinedCategories = [
    "DIAMOND PANDENT SET",
    "DIAMOND LADIES RING",
    "DIAMOND BRACELET",
    "DIAMOND PANDENT",
    "DIAMOND SET",
    "DIAMOND TOPS",
    "DIAMOND GENTS RING"
  ];

  // Extract unique filter values and merge with predefined
  const categories = useMemo(() => {
    const productCategories = products.map(p => p.category).filter(Boolean);
    const allCategories = [...new Set([...predefinedCategories, ...productCategories])];
    return allCategories.sort();
  }, [products]);
  
  const metalTypes = useMemo(() => 
    [...new Set(products.map(p => p.metal_type).filter(Boolean))].sort(),
    [products]
  );

  const diamondColors = useMemo(() => 
    [...new Set(products.map(p => p.gemstone?.split(' ')[0]).filter(Boolean))].sort(),
    [products]
  );

  const diamondClarities = useMemo(() => 
    [...new Set(products.map(p => p.gemstone?.split(' ')[1]).filter(Boolean))].sort(),
    [products]
  );

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search query - searches across multiple fields
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase().trim();
        const searchableFields = [
          product.product_type,
          product.diamond_color,
          product.d_wt_1?.toString(),
          product.d_wt_2?.toString(),
          product.purity_fraction_used?.toString(),
          product.d_rate_1?.toString(),
          product.pointer_diamond?.toString(),
          product.d_value?.toString(),
          product.mkg?.toString(),
          product.certification_cost?.toString(),
          product.gemstone_cost?.toString(),
          product.total_usd?.toString(),
          product.name,
          product.category,
          product.sku,
          product.description,
          product.metal_type,
          product.gemstone,
          product.color,
          product.clarity,
          product.weight_grams?.toString(),
          product.diamond_weight?.toString(),
          product.net_weight?.toString(),
          product.cost_price?.toString(),
          product.retail_price?.toString(),
          product.per_carat_price?.toString(),
          product.gold_per_gram_price?.toString(),
        ].filter(Boolean);

        const matchFound = searchableFields.some(field => 
          field?.toLowerCase().includes(query)
        );
        
        if (!matchFound) return false;
      }

      if (filters.category) {
        const categoryMatch = product.category?.toUpperCase().trim() === filters.category.toUpperCase().trim();
        const nameMatch = product.name?.toUpperCase().trim().includes(filters.category.toUpperCase().trim());
        if (!categoryMatch && !nameMatch) return false;
      }
      if (filters.metalType && product.metal_type?.toUpperCase().trim() !== filters.metalType.toUpperCase().trim()) return false;
      
      if (filters.minPrice) {
        const minPrice = parseFloat(filters.minPrice);
        if (product.retail_price < minPrice) return false;
      }
      
      if (filters.maxPrice) {
        const maxPrice = parseFloat(filters.maxPrice);
        if (product.retail_price > maxPrice) return false;
      }

      if (filters.diamondColor) {
        const color = product.gemstone?.split(' ')[0];
        if (color?.toUpperCase().trim() !== filters.diamondColor.toUpperCase().trim()) return false;
      }

      if (filters.diamondClarity) {
        const clarity = product.gemstone?.split(' ')[1];
        if (clarity?.toUpperCase().trim() !== filters.diamondClarity.toUpperCase().trim()) return false;
      }

      return true;
    });
  }, [products, filters]);

  // Calculate totals based on filtered products
  const totalINR = filteredProducts.reduce((sum, p) => sum + (p.retail_price || 0), 0);
  const totalUSD = totalINR / usdRate;

  const exportToPDF = useCallback(async () => {
    try {
      exportCatalogToPDF(filteredProducts, vendorProfile, usdRate, goldRate, totalINR, totalUSD);
      toast.success("Catalog exported to PDF successfully!");
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast.error("Failed to export catalog to PDF");
    }
  }, [filteredProducts, vendorProfile, usdRate, goldRate, totalINR, totalUSD]);

  const fetchProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteSelected = useCallback(async () => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ deleted_at: new Date().toISOString() })
        .in("id", Array.from(selectedProducts));

      if (error) throw error;
      
      toast.success(`${selectedProducts.size} product(s) deleted successfully`);
      setSelectedProducts(new Set());
      fetchProducts();
    } catch (error: any) {
      toast.error("Failed to delete products");
    }
  }, [selectedProducts, fetchProducts]);

  const toggleProductSelection = useCallback((productId: string) => {
    setSelectedProducts(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(productId)) {
        newSelected.delete(productId);
      } else {
        newSelected.add(productId);
      }
      return newSelected;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedProducts(prev => 
      prev.size === products.length ? new Set() : new Set(products.map(p => p.id))
    );
  }, [products]);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  }, [navigate]);

  return (
    <ApprovalGuard>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card backdrop-blur-sm sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-3 sm:px-6 py-2 sm:py-2.5 max-w-[1800px]">
            {/* First Layer: Company Details */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-6">
              {/* Left: Vendor Profile with more space */}
              {vendorProfile && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 flex-1 w-full md:w-auto">
                  <div className="flex-1 w-full">
                    <h2 className="text-lg sm:text-xl font-serif font-bold text-foreground leading-tight mb-1">
                      {vendorProfile.business_name || "My Jewelry Business"}
                    </h2>
                    <div className="text-xs sm:text-sm text-muted-foreground mb-1">
                      {vendorProfile.address_line1 && (
                        <span>
                          {vendorProfile.address_line1}
                          {vendorProfile.address_line2 && `, ${vendorProfile.address_line2}`}
                        </span>
                      )}
                      {vendorProfile.city && (
                        <span className="ml-1">• {vendorProfile.city}, {vendorProfile.state} {vendorProfile.pincode}</span>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm">
                      {vendorProfile.email && (
                        <span className="text-primary font-medium truncate">Email: {vendorProfile.email}</span>
                      )}
                      {vendorProfile.phone && (
                        <span className="text-primary font-medium">Phone: {vendorProfile.phone}</span>
                      )}
                      {vendorProfile.whatsapp_number && (
                        <span className="text-primary font-medium">WhatsApp: {vendorProfile.whatsapp_number}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* QR Codes */}
                  {(vendorProfile.instagram_qr_url || vendorProfile.whatsapp_qr_url) && (
                    <div className="flex gap-2 sm:gap-3">
                      {vendorProfile.instagram_qr_url && (
                        <div className="text-center">
                          <img 
                            src={vendorProfile.instagram_qr_url} 
                            alt="Instagram" 
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded border border-border"
                          />
                          <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1">Instagram</p>
                        </div>
                      )}
                      {vendorProfile.whatsapp_qr_url && (
                        <div className="text-center">
                          <img 
                            src={vendorProfile.whatsapp_qr_url} 
                            alt="WhatsApp" 
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded border border-border"
                          />
                          <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1">WhatsApp</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Right: Exchange Rate & Gold Rate & Total Inventory */}
              <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
                  <div className="text-[10px] sm:text-xs text-muted-foreground bg-muted/50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border border-border whitespace-nowrap">
                    1 USD = ₹{usdRate.toFixed(2)} • {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                  
                  {editingGoldRate ? (
                    <div className="flex items-center gap-1.5 sm:gap-2 bg-muted/50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border border-border w-full sm:w-auto">
                      <input
                        type="number"
                        value={tempGoldRate}
                        onChange={(e) => setTempGoldRate(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !updatingGoldRate) {
                            handleUpdateGoldRate();
                          } else if (e.key === 'Escape' && !updatingGoldRate) {
                            setEditingGoldRate(false);
                            setTempGoldRate("");
                          }
                        }}
                        placeholder={goldRate.toString()}
                        min="1000"
                        max="200000"
                        step="100"
                        disabled={updatingGoldRate}
                        className="w-20 sm:w-28 px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        autoFocus
                      />
                      <Button 
                        size="sm" 
                        onClick={handleUpdateGoldRate}
                        disabled={updatingGoldRate}
                        className="h-6 sm:h-7 px-2 sm:px-3 text-[10px] sm:text-xs bg-primary hover:bg-primary/90 disabled:opacity-50"
                      >
                        {updatingGoldRate ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span className="hidden sm:inline ml-1">Updating...</span>
                          </>
                        ) : (
                          'Save'
                        )}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => {
                          setEditingGoldRate(false);
                          setTempGoldRate("");
                        }} 
                        disabled={updatingGoldRate}
                        className="h-6 sm:h-7 px-2 sm:px-3 text-[10px] sm:text-xs disabled:opacity-50"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="text-[10px] sm:text-xs text-muted-foreground bg-amber-500/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border border-amber-500/30 whitespace-nowrap cursor-pointer hover:bg-amber-500/20 transition-colors flex items-center gap-1.5 sm:gap-2 active:scale-95"
                      onClick={() => {
                        setEditingGoldRate(true);
                        setTempGoldRate(goldRate.toString());
                      }}
                    >
                      <span className="font-semibold text-amber-700 dark:text-amber-400">24K: ₹{goldRate.toLocaleString('en-IN')}/g</span>
                      <Edit className="h-3 w-3 text-amber-600" />
                    </div>
                  )}
                </div>
                {products.length > 0 && (
                  <div className="flex flex-col items-start md:items-end gap-0.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-lg border border-primary/30 w-full md:w-auto">
                    <div className="text-[9px] sm:text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Total Inventory</div>
                    <div className="text-lg sm:text-xl font-bold text-primary">₹{totalINR.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground font-semibold">${totalUSD.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                    {filteredProducts.length !== products.length && (
                      <div className="text-[9px] sm:text-[10px] text-muted-foreground">
                        {filteredProducts.length} of {products.length} products
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Second Layer: Action Buttons */}
            <div className="flex items-center justify-center gap-2 mt-2 sm:mt-2.5 pt-2 sm:pt-2.5 border-t border-border/50">
              <div className="hidden lg:flex items-center flex-wrap gap-2">
                {(permissions.can_view_interests || isAdmin) && (
                  <Button variant="outline" size="sm" onClick={() => navigate("/interests")}>
                    <Heart className="h-4 w-4 mr-2" />
                    Interests
                  </Button>
                )}
                {(permissions.can_edit_profile || isAdmin) && (
                  <Button variant="outline" size="sm" onClick={() => navigate("/vendor-profile")}>
                    <Building2 className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                )}
                {(permissions.can_share_catalog || isAdmin) && (
                  <Button variant="outline" size="sm" onClick={() => navigate("/share")}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                )}
                {isAdmin && (
                  <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                )}
                {(permissions.can_add_products || isAdmin) && (
                  <Button variant="outline" size="sm" onClick={() => navigate("/add-product")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                )}
                {(permissions.can_import_data || isAdmin) && (
                  <Button variant="outline" size="sm" onClick={() => navigate("/import")}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={exportToPDF}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                {(permissions.can_manage_team || isAdmin) && (
                  <Button variant="outline" size="sm" onClick={() => navigate("/team")}>
                    <Users className="h-4 w-4 mr-2" />
                    Team
                  </Button>
                )}
                {(permissions.can_delete_products || isAdmin) && selectedProducts.size > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete ({selectedProducts.size})
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Selected Products?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete {selectedProducts.size} selected product(s). This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteSelected} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete Selected
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                {(permissions.can_view_sessions || isAdmin) && (
                  <Button variant="outline" size="sm" onClick={() => navigate("/active-sessions")}>
                    <Shield className="h-4 w-4 mr-2" />
                    Sessions
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>


              {/* Mobile Menu */}
              <div className="lg:hidden w-full">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      <Menu className="h-4 w-4 mr-2" />
                      Menu
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 bg-popover z-50 max-h-[70vh] overflow-y-auto">
                    {(permissions.can_view_interests || isAdmin) && (
                      <DropdownMenuItem onClick={() => navigate("/interests")}>
                        <Heart className="h-4 w-4 mr-2" />
                        View Interests
                      </DropdownMenuItem>
                    )}
                    {(permissions.can_edit_profile || isAdmin) && (
                      <DropdownMenuItem onClick={() => navigate("/vendor-profile")}>
                        <Building2 className="h-4 w-4 mr-2" />
                        Vendor Profile
                      </DropdownMenuItem>
                    )}
                    {(permissions.can_share_catalog || isAdmin) && (
                      <DropdownMenuItem onClick={() => navigate("/share")}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Catalog
                      </DropdownMenuItem>
                    )}
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate("/admin")}>
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    {(permissions.can_add_products || isAdmin) && (
                      <DropdownMenuItem onClick={() => navigate("/add-product")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                      </DropdownMenuItem>
                    )}
                    {(permissions.can_import_data || isAdmin) && (
                      <DropdownMenuItem onClick={() => navigate("/import")}>
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Import Data
                      </DropdownMenuItem>
                    )}
                    {(permissions.can_manage_team || isAdmin) && (
                      <DropdownMenuItem onClick={() => navigate("/team")}>
                        <Users className="h-4 w-4 mr-2" />
                        Manage Team
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    {(permissions.can_view_sessions || isAdmin) && (
                      <DropdownMenuItem onClick={() => navigate("/active-sessions")}>
                        <Shield className="h-4 w-4 mr-2" />
                        Active Sessions
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
          {loading ? (
            <div className="flex justify-center items-center min-h-[50vh]">
              <div className="animate-pulse text-primary text-xl">Loading catalog...</div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Gem className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-serif mb-2 text-foreground">No products yet</h2>
              <p className="text-muted-foreground mb-6">Start building your jewelry catalog</p>
              <Button onClick={() => navigate("/add-product")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Product
              </Button>
            </div>
          ) : (
            <>
              <CatalogFilters
                filters={filters}
                onFilterChange={setFilters}
                categories={categories}
                metalTypes={metalTypes}
                diamondColors={diamondColors}
                diamondClarities={diamondClarities}
              />
              {(permissions.can_delete_products || isAdmin) && filteredProducts.length > 0 && (
                <div className="mb-4 flex items-center gap-3 pb-3 border-border">
                  <Checkbox
                    id="select-all"
                    checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                  <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                    Select All ({filteredProducts.length})
                  </label>
                </div>
              )}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No products match your filters</p>
                  <Button variant="outline" onClick={() => setFilters({
                    category: "",
                    metalType: "",
                    minPrice: "",
                    maxPrice: "",
                    diamondColor: "",
                    diamondClarity: "",
                    searchQuery: "",
                  })} className="mt-4">
                    Clear Filters
                  </Button>
                </div>
              ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isSelected={selectedProducts.has(product.id)}
                  onToggleSelection={(permissions.can_delete_products || isAdmin) ? toggleProductSelection : () => {}}
                  usdRate={usdRate}
                />
              ))}
            </div>
              )}
            </>
          )}
        </main>
      </div>
    </ApprovalGuard>
  );
};

export default Catalog;
