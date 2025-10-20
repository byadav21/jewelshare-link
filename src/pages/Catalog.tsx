import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ApprovalGuard } from "@/components/ApprovalGuard";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { CatalogFilters, FilterState } from "@/components/CatalogFilters";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Gem, Plus, LogOut, Share2, FileSpreadsheet, Trash2, Heart, Users, LayoutDashboard, Menu, Building2, Shield } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";

const Catalog = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usdRate, setUsdRate] = useState(87.67);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const [filters, setFilters] = useState<FilterState>({
    category: "",
    metalType: "",
    minPrice: "",
    maxPrice: "",
    diamondColor: "",
    diamondClarity: "",
  });
  const navigate = useNavigate();
  const { isAdmin, isTeamMember, loading: roleLoading } = useUserRole();

  useEffect(() => {
    fetchProducts();
    fetchUSDRate();
    fetchVendorProfile();
  }, []);

  const fetchUSDRate = async () => {
    try {
      // Fetch live USD/INR rate from exchange rate API
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      if (data.rates?.INR) {
        setUsdRate(data.rates.INR);
      }
    } catch (error) {
      console.error("Failed to fetch USD rate:", error);
      // Keep default rate if fetch fails
    }
  };

  const fetchVendorProfile = async () => {
    try {
      console.log("🔍 Fetching vendor profile...");
      const { data: { user } } = await supabase.auth.getUser();
      console.log("👤 Current user:", user?.id);
      
      if (!user) {
        console.log("❌ No user found");
        return;
      }

      const { data, error } = await supabase
        .from("vendor_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      console.log("📊 Vendor profile query result:", { data, error });

      if (error && error.code !== 'PGRST116') {
        console.error("❌ Error fetching vendor profile:", error);
      } else if (data) {
        console.log("✅ Vendor profile loaded:", data);
        setVendorProfile(data);
      } else {
        console.log("ℹ️ No vendor profile found for this user");
      }
    } catch (error) {
      console.error("💥 Failed to fetch vendor profile:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .in("id", Array.from(selectedProducts));

      if (error) throw error;
      
      toast.success(`${selectedProducts.size} product(s) deleted successfully`);
      setSelectedProducts(new Set());
      fetchProducts();
    } catch (error: any) {
      toast.error("Failed to delete products");
    }
  };

  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)));
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
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

  return (
    <ApprovalGuard>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card backdrop-blur-sm sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-6 py-2.5 max-w-[1800px]">
            {/* First Layer: Company Details */}
            <div className="flex items-center justify-between gap-6">
              {/* Left: Vendor Profile with more space */}
              {vendorProfile && (
                <div className="flex items-center gap-6 flex-1">
                  <div className="flex-1">
                    <h2 className="text-lg font-serif font-bold text-foreground leading-tight mb-1">
                      {vendorProfile.business_name || "My Jewelry Business"}
                    </h2>
                    <div className="text-xs text-muted-foreground mb-1">
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
                    <div className="flex gap-4 text-xs">
                      {vendorProfile.email && (
                        <span className="text-primary font-medium">Email: {vendorProfile.email}</span>
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
                    <div className="flex gap-3">
                      {vendorProfile.instagram_qr_url && (
                        <div className="text-center">
                          <img 
                            src={vendorProfile.instagram_qr_url} 
                            alt="Instagram" 
                            className="w-20 h-20 object-cover rounded border border-border"
                          />
                          <p className="text-[10px] text-muted-foreground mt-1">Instagram</p>
                        </div>
                      )}
                      {vendorProfile.whatsapp_qr_url && (
                        <div className="text-center">
                          <img 
                            src={vendorProfile.whatsapp_qr_url} 
                            alt="WhatsApp" 
                            className="w-20 h-20 object-cover rounded border border-border"
                          />
                          <p className="text-[10px] text-muted-foreground mt-1">WhatsApp</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Right: Exchange Rate & Total Inventory */}
              <div className="flex flex-col items-end gap-2">
                <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md border border-border whitespace-nowrap">
                  1 USD = ₹{usdRate.toFixed(2)} INR • {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                {products.length > 0 && (
                  <div className="flex flex-col items-end gap-0.5 px-4 py-2 bg-primary/10 rounded-lg border border-primary/30">
                    <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Total Inventory</div>
                    <div className="text-xl font-bold text-primary">₹{totalINR.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                    <div className="text-sm text-muted-foreground font-semibold">${totalUSD.toLocaleString('en-US', { maximumFractionDigits: 0 })} USD</div>
                    {filteredProducts.length !== products.length && (
                      <div className="text-[10px] text-muted-foreground">
                        {filteredProducts.length} of {products.length} products
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Second Layer: Action Buttons */}
            <div className="flex items-center justify-center gap-2 mt-2.5 pt-2.5 border-t border-border/50">
              <div className="hidden lg:flex items-center gap-2">
                <Button variant="default" size="sm" onClick={() => navigate("/custom-order")}>
                  <Gem className="h-4 w-4 mr-2" />
                  Build
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate("/interests")}>
                  <Heart className="h-4 w-4 mr-2" />
                  Interests
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate("/vendor-profile")}>
                  <Building2 className="h-4 w-4 mr-2" />
                  Profile
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate("/share")}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                {isAdmin && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate("/add-product")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate("/import")}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Import
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate("/team")}>
                      <Users className="h-4 w-4 mr-2" />
                      Team
                    </Button>
                    {selectedProducts.size > 0 && (
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
                  </>
                )}
                <Button variant="outline" size="sm" onClick={() => navigate("/active-sessions")}>
                  <Shield className="h-4 w-4 mr-2" />
                  Sessions
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
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
                    <DropdownMenuItem onClick={() => navigate("/custom-order")}>
                      <Gem className="h-4 w-4 mr-2" />
                      Build Your Jewelry
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/interests")}>
                      <Heart className="h-4 w-4 mr-2" />
                      View Interests
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/vendor-profile")}>
                      <Building2 className="h-4 w-4 mr-2" />
                      Vendor Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/share")}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Catalog
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate("/admin")}>
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/add-product")}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Product
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/import")}>
                          <FileSpreadsheet className="h-4 w-4 mr-2" />
                          Import Data
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/team")}>
                          <Users className="h-4 w-4 mr-2" />
                          Manage Team
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/active-sessions")}>
                      <Shield className="h-4 w-4 mr-2" />
                      Active Sessions
                    </DropdownMenuItem>
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

        <main className="container mx-auto px-4 py-8">
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
              {isAdmin && filteredProducts.length > 0 && (
                <div className="mb-4 flex items-center gap-3 pb-3 border-b border-border">
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
                  })} className="mt-4">
                    Clear Filters
                  </Button>
                </div>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isSelected={selectedProducts.has(product.id)}
                  onToggleSelection={isAdmin ? toggleProductSelection : undefined}
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
