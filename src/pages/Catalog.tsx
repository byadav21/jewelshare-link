import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { CatalogFilters, FilterState } from "@/components/CatalogFilters";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Gem, Plus, LogOut, Share2, FileSpreadsheet, Trash2, Heart, Users, LayoutDashboard, Menu } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";

const Catalog = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usdRate, setUsdRate] = useState(87.67);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
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
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card backdrop-blur-sm sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Top row: Title and Inventory */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <Gem className="h-7 w-7 text-primary" />
                <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">My Jewelry Catalog</h1>
              </div>
              {products.length > 0 && (
                <div className="flex flex-col items-end gap-1 px-4 md:px-6 py-2 md:py-3 bg-primary/10 rounded-lg border border-primary/30">
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Inventory</div>
                  <div className="text-xl md:text-2xl font-bold text-primary">₹{totalINR.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                  <div className="text-xs md:text-sm text-muted-foreground font-semibold">${totalUSD.toLocaleString('en-US', { maximumFractionDigits: 0 })} USD</div>
                  {filteredProducts.length !== products.length && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {filteredProducts.length} of {products.length} products
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action buttons row */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Delete selected (shown only when products are selected) */}
              {isAdmin && selectedProducts.size > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Delete Selected</span>
                      <span className="sm:hidden">Delete</span> ({selectedProducts.size})
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

              {/* Primary CTA */}
              <Button variant="default" size="sm" onClick={() => navigate("/custom-order")}>
                <Gem className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Build Your Jewelry</span>
                <span className="sm:hidden">Build</span>
              </Button>

              {/* Secondary actions - visible on desktop */}
              <div className="hidden lg:flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate("/interests")}>
                  <Heart className="h-4 w-4 mr-2" />
                  View Interests
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate("/share")}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Catalog
                </Button>
                {isAdmin && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate("/add-product")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate("/import")}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Import
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate("/team")}>
                      <Users className="h-4 w-4 mr-2" />
                      Team
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>

              {/* Mobile menu */}
              <div className="lg:hidden ml-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Menu className="h-4 w-4 mr-2" />
                      Menu
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-popover z-50">
                    <DropdownMenuItem onClick={() => navigate("/interests")}>
                      <Heart className="h-4 w-4 mr-2" />
                      View Interests
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
            <div className="text-center py-12">
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
    </AuthGuard>
  );
};

export default Catalog;
