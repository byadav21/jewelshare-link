import { useState, useEffect, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/integrations/supabase/client";
import { ApprovalGuard } from "@/components/ApprovalGuard";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { CatalogFilters, FilterState } from "@/components/CatalogFilters";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Gem, Plus, LogOut, Share2, FileSpreadsheet, Trash2, Heart, Users, LayoutDashboard, Menu, Building2, Shield, FileDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useVendorPermissions } from "@/hooks/useVendorPermissions";

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
  const { permissions, loading: permissionsLoading } = useVendorPermissions();

  // Redirect admins to admin dashboard
  useEffect(() => {
    if (!roleLoading && isAdmin) {
      navigate("/admin");
    }
  }, [isAdmin, roleLoading, navigate]);

  // Debug logging
  useEffect(() => {
    console.log('🔐 Catalog Permissions:', permissions);
    console.log('👤 Is Admin:', isAdmin);
  }, [permissions, isAdmin]);

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

  const exportToPDF = async () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Add vendor header
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(vendorProfile?.business_name || "Product Catalog", pageWidth / 2, 20, { align: "center" });
      
      // Add vendor details
      if (vendorProfile) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        let yPos = 30;
        
        if (vendorProfile.address_line1) {
          doc.text(`${vendorProfile.address_line1}${vendorProfile.address_line2 ? ', ' + vendorProfile.address_line2 : ''}`, pageWidth / 2, yPos, { align: "center" });
          yPos += 5;
        }
        
        if (vendorProfile.city) {
          doc.text(`${vendorProfile.city}, ${vendorProfile.state} ${vendorProfile.pincode}`, pageWidth / 2, yPos, { align: "center" });
          yPos += 5;
        }
        
        const contactInfo = [];
        if (vendorProfile.email) contactInfo.push(`Email: ${vendorProfile.email}`);
        if (vendorProfile.phone) contactInfo.push(`Phone: ${vendorProfile.phone}`);
        if (vendorProfile.whatsapp_number) contactInfo.push(`WhatsApp: ${vendorProfile.whatsapp_number}`);
        
        if (contactInfo.length > 0) {
          doc.text(contactInfo.join(' | '), pageWidth / 2, yPos, { align: "center" });
        }
      }
      
      // Add date and exchange rate
      doc.setFontSize(9);
      doc.text(`Date: ${new Date().toLocaleDateString('en-IN')} | Exchange Rate: 1 USD = ₹${usdRate.toFixed(2)}`, pageWidth / 2, 45, { align: "center" });
      
      // Prepare table data with all details
      const tableData = filteredProducts.map((product, index) => [
        index + 1,
        product.sku || '-',
        product.name,
        product.category || '-',
        product.metal_type || '-',
        product.gemstone || '-',
        product.color || '-',
        product.clarity || '-',
        product.weight_grams ? `${product.weight_grams}g` : '-',
        product.net_weight ? `${product.net_weight}g` : '-',
        product.diamond_weight ? `${product.diamond_weight}ct` : '-',
        product.per_carat_price ? `₹${product.per_carat_price.toLocaleString('en-IN')}` : '-',
        product.gold_per_gram_price ? `₹${product.gold_per_gram_price.toLocaleString('en-IN')}` : '-',
        `₹${product.retail_price.toLocaleString('en-IN')}`,
        `$${(product.retail_price / usdRate).toFixed(2)}`
      ]);
      
      // Add table with all columns
      autoTable(doc, {
        head: [['#', 'SKU', 'Name', 'Category', 'Metal', 'Gemstone', 'Color', 'Clarity', 'Gross Wt', 'Net Wt', 'Diamond Wt', 'Per Carat', 'Gold/g', 'Price (INR)', 'Price (USD)']],
        body: tableData,
        startY: 50,
        styles: { fontSize: 6.5, cellPadding: 1.5 },
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { top: 50, left: 10, right: 10 },
      });
      
      // Add totals at the bottom
      const finalY = (doc as any).lastAutoTable.finalY || 50;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`Total: ₹${totalINR.toLocaleString('en-IN')} | $${totalUSD.toFixed(2)} USD`, pageWidth / 2, finalY + 10, { align: "center" });
      doc.text(`Total Products: ${filteredProducts.length}`, pageWidth / 2, finalY + 16, { align: "center" });
      
      // Save PDF
      const fileName = `catalog_${vendorProfile?.business_name?.replace(/\s+/g, '_') || 'products'}_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
      
      toast.success("Catalog exported to PDF successfully!");
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast.error("Failed to export catalog to PDF");
    }
  };

  const fetchProducts = async () => {
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
  };

  const handleDeleteSelected = async () => {
    try {
      // Soft delete: set deleted_at timestamp
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
                    <h2 className="text-xl font-serif font-bold text-foreground leading-tight mb-1.5">
                      {vendorProfile.business_name || "My Jewelry Business"}
                    </h2>
                    <div className="text-sm text-muted-foreground mb-1.5">
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
                    <div className="flex gap-4 text-sm">
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
