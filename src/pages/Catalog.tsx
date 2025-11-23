import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ApprovalGuard } from "@/components/ApprovalGuard";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { CatalogFilters, FilterState } from "@/components/CatalogFilters";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Gem, Plus, LogOut, Share2, FileSpreadsheet, Trash2, Heart, Users, LayoutDashboard, Menu, Building2, Shield, FileDown, Edit, Loader2, X, Upload, Video } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useVendorPermissions } from "@/hooks/useVendorPermissions";
import { exportCatalogToPDF } from "@/utils/pdfExport";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Catalog = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]); // Store all products for counting
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false); // For smooth transitions
  const [usdRate, setUsdRate] = useState(87.67);
  const [goldRate, setGoldRate] = useState(85000);
  const [editingGoldRate, setEditingGoldRate] = useState(false);
  const [updatingGoldRate, setUpdatingGoldRate] = useState(false);
  const [tempGoldRate, setTempGoldRate] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const [selectedProductType, setSelectedProductType] = useState<string>("Jewellery");
  const [approvedCategories, setApprovedCategories] = useState<string[]>(["Jewellery"]);
  const [filters, setFilters] = useState<FilterState>({
    category: "",
    metalType: "",
    minPrice: "",
    maxPrice: "",
    diamondColor: "",
    diamondClarity: "",
    searchQuery: "",
    deliveryType: "",
    gemstoneType: "",
    color: "",
    clarity: "",
    cut: "",
    minCarat: "",
    maxCarat: "",
    diamondType: "",
    shape: "",
    polish: "",
    symmetry: "",
    fluorescence: "",
    lab: "",
  });
  const navigate = useNavigate();
  const { isAdmin, isTeamMember, loading: roleLoading } = useUserRole();
  const { permissions, loading: permissionsLoading } = useVendorPermissions();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);

  useEffect(() => {
    if (!roleLoading && isAdmin) {
      navigate("/admin");
    }
  }, [isAdmin, roleLoading, navigate]);

  useEffect(() => {
    fetchAllProducts(); // Fetch all products first for counts
    fetchProducts();
    fetchUSDRate();
    fetchVendorProfile();
    fetchApprovedCategories();
  }, []);

  const fetchApprovedCategories = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_approval_status")
        .select("approved_categories")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      
      const approved = data?.approved_categories || ["Jewellery"];
      setApprovedCategories(approved);
      setSelectedProductType(approved[0]);
    } catch (error) {
      console.error("Failed to fetch approved categories:", error);
    }
  };

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

  const deliveryTypes = useMemo(() => 
    [...new Set(products.map(p => p.delivery_type).filter(Boolean))].sort(),
    [products]
  );

  // Filter products
  const filteredProducts = useMemo(() => {
    const filtered = products.filter(product => {
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

      if (filters.deliveryType && product.delivery_type !== filters.deliveryType) return false;

      return true;
    });
    
    return filtered;
  }, [products, filters]);
  
  // Paginated products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, itemsPerPage]);
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  
  // Reset to page 1 when filters change or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, selectedProductType]);
  
  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

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

  // Fetch all products for category counts
  const fetchAllProducts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user.id)
        .is("deleted_at", null);

      if (error) throw error;
      setAllProducts(data || []);
    } catch (error: any) {
      console.error("Failed to load all products:", error);
    }
  };

  const fetchProducts = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from("products")
        .select("*")
        .eq("user_id", user.id)
        .is("deleted_at", null);

      // Filter by product type, treating NULL as Jewellery for backward compatibility
      if (selectedProductType === 'Jewellery') {
        query = query.or(`product_type.eq.${selectedProductType},product_type.is.null`);
      } else {
        query = query.eq("product_type", selectedProductType);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [selectedProductType]);

  // Re-fetch products when category changes with transition
  useEffect(() => {
    if (selectedProductType) {
      setTransitioning(true);
      setLoading(true);
      
      // Fetch products and clear transition state
      fetchProducts().finally(() => {
        setTimeout(() => {
          setTransitioning(false);
        }, 200);
      });
    }
  }, [selectedProductType, fetchProducts]);

  // Calculate product counts per category
  const getCategoryCount = useCallback((category: string) => {
    if (category === 'Jewellery') {
      return allProducts.filter(p => 
        p.product_type === 'Jewellery' || p.product_type === null
      ).length;
    }
    return allProducts.filter(p => p.product_type === category).length;
  }, [allProducts]);

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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Mobile-Optimized Header */}
        <header className="border-b border-border/50 bg-card/95 backdrop-blur-md shadow-lg">
          <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 max-w-[1800px]">
            {/* Vendor Details Section */}
            {vendorProfile && (
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6 mb-4 pb-4 border-b border-border/30">
                {/* Left: Business Info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 flex-1 w-full lg:w-auto">
                  <div className="flex-1 w-full">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent leading-tight mb-2">
                      {vendorProfile.business_name || "My Jewelry Business"}
                    </h1>
                    {vendorProfile.address_line1 && (
                      <div className="text-xs sm:text-sm text-muted-foreground mb-2 leading-relaxed">
                        <span className="block sm:inline">
                          {vendorProfile.address_line1}
                          {vendorProfile.address_line2 && `, ${vendorProfile.address_line2}`}
                        </span>
                        {vendorProfile.city && (
                          <span className="block sm:inline sm:ml-2">
                            <span className="hidden sm:inline">• </span>
                            {vendorProfile.city}, {vendorProfile.state} {vendorProfile.pincode}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm">
                      {vendorProfile.email && (
                        <span className="text-primary/90 font-medium truncate flex items-center gap-1">
                          <span className="opacity-70">Email:</span> {vendorProfile.email}
                        </span>
                      )}
                      {vendorProfile.phone && (
                        <span className="text-primary/90 font-medium flex items-center gap-1">
                          <span className="opacity-70">Phone:</span> {vendorProfile.phone}
                        </span>
                      )}
                      {vendorProfile.whatsapp_number && (
                        <span className="text-primary/90 font-medium flex items-center gap-1">
                          <span className="opacity-70">WhatsApp:</span> {vendorProfile.whatsapp_number}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* QR Codes */}
                  {(vendorProfile.instagram_qr_url || vendorProfile.whatsapp_qr_url) && (
                    <div className="flex gap-3 sm:gap-4">
                      {vendorProfile.instagram_qr_url && (
                        <div className="group text-center">
                          <div className="relative overflow-hidden rounded-lg border-2 border-border/50 group-hover:border-primary/50 transition-all duration-300 group-hover:shadow-lg">
                            <img 
                              src={vendorProfile.instagram_qr_url} 
                              alt="Instagram QR" 
                              className="w-20 h-20 sm:w-24 sm:h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 font-medium">Instagram</p>
                        </div>
                      )}
                      {vendorProfile.whatsapp_qr_url && (
                        <div className="group text-center">
                          <div className="relative overflow-hidden rounded-lg border-2 border-border/50 group-hover:border-primary/50 transition-all duration-300 group-hover:shadow-lg">
                            <img 
                              src={vendorProfile.whatsapp_qr_url} 
                              alt="WhatsApp QR" 
                              className="w-20 h-20 sm:w-24 sm:h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 font-medium">WhatsApp</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right: Rates & Inventory */}
                <div className="flex flex-col items-start lg:items-end gap-3 w-full lg:w-auto">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
                    {/* USD Rate Badge */}
                    <div className="group relative text-xs sm:text-sm bg-gradient-to-r from-muted/80 to-muted/60 px-3 sm:px-4 py-2 rounded-lg border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">1 USD = ₹{usdRate.toFixed(2)}</span>
                        <span className="text-muted-foreground text-xs">• {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    </div>
                    
                    {/* Gold Rate Editor/Display */}
                    {editingGoldRate ? (
                      <div className="flex items-center gap-2 bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/30 shadow-sm w-full sm:w-auto">
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
                          className="w-24 sm:w-32 px-3 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          autoFocus
                        />
                        <Button 
                          size="sm" 
                          onClick={handleUpdateGoldRate}
                          disabled={updatingGoldRate}
                          className="h-8 px-3 text-xs bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
                        >
                          {updatingGoldRate ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              <span className="hidden sm:inline">Updating...</span>
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
                          className="h-8 px-2 text-xs disabled:opacity-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => {
                          setEditingGoldRate(true);
                          setTempGoldRate(goldRate.toString());
                        }}
                        className="group relative text-xs sm:text-sm bg-gradient-to-r from-amber-500/20 to-amber-600/20 px-3 sm:px-4 py-2 rounded-lg border border-amber-500/40 hover:border-amber-500/60 shadow-sm hover:shadow-md transition-all duration-300 active:scale-95"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-700 dark:text-amber-400">24K Gold: ₹{goldRate.toLocaleString('en-IN')}/g</span>
                          <Edit className="h-3.5 w-3.5 text-amber-600 dark:text-amber-500 group-hover:rotate-12 transition-transform" />
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Total Inventory Card */}
                  {products.length > 0 && (
                    <div className="flex flex-col items-start lg:items-end gap-1 px-4 sm:px-5 py-3 bg-gradient-to-br from-primary/15 to-primary/5 rounded-xl border border-primary/30 shadow-md hover:shadow-lg transition-all duration-300 w-full lg:w-auto">
                      <div className="text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Inventory Value</div>
                      <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        ₹{totalINR.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </div>
                      <div className="text-sm sm:text-base text-muted-foreground font-semibold">${totalUSD.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                      {filteredProducts.length !== products.length && (
                        <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                          Showing {filteredProducts.length} of {products.length} products
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons Section */}
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {/* Desktop Menu */}
              <div className="hidden lg:flex items-center flex-wrap gap-2 justify-center">
                {(permissions.can_view_interests || isAdmin) && (
                  <Button variant="outline" size="sm" onClick={() => navigate("/interests")}>
                    <Heart className="h-4 w-4 mr-2" />
                    Interests
                  </Button>
                )}
                {(permissions.can_view_interests || isAdmin) && (
                  <Button variant="outline" size="sm" onClick={() => navigate("/video-requests")}>
                    <Video className="h-4 w-4 mr-2" />
                    Video Requests
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
                  <Button variant="outline" size="sm" onClick={() => navigate("/migrate-images")}>
                    <Upload className="h-4 w-4 mr-2" />
                    Migrate Images
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
                    <Button variant="outline" size="default" className="w-full touch-manipulation h-11 shadow-sm hover:shadow-md transition-shadow">
                      <Menu className="h-5 w-5 mr-2" />
                      <span className="font-medium">Menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-[calc(100vw-2rem)] sm:w-80 bg-card border-border/50 shadow-xl z-50 max-h-[70vh] overflow-y-auto">
                    {(permissions.can_view_interests || isAdmin) && (
                      <DropdownMenuItem onClick={() => navigate("/interests")} className="py-3 cursor-pointer hover:bg-muted/50">
                        <Heart className="h-5 w-5 mr-3 text-primary" />
                        <span className="font-medium">View Interests</span>
                      </DropdownMenuItem>
                    )}
                    {(permissions.can_view_interests || isAdmin) && (
                      <DropdownMenuItem onClick={() => navigate("/video-requests")} className="py-3 cursor-pointer hover:bg-muted/50">
                        <Video className="h-5 w-5 mr-3 text-primary" />
                        <span className="font-medium">Video Requests</span>
                      </DropdownMenuItem>
                    )}
                    {(permissions.can_edit_profile || isAdmin) && (
                      <DropdownMenuItem onClick={() => navigate("/vendor-profile")} className="py-3 cursor-pointer hover:bg-muted/50">
                        <Building2 className="h-5 w-5 mr-3 text-primary" />
                        <span className="font-medium">Vendor Profile</span>
                      </DropdownMenuItem>
                    )}
                    {(permissions.can_share_catalog || isAdmin) && (
                      <DropdownMenuItem onClick={() => navigate("/share")} className="py-3 cursor-pointer hover:bg-muted/50">
                        <Share2 className="h-5 w-5 mr-3 text-primary" />
                        <span className="font-medium">Share Catalog</span>
                      </DropdownMenuItem>
                    )}
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator className="my-2" />
                        <DropdownMenuItem onClick={() => navigate("/admin")} className="py-3 cursor-pointer hover:bg-muted/50">
                          <LayoutDashboard className="h-5 w-5 mr-3 text-primary" />
                          <span className="font-medium">Admin Dashboard</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator className="my-2" />
                    {(permissions.can_add_products || isAdmin) && (
                      <DropdownMenuItem onClick={() => navigate("/add-product")} className="py-3 cursor-pointer hover:bg-muted/50">
                        <Plus className="h-5 w-5 mr-3 text-primary" />
                        <span className="font-medium">Add Product</span>
                      </DropdownMenuItem>
                    )}
                    {(permissions.can_import_data || isAdmin) && (
                      <DropdownMenuItem onClick={() => navigate("/import")} className="py-3 cursor-pointer hover:bg-muted/50">
                        <FileSpreadsheet className="h-5 w-5 mr-3 text-primary" />
                        <span className="font-medium">Import Data</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={exportToPDF} className="py-3 cursor-pointer hover:bg-muted/50">
                      <FileDown className="h-5 w-5 mr-3 text-primary" />
                      <span className="font-medium">Export PDF</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/migrate-images")} className="py-3 cursor-pointer hover:bg-muted/50">
                      <Upload className="h-5 w-5 mr-3 text-primary" />
                      <span className="font-medium">Migrate Images</span>
                    </DropdownMenuItem>
                    {(permissions.can_manage_team || isAdmin) && (
                      <DropdownMenuItem onClick={() => navigate("/team")} className="py-3 cursor-pointer hover:bg-muted/50">
                        <Users className="h-5 w-5 mr-3 text-primary" />
                        <span className="font-medium">Manage Team</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="my-2" />
                    {(permissions.can_view_sessions || isAdmin) && (
                      <DropdownMenuItem onClick={() => navigate("/active-sessions")} className="py-3 cursor-pointer hover:bg-muted/50">
                        <Shield className="h-5 w-5 mr-3 text-primary" />
                        <span className="font-medium">Active Sessions</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleSignOut} className="py-3 cursor-pointer hover:bg-destructive/10 text-destructive">
                      <LogOut className="h-5 w-5 mr-3" />
                      <span className="font-medium">Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-10 max-w-[1800px]">
          {loading ? (
            <div className="space-y-8 animate-fade-in">
              {/* Loading Skeletons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-scale-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <ProductCardSkeleton />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              {/* Elegant Category Selector - Always visible */}
              {approvedCategories.length > 1 && (
                <div className="mb-8 flex gap-3 flex-wrap justify-center">
                  {approvedCategories.map((category) => {
                    const isSelected = selectedProductType === category;
                    const categoryKey = category.toLowerCase().replace(/\s+/g, '-');
                    
                    // Define category-specific colors and icons
                    const categoryStyles: Record<string, any> = {
                      'jewellery': {
                        gradient: 'from-category-jewellery/20 to-category-jewellery/5',
                        border: 'border-category-jewellery/40',
                        text: 'text-category-jewellery',
                        glow: 'shadow-[0_0_20px_hsl(var(--category-jewellery)/0.3)]',
                        icon: '💍'
                      },
                      'gemstones': {
                        gradient: 'from-category-gemstone/20 to-category-gemstone/5',
                        border: 'border-category-gemstone/40',
                        text: 'text-category-gemstone',
                        glow: 'shadow-[0_0_20px_hsl(var(--category-gemstone)/0.3)]',
                        icon: '💎'
                      },
                      'loose-gemstones': {
                        gradient: 'from-category-gemstone/20 to-category-gemstone/5',
                        border: 'border-category-gemstone/40',
                        text: 'text-category-gemstone',
                        glow: 'shadow-[0_0_20px_hsl(var(--category-gemstone)/0.3)]',
                        icon: '💎'
                      },
                      'loose-diamonds': {
                        gradient: 'from-category-diamond/20 to-category-diamond/5',
                        border: 'border-category-diamond/40',
                        text: 'text-category-diamond',
                        glow: 'shadow-[0_0_20px_hsl(var(--category-diamond)/0.3)]',
                        icon: '✨'
                      }
                    };
                    
                    const style = categoryStyles[categoryKey] || categoryStyles['jewellery'];
                    const count = getCategoryCount(category);
                    
                    return (
                      <button
                        key={category}
                        onClick={() => setSelectedProductType(category)}
                        disabled={transitioning}
                        className={`
                          group relative overflow-hidden
                          px-8 py-4 rounded-2xl
                          font-serif text-lg font-semibold
                          transition-all duration-500 ease-out
                          disabled:opacity-50 disabled:cursor-wait
                          ${isSelected 
                            ? `bg-gradient-to-br ${style.gradient} border-2 ${style.border} ${style.glow} scale-105` 
                            : 'bg-card/50 border-2 border-border/30 hover:border-border/60 hover:scale-102'
                          }
                        `}
                      >
                        {/* Animated background shine effect */}
                        <div className={`
                          absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
                          -translate-x-full group-hover:translate-x-full
                          transition-transform duration-1000 ease-out
                        `} />
                        
                        {/* Content */}
                        <span className={`
                          relative flex items-center gap-3
                          ${isSelected ? style.text : 'text-muted-foreground group-hover:text-foreground'}
                          transition-colors duration-300
                        `}>
                          <span className="text-2xl">{style.icon}</span>
                          <div className="flex flex-col items-start">
                            <span className="tracking-wide">{category}</span>
                            <span className={`
                              text-xs font-normal opacity-70
                              ${isSelected ? '' : 'text-muted-foreground/60'}
                            `}>
                              {count} {count === 1 ? 'item' : 'items'}
                            </span>
                          </div>
                        </span>
                        
                        {/* Bottom accent line for selected state */}
                        {isSelected && (
                          <div className={`
                            absolute bottom-0 left-1/2 -translate-x-1/2
                            h-1 w-3/4 rounded-full
                            bg-gradient-to-r ${style.gradient}
                            animate-pulse
                          `} />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {products.length === 0 ? (
                <div className="text-center py-16 sm:py-20">
                  <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/10 mb-6">
                    <Gem className="h-10 w-10 sm:h-12 sm:h-12 text-primary" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-3 text-foreground">No products yet</h2>
                  <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-md mx-auto">Start building your stunning jewelry catalog and showcase your collection</p>
                  <Button 
                    onClick={() => navigate("/add-product")} 
                    size="lg"
                    className="shadow-lg hover:shadow-xl transition-all duration-300 h-12 px-8"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Your First Product
                  </Button>
                </div>
              ) : (
                <>

              {/* Filters - Always visible, not affected by transition */}
              <div 
                key={`filters-${selectedProductType}`}
                className="mb-6 sm:mb-8 animate-slide-in-right"
              >
                <CatalogFilters
                  filters={filters}
                  onFilterChange={setFilters}
                  productType={selectedProductType}
                  categories={categories}
                  metalTypes={metalTypes}
                  diamondColors={diamondColors}
                  diamondClarities={diamondClarities}
                  deliveryTypes={deliveryTypes}
                  gemstoneTypes={[]}
                  colors={[]}
                  clarities={[]}
                  cuts={[]}
                  shapes={[]}
                  polishes={[]}
                  symmetries={[]}
                  fluorescences={[]}
                  labs={[]}
                />
              </div>

              {/* Select All Checkbox */}
              {(permissions.can_delete_products || isAdmin) && filteredProducts.length > 0 && (
                <div className="mb-6 flex items-center gap-3 pb-4 border-b border-border/30">
                  <Checkbox
                    id="select-all"
                    checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                    onCheckedChange={toggleSelectAll}
                    className="h-5 w-5"
                  />
                  <label htmlFor="select-all" className="text-sm sm:text-base font-medium cursor-pointer select-none">
                    Select All ({filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'})
                  </label>
                </div>
              )}

              {/* Products Grid or Empty State */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 sm:py-20">
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted/50 mb-6">
                    <Gem className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-foreground">No products match your filters</h3>
                  <p className="text-muted-foreground mb-6">Try adjusting your search criteria</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setFilters({
                      category: "",
                      metalType: "",
                      minPrice: "",
                      maxPrice: "",
                      diamondColor: "",
                      diamondClarity: "",
                      searchQuery: "",
                      deliveryType: "",
                      gemstoneType: "",
                      color: "",
                      clarity: "",
                      cut: "",
                      minCarat: "",
                      maxCarat: "",
                      diamondType: "",
                      shape: "",
                      polish: "",
                      symmetry: "",
                      fluorescence: "",
                      lab: "",
                    })}
                    className="shadow-sm hover:shadow-md transition-all"
                  >
                    Clear All Filters
                  </Button>
                </div>
              ) : (
                <>
                  <div 
                    key={selectedProductType}
                    className={`
                      grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6
                      transition-opacity duration-300
                      ${transitioning ? 'opacity-0' : 'opacity-100 animate-fade-in'}
                    `}
                  >
                    {paginatedProducts.map((product, index) => (
                      <div
                        key={product.id}
                        className="animate-scale-in"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <ProductCard
                          product={product}
                          isSelected={selectedProducts.has(product.id)}
                          onToggleSelection={(permissions.can_delete_products || isAdmin) ? toggleProductSelection : () => {}}
                          usdRate={usdRate}
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 py-6 border-t border-border/30">
                      {/* Items per page selector */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground font-medium">Products per page:</span>
                        <Select 
                          value={itemsPerPage.toString()} 
                          onValueChange={(value) => {
                            setItemsPerPage(Number(value));
                            setCurrentPage(1);
                          }}
                        >
                          <SelectTrigger className="w-24 h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                            <SelectItem value="200">200</SelectItem>
                            <SelectItem value="500">500</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Page info */}
                      <div className="text-sm text-muted-foreground">
                        Showing <span className="font-semibold text-foreground">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                        <span className="font-semibold text-foreground">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> of{' '}
                        <span className="font-semibold text-foreground">{filteredProducts.length}</span> products
                      </div>
                      
                      {/* Pagination */}
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                          
                          {getPageNumbers().map((page, index) => (
                            <PaginationItem key={index}>
                              {page === 'ellipsis' ? (
                                <PaginationEllipsis />
                              ) : (
                                <PaginationLink
                                  onClick={() => setCurrentPage(page as number)}
                                  isActive={currentPage === page}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              )}
                            </PaginationItem>
                          ))}
                          
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}
    </main>
      </div>
    </ApprovalGuard>
  );
};

export default Catalog;
