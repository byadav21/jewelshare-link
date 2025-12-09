import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ApprovalGuard } from "@/components/ApprovalGuard";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { CatalogFilters, FilterState } from "@/components/CatalogFilters";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, LogOut, Share2, FileSpreadsheet, Trash2, Heart, Users, LayoutDashboard, Menu, Building2, Shield, FileDown, Edit, Upload, Video, ShoppingCart, Sparkles } from "lucide-react";
import { AutoCategorizationDialog } from "@/components/AutoCategorizationDialog";
import { analyzeCatalog, CategorySuggestion } from "@/utils/productCategorization";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useVendorPermissions } from "@/hooks/useVendorPermissions";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { exportCatalogToPDF } from "@/utils/pdfExport";
import { PlanLimitWarning } from "@/components/PlanLimitWarning";
import { PlanUsageBanner } from "@/components/PlanUsageBanner";
import { UpgradePromptDialog } from "@/components/UpgradePromptDialog";
import { GoldRateDialog } from "@/components/GoldRateDialog";
import { FloatingQRCodes } from "@/components/FloatingQRCodes";
import { QuickActionsMenu } from "@/components/QuickActionsMenu";
import { BulkEditDialog } from "@/components/BulkEditDialog";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { Header } from "@/components/Header";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { NavLink } from "@/components/NavLink";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Catalog = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [usdRate, setUsdRate] = useState(87.67);
  const [goldRate, setGoldRate] = useState(0); // Start with 0, will be set from vendor profile
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const [selectedProductType, setSelectedProductType] = useState<string>("Jewellery");
  const [approvedCategories, setApprovedCategories] = useState<string[]>(["Jewellery"]);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [upgradeLimitType, setUpgradeLimitType] = useState<'products' | 'share_links' | undefined>();
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [autoCategorizationOpen, setAutoCategorizationOpen] = useState(false);
  const [categorySuggestions, setCategorySuggestions] = useState<CategorySuggestion[]>([]);
  
  const [filters, setFilters] = useState<FilterState>({
    category: "",
    metalType: "",
    minPrice: "",
    maxPrice: "",
    diamondColor: "",
    diamondClarity: "",
    searchQuery: "",
    deliveryType: "",
    minDiamondWeight: "",
    maxDiamondWeight: "",
    minNetWeight: "",
    maxNetWeight: "",
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
    lab: ""
  });

  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { permissions, loading: permissionsLoading } = useVendorPermissions();
  const { canAddProducts, canAddShareLinks, productsRemaining, shareLinksRemaining } = usePlanLimits();

  const [displayCount, setDisplayCount] = useState(50); // Reduced for faster initial load
  const LOAD_MORE_COUNT = 50;

  // Redirect admin to admin dashboard
  useEffect(() => {
    if (!roleLoading && isAdmin) {
      navigate("/admin");
    }
  }, [isAdmin, roleLoading, navigate]);

  // Optimized parallel initial data fetch
  useEffect(() => {
    const initializeData = async () => {
      // Check cached USD rate first (sync)
      const cachedRate = sessionStorage.getItem('usd_rate');
      const cachedTime = sessionStorage.getItem('usd_rate_time');
      if (cachedRate && cachedTime && Date.now() - parseInt(cachedTime) < 3600000) {
        setUsdRate(parseFloat(cachedRate));
      }
      
      // Parallel fetch for faster load
      await Promise.all([
        fetchVendorProfile(),
        fetchApprovedCategories(),
        !cachedRate ? fetchUSDRate() : Promise.resolve()
      ]);
      
      setInitialLoadComplete(true);
    };
    
    initializeData();
  }, []);

  // Fetch products when product type changes
  useEffect(() => {
    if (selectedProductType && initialLoadComplete) {
      fetchProducts();
    }
  }, [selectedProductType, initialLoadComplete]);

  // Reset display count on filter change
  useEffect(() => {
    setDisplayCount(50);
  }, [filters, selectedProductType]);

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
        sessionStorage.setItem('usd_rate', data.rates.INR.toString());
        sessionStorage.setItem('usd_rate_time', Date.now().toString());
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

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      
      let query = supabase
        .from("products")
        .select("id, name, sku, image_url, image_url_2, image_url_3, cost_price, retail_price, stock_quantity, category, metal_type, gemstone, color, diamond_color, clarity, delivery_type, product_type, weight_grams, gemstone_type, carat_weight, cut, diamond_type, shape, carat, polish, symmetry, fluorescence, lab, created_at, purity_fraction_used, net_weight, d_value, mkg, certification_cost, gemstone_cost, gold_per_gram_price, d_rate_1, d_wt_1, d_wt_2, pointer_diamond, diamond_weight")
        .eq("user_id", user.id)
        .is("deleted_at", null);

      if (selectedProductType === 'Jewellery') {
        query = query.or(`product_type.eq.${selectedProductType},product_type.is.null`);
      } else {
        query = query.eq("product_type", selectedProductType);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
        
      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error("Failed to load products:", error);
      toast.error("Failed to load products. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, [selectedProductType]);

  const handleUpdateGoldRate = async (newRate: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { error: profileError } = await supabase
      .from("vendor_profiles")
      .update({
        gold_rate_24k_per_gram: newRate,
        gold_rate_updated_at: new Date().toISOString()
      })
      .eq("user_id", user.id);
    
    if (profileError) throw profileError;
    
    // Recalculate product prices
    const updatedProducts = products.filter(p => p.net_weight || p.weight_grams).map(product => {
      const purityRaw = product.purity_fraction_used || 18;
      let purity: number;
      if (purityRaw <= 1) {
        purity = purityRaw;
      } else if (purityRaw <= 24) {
        purity = purityRaw / 24;
      } else {
        purity = purityRaw / 100;
      }
      
      const weight = product.net_weight || product.weight_grams || 0;
      const goldValue = weight * purity * newRate;
      const diamondValue = product.d_value || 0;
      const makingCharges = product.mkg || 0;
      const certificationCost = product.certification_cost || 0;
      const gemstoneCost = product.gemstone_cost || 0;
      const totalCost = goldValue + diamondValue + makingCharges + certificationCost + gemstoneCost;
      
      return {
        id: product.id,
        cost_price: Math.round(totalCost * 100) / 100,
        retail_price: Math.round(totalCost * 100) / 100,
        gold_per_gram_price: newRate
      };
    });

    const updatePromises = updatedProducts.map(update => 
      supabase.from("products").update({
        cost_price: update.cost_price,
        retail_price: update.retail_price,
        gold_per_gram_price: update.gold_per_gram_price
      }).eq("id", update.id)
    );
    
    await Promise.all(updatePromises);
    setGoldRate(newRate);
    await fetchProducts();
    toast.success(`Gold rate updated to ₹${newRate.toLocaleString('en-IN')}/g`);
  };

  // Dynamic filter options from products
  const categories = useMemo(() => {
    const productCategories = products.map(p => p.category).filter(Boolean) as string[];
    return [...new Set(productCategories)].sort();
  }, [products]);
  
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach(p => {
      if (p.category) {
        const cat = p.category.toUpperCase().trim();
        counts[cat] = (counts[cat] || 0) + 1;
      }
    });
    return counts;
  }, [products]);
  
  const metalTypes = useMemo(() => [...new Set(products.map(p => p.metal_type).filter(Boolean))].sort(), [products]);
  const diamondColors = useMemo(() => [...new Set(products.map(p => p.gemstone?.split(' ')[0]).filter(Boolean))].sort(), [products]);
  const diamondClarities = useMemo(() => [...new Set(products.map(p => p.gemstone?.split(' ')[1]).filter(Boolean))].sort(), [products]);
  const deliveryTypes = useMemo(() => [...new Set(products.map(p => p.delivery_type).filter(Boolean))].sort(), [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    const filtered = products.filter(product => {
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase().trim();
        const searchableFields = [
          product.name, product.category, product.sku, product.description,
          product.metal_type, product.gemstone, product.color, product.clarity,
          product.diamond_weight?.toString(), product.net_weight?.toString(),
          product.retail_price?.toString()
        ].filter(Boolean);
        if (!searchableFields.some(field => field?.toLowerCase().includes(query))) return false;
      }
      
      if (filters.category) {
        const categoryMatch = product.category?.toUpperCase().trim() === filters.category.toUpperCase().trim();
        const nameMatch = product.name?.toUpperCase().trim().includes(filters.category.toUpperCase().trim());
        if (!categoryMatch && !nameMatch) return false;
      }
      
      if (filters.metalType && product.metal_type?.toUpperCase().trim() !== filters.metalType.toUpperCase().trim()) return false;
      if (filters.minPrice && product.retail_price < parseFloat(filters.minPrice)) return false;
      if (filters.maxPrice && product.retail_price > parseFloat(filters.maxPrice)) return false;
      
      if (filters.diamondColor) {
        const color = product.gemstone?.split(' ')[0];
        if (color?.toUpperCase().trim() !== filters.diamondColor.toUpperCase().trim()) return false;
      }
      
      if (filters.diamondClarity) {
        const clarity = product.gemstone?.split(' ')[1];
        if (clarity?.toUpperCase().trim() !== filters.diamondClarity.toUpperCase().trim()) return false;
      }
      
      if (filters.deliveryType && product.delivery_type !== filters.deliveryType) return false;
      
      if (filters.minDiamondWeight) {
        const minDW = parseFloat(filters.minDiamondWeight);
        if (!product.diamond_weight || product.diamond_weight < minDW) return false;
      }
      if (filters.maxDiamondWeight) {
        const maxDW = parseFloat(filters.maxDiamondWeight);
        if (!product.diamond_weight || product.diamond_weight > maxDW) return false;
      }
      
      if (filters.minNetWeight) {
        const minNW = parseFloat(filters.minNetWeight);
        if (!product.net_weight || product.net_weight < minNW) return false;
      }
      if (filters.maxNetWeight) {
        const maxNW = parseFloat(filters.maxNetWeight);
        if (!product.net_weight || product.net_weight > maxNW) return false;
      }
      
      return true;
    });
    
    // Natural sort by name
    return filtered.sort((a, b) => {
      const matchA = a.name?.match(/^(.+?)\s*(\d+)$/);
      const matchB = b.name?.match(/^(.+?)\s*(\d+)$/);
      if (matchA && matchB && matchA[1] === matchB[1]) {
        return parseInt(matchA[2], 10) - parseInt(matchB[2], 10);
      }
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [products, filters]);

  const displayedProducts = useMemo(() => filteredProducts.slice(0, displayCount), [filteredProducts, displayCount]);
  const hasMoreProducts = filteredProducts.length > displayCount;
  const totalINR = filteredProducts.reduce((sum, p) => sum + (p.retail_price || 0), 0);
  const totalUSD = totalINR / usdRate;

  const loadMoreProducts = () => setDisplayCount(prev => prev + LOAD_MORE_COUNT);

  const exportToPDF = useCallback(async () => {
    try {
      exportCatalogToPDF(filteredProducts, vendorProfile, usdRate, goldRate, totalINR, totalUSD);
      toast.success("Catalog exported to PDF!");
    } catch (error) {
      toast.error("Failed to export catalog to PDF");
    }
  }, [filteredProducts, vendorProfile, usdRate, goldRate, totalINR, totalUSD]);

  const getCategoryCount = useCallback((category: string) => {
    if (category === 'Jewellery') {
      return products.filter(p => p.product_type === 'Jewellery' || p.product_type === null).length;
    }
    return products.filter(p => p.product_type === category).length;
  }, [products]);

  const handleDeleteSelected = useCallback(async () => {
    setIsDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to delete products");
        return;
      }
      
      const { error } = await supabase
        .from("products")
        .update({ deleted_at: new Date().toISOString() })
        .in("id", Array.from(selectedProducts))
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      toast.success(`${selectedProducts.size} product(s) deleted`);
      setSelectedProducts(new Set());
      setDeleteDialogOpen(false);
      await fetchProducts();
    } catch (error: any) {
      toast.error(`Failed to delete: ${error.message || 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  }, [selectedProducts, fetchProducts]);

  const selectedProductsData = useMemo(() => {
    return products.filter(p => selectedProducts.has(p.id)).map(p => ({ id: p.id, name: p.name, sku: p.sku }));
  }, [products, selectedProducts]);

  const handleBulkUpdate = useCallback(async (updates: Record<string, any>) => {
    if (selectedProducts.size === 0) {
      toast.error("No products selected");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const pricingAdjustment = updates.pricingAdjustment;
      delete updates.pricingAdjustment;

      const formattedUpdates: Record<string, any> = {};
      Object.entries(updates).forEach(([key, value]) => {
        if (value === "" || value === null) return;
        if (['cost_price', 'retail_price', 'weight_grams', 'stock_quantity', 'dispatches_in_days'].includes(key)) {
          const numValue = parseFloat(value as string);
          if (!isNaN(numValue) && numValue >= 0) formattedUpdates[key] = numValue;
        } else if (key === 'purity_fraction_used') {
          const numValue = parseFloat(value as string);
          if (!isNaN(numValue) && numValue >= 0) formattedUpdates[key] = numValue > 1 ? numValue / 100 : numValue;
        } else {
          formattedUpdates[key] = value;
        }
      });

      if (pricingAdjustment && pricingAdjustment.percentage > 0) {
        const { data: currentProducts, error: fetchError } = await supabase
          .from("products")
          .select("id, cost_price, retail_price")
          .in("id", Array.from(selectedProducts))
          .eq("user_id", user.id);

        if (fetchError) throw fetchError;

        if (currentProducts) {
          const updatePromises = currentProducts.map(async (product) => {
            const multiplier = pricingAdjustment.type === 'markup' 
              ? (1 + pricingAdjustment.percentage / 100)
              : (1 - pricingAdjustment.percentage / 100);

            return supabase.from("products").update({
              ...formattedUpdates,
              cost_price: formattedUpdates.cost_price || Math.max(0, product.cost_price * multiplier),
              retail_price: formattedUpdates.retail_price || Math.max(0, product.retail_price * multiplier),
            }).eq("id", product.id).eq("user_id", user.id);
          });

          await Promise.all(updatePromises);
          toast.success(`${selectedProducts.size} product(s) updated`);
        }
      } else {
        if (Object.keys(formattedUpdates).length === 0) {
          toast.error("No changes to update");
          return;
        }

        const { error } = await supabase
          .from("products")
          .update(formattedUpdates)
          .in("id", Array.from(selectedProducts))
          .eq("user_id", user.id);
        
        if (error) throw error;
        toast.success(`${selectedProducts.size} product(s) updated`);
      }
      
      setSelectedProducts(new Set());
      await fetchProducts();
    } catch (error: any) {
      toast.error(`Failed to update: ${error.message || 'Unknown error'}`);
    }
  }, [selectedProducts, fetchProducts]);

  const handleAutoCategorizationClick = () => {
    if (!products || products.length === 0) {
      toast.info("No products found");
      return;
    }
    
    const suggestions = analyzeCatalog(products.map(p => ({ id: p.id, name: p.name, sku: p.sku, category: p.category })));
    if (suggestions.length === 0) {
      toast.info("All products already have categories");
      return;
    }
    
    setCategorySuggestions(suggestions);
    setAutoCategorizationOpen(true);
  };

  const handleApplyCategorization = async (selectedIds: string[]) => {
    try {
      const updatesByCategory = categorySuggestions
        .filter(s => selectedIds.includes(s.productId))
        .reduce((acc, s) => {
          if (!acc[s.suggestedCategory]) acc[s.suggestedCategory] = [];
          acc[s.suggestedCategory].push(s.productId);
          return acc;
        }, {} as Record<string, string[]>);

      for (const [category, productIds] of Object.entries(updatesByCategory)) {
        const { error } = await supabase.from("products").update({ category }).in("id", productIds);
        if (error) throw error;
      }

      toast.success(`Categorized ${selectedIds.length} products!`);
      await fetchProducts();
    } catch (error) {
      toast.error("Failed to apply categorization");
      throw error;
    }
  };
  
  const toggleProductSelection = useCallback((productId: string) => {
    setSelectedProducts(prev => {
      const newSelected = new Set(prev);
      newSelected.has(productId) ? newSelected.delete(productId) : newSelected.add(productId);
      return newSelected;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedProducts(prev => prev.size === products.length ? new Set() : new Set(products.map(p => p.id)));
  }, [products]);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  }, [navigate]);

  return (
    <ApprovalGuard>
      <GoldRateDialog currentGoldRate={goldRate} onUpdate={handleUpdateGoldRate} onSkip={() => {}} />
      <FloatingQRCodes instagramQrUrl={vendorProfile?.instagram_qr_url} whatsappQrUrl={vendorProfile?.whatsapp_qr_url} />
      <QuickActionsMenu onExportPDF={exportToPDF} onAutoCategorize={handleAutoCategorizationClick} />

      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background relative overflow-hidden">
        <Header />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

        {/* Breadcrumb */}
        <div className="relative bg-background/50 backdrop-blur-sm border-b border-border/30 z-10">
          <div className="container mx-auto px-3 md:px-4 py-2 md:py-3">
            <Breadcrumb>
              <BreadcrumbList className="text-sm">
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <NavLink to="/">Home</NavLink>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-xs" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-sm">Catalog</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        {/* Header */}
        <header className="relative border-b border-border/50 bg-card/95 backdrop-blur-xl shadow-xl z-10">
          <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 max-w-[1800px] relative z-10">
            {/* Vendor Details */}
            {vendorProfile && (
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6 mb-4 pb-4 border-b border-border/30">
                <div className="flex items-start gap-3 sm:gap-4 flex-1 w-full lg:w-auto">
                  {vendorProfile.logo_url && (
                    <div className="flex-shrink-0">
                      <img src={vendorProfile.logo_url} alt="Logo" className="w-12 h-12 sm:w-16 sm:h-16 object-contain rounded-lg border border-border/30" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground truncate">
                      {vendorProfile.business_name || "My Catalog"}
                    </h1>
                    {vendorProfile.brand_tagline && (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{vendorProfile.brand_tagline}</p>
                    )}
                  </div>
                </div>
                
                {/* Stats */}
                <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm">
                  <div className="text-center">
                    <div className="font-bold text-foreground">{products.length}</div>
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
                              setUpgradeLimitType('share_links');
                              setIsUpgradeDialogOpen(true);
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
                              setUpgradeLimitType('products');
                              setIsUpgradeDialogOpen(true);
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
                <Button variant="outline" size="sm" onClick={exportToPDF}>
                  <FileDown className="h-4 w-4 mr-2" />Export PDF
                </Button>
                {(permissions.can_manage_team || isAdmin) && (
                  <Button variant="outline" size="sm" onClick={() => navigate("/team")}>
                    <Users className="h-4 w-4 mr-2" />Team
                  </Button>
                )}
                {(permissions.can_delete_products || isAdmin) && selectedProducts.size > 0 && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setBulkEditOpen(true)}>
                      <Edit className="h-4 w-4 mr-2" />Update ({selectedProducts.size})
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
                      <Trash2 className="h-4 w-4 mr-2" />Delete ({selectedProducts.size})
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
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
                            setUpgradeLimitType('share_links');
                            setIsUpgradeDialogOpen(true);
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
                            setUpgradeLimitType('products');
                            setIsUpgradeDialogOpen(true);
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
                    <DropdownMenuItem onClick={exportToPDF} className="py-3">
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
                    <DropdownMenuItem onClick={handleSignOut} className="py-3 text-destructive">
                      <LogOut className="h-5 w-5 mr-3" />Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-10 max-w-[1800px]">
          <div className="mb-6">
            <PlanLimitWarning />
            <PlanUsageBanner />
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="animate-fade-in">
              {/* Category Selector */}
              {approvedCategories.length > 1 && (
                <div className="mb-6 flex gap-2 overflow-x-auto justify-start md:justify-center pb-2 px-2">
                  {approvedCategories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedProductType(category)}
                      disabled={loading}
                      className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                        selectedProductType === category 
                          ? 'bg-primary text-primary-foreground scale-105' 
                          : 'bg-card border border-border hover:bg-muted'
                      }`}
                    >
                      {category} ({getCategoryCount(category)})
                    </button>
                  ))}
                </div>
              )}

              {/* Filters */}
              <CatalogFilters
                filters={filters}
                onFilterChange={setFilters}
                productType={selectedProductType}
                categories={categories}
                metalTypes={metalTypes}
                diamondColors={diamondColors}
                diamondClarities={diamondClarities}
                deliveryTypes={deliveryTypes}
                categoryCounts={categoryCounts}
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

              {/* Select All */}
              {(permissions.can_delete_products || isAdmin) && products.length > 0 && (
                <div className="flex items-center gap-3 mb-4">
                  <Checkbox
                    checked={selectedProducts.size === products.length && products.length > 0}
                    onCheckedChange={toggleSelectAll}
                    id="select-all"
                  />
                  <label htmlFor="select-all" className="text-sm text-muted-foreground cursor-pointer">
                    Select All ({selectedProducts.size}/{products.length})
                  </label>
                </div>
              )}

              {/* Products Grid */}
              {displayedProducts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">💎</div>
                  <h3 className="text-xl font-semibold mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-4">Add your first product to get started</p>
                  {(permissions.can_add_products || isAdmin) && (
                    <Button onClick={() => navigate("/add-product")}>
                      <Plus className="h-4 w-4 mr-2" />Add Product
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
                    {displayedProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isSelected={selectedProducts.has(product.id)}
                        onToggleSelection={toggleProductSelection}
                        usdRate={usdRate}
                      />
                    ))}
                  </div>

                  {/* Load More */}
                  {hasMoreProducts && (
                    <div className="flex justify-center mt-8">
                      <Button variant="outline" size="lg" onClick={loadMoreProducts}>
                        Load More ({filteredProducts.length - displayCount} remaining)
                      </Button>
                    </div>
                  )}

                  {/* Results Summary */}
                  <div className="mt-6 text-center text-sm text-muted-foreground">
                    Showing {displayedProducts.length} of {filteredProducts.length} products
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Dialogs */}
      <UpgradePromptDialog
        open={isUpgradeDialogOpen}
        onOpenChange={setIsUpgradeDialogOpen}
        limitType={upgradeLimitType}
      />
      
      <BulkEditDialog
        open={bulkEditOpen}
        onOpenChange={setBulkEditOpen}
        selectedCount={selectedProducts.size}
        onUpdate={handleBulkUpdate}
        selectedProductIds={Array.from(selectedProducts)}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteSelected}
        isDeleting={isDeleting}
        products={selectedProductsData}
      />

      <AutoCategorizationDialog
        open={autoCategorizationOpen}
        onOpenChange={setAutoCategorizationOpen}
        suggestions={categorySuggestions}
        onApply={handleApplyCategorization}
      />
    </ApprovalGuard>
  );
};

export default Catalog;
