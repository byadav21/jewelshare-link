import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ApprovalGuard } from "@/components/ApprovalGuard";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { CatalogFilters, FilterState } from "@/components/CatalogFilters";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Gem, Plus, LogOut, Share2, FileSpreadsheet, Trash2, Heart, Users, LayoutDashboard, Menu, Building2, Shield, FileDown, Edit, Loader2, X, Upload, Video, ShoppingCart } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useVendorPermissions } from "@/hooks/useVendorPermissions";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { exportCatalogToPDF } from "@/utils/pdfExport";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlanLimitWarning } from "@/components/PlanLimitWarning";
import { PlanUsageBanner } from "@/components/PlanUsageBanner";
import { UpgradePromptDialog } from "@/components/UpgradePromptDialog";
import { PlanUpgradeCelebration } from "@/components/PlanUpgradeCelebration";
import { PlanBenefitsShowcase } from "@/components/PlanBenefitsShowcase";
import { ReferralCelebration } from "@/components/ReferralCelebration";
import { MilestoneCelebration } from "@/components/MilestoneCelebration";
import { RewardsWidget } from "@/components/RewardsWidget";
import { useMilestones } from "@/hooks/useMilestones";
import { useRewardsSystem } from "@/hooks/useRewardsSystem";
import { GoldRateDialog } from "@/components/GoldRateDialog";
import { FloatingQRCodes } from "@/components/FloatingQRCodes";
import { ProductShowcaseCarousel } from "@/components/ProductShowcaseCarousel";
import { QuickActionsMenu } from "@/components/QuickActionsMenu";
import { BrandShowcase } from "@/components/BrandShowcase";
import { BulkEditDialog } from "@/components/BulkEditDialog";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [upgradeLimitType, setUpgradeLimitType] = useState<'products' | 'share_links' | undefined>();
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationPlan, setCelebrationPlan] = useState("");
  const [showBenefits, setShowBenefits] = useState(false);
  const [showReferralCelebration, setShowReferralCelebration] = useState(false);
  const [referralType, setReferralType] = useState<'team_member' | 'customer'>('team_member');
  const [referredName, setReferredName] = useState("");
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Rewards and milestones
  const { awardPoints } = useRewardsSystem();
  const { latestMilestone, clearLatestMilestone } = useMilestones();
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
    lab: ""
  });
  const navigate = useNavigate();
  const {
    isAdmin,
    isTeamMember,
    loading: roleLoading
  } = useUserRole();
  const {
    permissions,
    loading: permissionsLoading
  } = useVendorPermissions();
  const { canAddProducts, canAddShareLinks, productsRemaining, shareLinksRemaining } = usePlanLimits();

  // Load more pagination state
  const [displayCount, setDisplayCount] = useState(100);
  const LOAD_MORE_COUNT = 100;
  
  // Setup real-time listener for plan upgrades
  const setupPlanUpgradeListener = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get current plan to compare
    const { data: currentPermissions } = await supabase
      .from("vendor_permissions")
      .select("subscription_plan")
      .eq("user_id", user.id)
      .single();

    if (!currentPermissions) return;

    // Store current plan in session storage
    const storedPlan = sessionStorage.getItem('current_plan');
    if (!storedPlan) {
      sessionStorage.setItem('current_plan', currentPermissions.subscription_plan);
    }

    // Subscribe to changes
    const channel = supabase
      .channel('plan-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'vendor_permissions',
          filter: `user_id=eq.${user.id}`
        },
        (payload: any) => {
          const newPlan = payload.new.subscription_plan;
          const oldPlan = sessionStorage.getItem('current_plan');
          
          // Plan hierarchy for comparison
          const planLevels: Record<string, number> = {
            'starter': 1,
            'professional': 2,
            'enterprise': 3
          };

          // Check if it's an upgrade
          if (oldPlan && planLevels[newPlan] > planLevels[oldPlan]) {
            // Store new plan
            sessionStorage.setItem('current_plan', newPlan);
            
            // Show celebration
            const planNames: Record<string, string> = {
              'professional': 'Professional Plan',
              'enterprise': 'Enterprise Plan'
            };
            setCelebrationPlan(planNames[newPlan] || newPlan);
            setShowCelebration(true);
            
            // Show benefits after celebration
            setTimeout(() => {
              setShowCelebration(false);
              setShowBenefits(true);
            }, 3500);
            
            // Refresh data to get new limits
            setTimeout(() => {
              window.location.reload();
            }, 8000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  // Setup referral celebration listener
  const setupReferralListener = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Only setup for admins/owners who can see team additions
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roleData || roleData.role !== 'admin') return;

    // Listen for new user approval statuses (new signups)
    const referralChannel = supabase
      .channel('referral-additions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_approval_status',
        },
        async (payload: any) => {
          // Show celebration for new user signups
          if (payload.new.email) {
            setReferredName(payload.new.email.split('@')[0]);
            setReferralType('customer');
            setShowReferralCelebration(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(referralChannel);
    };
  };

  useEffect(() => {
    if (!roleLoading && isAdmin) {
      navigate("/admin");
    }
  }, [isAdmin, roleLoading, navigate]);
  useEffect(() => {
    const cachedRate = sessionStorage.getItem('usd_rate');
    const cachedTime = sessionStorage.getItem('usd_rate_time');
    if (cachedRate && cachedTime && Date.now() - parseInt(cachedTime) < 3600000) {
      setUsdRate(parseFloat(cachedRate));
    } else {
      fetchUSDRate();
    }
    
    // Run all queries in parallel for faster loading
    Promise.all([
      fetchAllProducts(),
      fetchProducts(),
      fetchVendorProfile(),
      fetchApprovedCategories(),
    ]).then(() => {
      // Setup listeners after data is loaded
      setupPlanUpgradeListener();
      setupReferralListener();
    });
  }, []);
  const fetchApprovedCategories = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;
      const {
        data,
        error
      } = await supabase.from("user_approval_status").select("approved_categories").eq("user_id", user.id).single();
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
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;
      const {
        data,
        error
      } = await supabase.from("vendor_profiles").select("*").eq("user_id", user.id).maybeSingle();
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
  const handleUpdateGoldRate = async (newRate: number) => {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) return;
    const {
      error: profileError
    } = await supabase.from("vendor_profiles").update({
      gold_rate_24k_per_gram: newRate,
      gold_rate_updated_at: new Date().toISOString()
    }).eq("user_id", user.id);
    if (profileError) throw profileError;
    const purity = 0.76;
    const updatedProducts = products.filter(p => p.weight_grams).map(product => {
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
      const {
        error
      } = await supabase.from("products").update({
        cost_price: update.cost_price,
        retail_price: update.retail_price
      }).eq("id", update.id);
      if (!error) successCount++;
    }
    setGoldRate(newRate);
    await fetchProducts();
    toast.success(`Gold rate updated to ₹${newRate.toLocaleString('en-IN')}/g and ${successCount} product prices recalculated!`);
  };
  const handleUpdateGoldRateManual = async () => {
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
      await handleUpdateGoldRate(newRate);
      setEditingGoldRate(false);
      setTempGoldRate("");
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
    "DIAMOND GENTS RING",
    "MOISSANITE JEWELLERY",
    "CVD JEWELLERY"
  ];

  // Extract unique filter values and merge with predefined
  const categories = useMemo(() => {
    const productCategories = products.map(p => p.category).filter(Boolean);
    const allCategories = [...new Set([...predefinedCategories, ...productCategories])];
    return allCategories.sort();
  }, [products]);
  
  // Calculate category counts for better UX
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: products.length
    };
    categories.forEach(cat => {
      counts[cat] = products.filter(p => p.category === cat).length;
    });
    return counts;
  }, [products, categories]);
  
  const metalTypes = useMemo(() => [...new Set(products.map(p => p.metal_type).filter(Boolean))].sort(), [products]);
  const diamondColors = useMemo(() => [...new Set(products.map(p => p.gemstone?.split(' ')[0]).filter(Boolean))].sort(), [products]);
  const diamondClarities = useMemo(() => [...new Set(products.map(p => p.gemstone?.split(' ')[1]).filter(Boolean))].sort(), [products]);
  const deliveryTypes = useMemo(() => [...new Set(products.map(p => p.delivery_type).filter(Boolean))].sort(), [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    const filtered = products.filter(product => {
      // Search query - searches across multiple fields
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase().trim();
        const searchableFields = [product.product_type, product.diamond_color, product.d_wt_1?.toString(), product.d_wt_2?.toString(), product.purity_fraction_used?.toString(), product.d_rate_1?.toString(), product.pointer_diamond?.toString(), product.d_value?.toString(), product.mkg?.toString(), product.certification_cost?.toString(), product.gemstone_cost?.toString(), product.total_usd?.toString(), product.name, product.category, product.sku, product.description, product.metal_type, product.gemstone, product.color, product.clarity, product.weight_grams?.toString(), product.diamond_weight?.toString(), product.net_weight?.toString(), product.cost_price?.toString(), product.retail_price?.toString(), product.per_carat_price?.toString(), product.gold_per_gram_price?.toString()].filter(Boolean);
        const matchFound = searchableFields.some(field => field?.toLowerCase().includes(query));
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

  // Display products with load more functionality
  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, displayCount);
  }, [filteredProducts, displayCount]);
  const hasMoreProducts = filteredProducts.length > displayCount;

  // Reset display count when filters change or category changes
  useEffect(() => {
    setDisplayCount(100);
  }, [filters, selectedProductType]);
  const loadMoreProducts = () => {
    setDisplayCount(prev => prev + LOAD_MORE_COUNT);
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
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;
      
      // Optimized: only fetch id and product_type for counting, not all columns
      const {
        data,
        error
      } = await supabase
        .from("products")
        .select("id, product_type")
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
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;
      
      // Optimized query: only fetch needed columns and limit results
      let query = supabase
        .from("products")
        .select("id, name, sku, image_url, image_url_2, image_url_3, cost_price, retail_price, stock_quantity, category, metal_type, gemstone, color, diamond_color, clarity, delivery_type, product_type, weight_grams, gemstone_type, carat_weight, cut, diamond_type, shape, carat, polish, symmetry, fluorescence, lab, created_at")
        .eq("user_id", user.id)
        .is("deleted_at", null);

      // Filter by product type, treating NULL as Jewellery for backward compatibility
      if (selectedProductType === 'Jewellery') {
        query = query.or(`product_type.eq.${selectedProductType},product_type.is.null`);
      } else {
        query = query.eq("product_type", selectedProductType);
      }
      
      const {
        data,
        error
      } = await query
        .order("created_at", { ascending: false });
        
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
      return allProducts.filter(p => p.product_type === 'Jewellery' || p.product_type === null).length;
    }
    return allProducts.filter(p => p.product_type === category).length;
  }, [allProducts]);
  const handleDeleteSelected = useCallback(async () => {
    setIsDeleting(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to delete products");
        return;
      }
      
      // Perform soft delete by setting deleted_at
      const { error } = await supabase
        .from("products")
        .update({ deleted_at: new Date().toISOString() })
        .in("id", Array.from(selectedProducts))
        .eq("user_id", user.id); // Ensure we only update user's own products
      
      if (error) {
        console.error("Delete error:", error);
        throw error;
      }
      
      toast.success(`${selectedProducts.size} product(s) deleted successfully`);
      setSelectedProducts(new Set());
      setDeleteDialogOpen(false);
      
      // Refresh both product lists
      await Promise.all([fetchProducts(), fetchAllProducts()]);
    } catch (error: any) {
      console.error("Failed to delete products:", error);
      toast.error(`Failed to delete: ${error.message || 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  }, [selectedProducts, fetchProducts, fetchAllProducts]);

  // Get selected products data for delete confirmation
  const selectedProductsData = useMemo(() => {
    return products
      .filter(p => selectedProducts.has(p.id))
      .map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku
      }));
  }, [products, selectedProducts]);

  const handleBulkUpdate = useCallback(async (updates: Record<string, any>) => {
    if (selectedProducts.size === 0) {
      toast.error("No products selected");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Handle pricing adjustment separately if present
      const pricingAdjustment = updates.pricingAdjustment;
      delete updates.pricingAdjustment;

      // Convert string values to appropriate types
      const formattedUpdates: Record<string, any> = {};
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value === "" || value === null) return;
        
        // Numeric fields
        if (['cost_price', 'retail_price', 'weight_grams', 'stock_quantity', 'dispatches_in_days'].includes(key)) {
          const numValue = parseFloat(value as string);
          if (!isNaN(numValue) && numValue >= 0) {
            formattedUpdates[key] = numValue;
          }
        } else {
          formattedUpdates[key] = value;
        }
      });

      // Apply percentage-based pricing if specified
      if (pricingAdjustment && pricingAdjustment.percentage > 0) {
        // Fetch current products to calculate new prices
        const { data: currentProducts, error: fetchError } = await supabase
          .from("products")
          .select("id, cost_price, retail_price")
          .in("id", Array.from(selectedProducts))
          .eq("user_id", user.id);

        if (fetchError) throw fetchError;

        if (currentProducts) {
          // Update each product individually with calculated prices
          const updatePromises = currentProducts.map(async (product) => {
            const multiplier = pricingAdjustment.type === 'markup' 
              ? (1 + pricingAdjustment.percentage / 100)
              : (1 - pricingAdjustment.percentage / 100);

            const newCostPrice = Math.max(0, product.cost_price * multiplier);
            const newRetailPrice = Math.max(0, product.retail_price * multiplier);

            // Merge with other updates, but price adjustments take precedence unless fixed prices are set
            const productUpdate = {
              ...formattedUpdates,
              cost_price: formattedUpdates.cost_price || newCostPrice,
              retail_price: formattedUpdates.retail_price || newRetailPrice,
            };

            return supabase
              .from("products")
              .update(productUpdate)
              .eq("id", product.id)
              .eq("user_id", user.id);
          });

          const results = await Promise.all(updatePromises);
          const hasErrors = results.some(r => r.error);
          
          if (hasErrors) {
            throw new Error("Some products failed to update");
          }

          toast.success(`${selectedProducts.size} product(s) updated with ${pricingAdjustment.type} of ${pricingAdjustment.percentage}%`);
        }
      } else {
        // Regular update without pricing adjustment
        if (Object.keys(formattedUpdates).length === 0) {
          toast.error("No changes to update");
          return;
        }

        const { error } = await supabase
          .from("products")
          .update(formattedUpdates)
          .in("id", Array.from(selectedProducts))
          .eq("user_id", user.id);
        
        if (error) {
          console.error("Update error:", error);
          throw error;
        }
        
        toast.success(`${selectedProducts.size} product(s) updated successfully`);
      }
      
      setSelectedProducts(new Set());
      
      // Refresh product lists
      await Promise.all([fetchProducts(), fetchAllProducts()]);
    } catch (error: any) {
      console.error("Failed to update products:", error);
      toast.error(`Failed to update: ${error.message || 'Unknown error'}`);
    }
  }, [selectedProducts, fetchProducts, fetchAllProducts]);
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
    setSelectedProducts(prev => prev.size === products.length ? new Set() : new Set(products.map(p => p.id)));
  }, [products]);
  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  }, [navigate]);
  return <ApprovalGuard>
      {/* Daily Gold Rate Prompt */}
      <GoldRateDialog currentGoldRate={goldRate} onUpdate={handleUpdateGoldRate} onSkip={() => console.log("Gold rate update skipped")} />

      {/* Floating QR Codes */}
      <FloatingQRCodes instagramQrUrl={vendorProfile?.instagram_qr_url} whatsappQrUrl={vendorProfile?.whatsapp_qr_url} />

      {/* Quick Actions Menu */}
      <QuickActionsMenu onExportPDF={exportToPDF} />

      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background relative overflow-hidden">
        {/* Premium Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
        {/* Mobile-Optimized Header */}
        <header className="relative border-b border-border/50 bg-card/95 backdrop-blur-xl shadow-xl z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 max-w-[1800px] relative z-10">
            {/* Vendor Details Section - Enhanced with Logo */}
            {vendorProfile && <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6 mb-4 pb-4 border-b border-border/30">
                {/* Left: Logo & Business Info */}
                <div className="flex items-start gap-3 sm:gap-4 flex-1 w-full lg:w-auto">
                  {/* Brand Logo */}
                  {vendorProfile.logo_url && (
                    <div className="flex-shrink-0 relative group/logo">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl blur-lg group-hover/logo:blur-xl transition-all duration-300" />
                      <div className="relative w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden border-2 border-primary/20 shadow-lg group-hover/logo:border-primary/40 group-hover/logo:scale-105 transition-all duration-300 bg-background">
                        <img 
                          src={vendorProfile.logo_url} 
                          alt={vendorProfile.business_name || "Vendor Logo"} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <Gem className="h-5 w-5 sm:h-6 sm:w-6 text-primary animate-pulse" />
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent leading-tight drop-shadow-sm">
                        {vendorProfile.business_name || "My Jewelry Business"}
                      </h1>
                    </div>
                    {vendorProfile.address_line1 && <div className="text-xs sm:text-sm text-muted-foreground mb-2 leading-relaxed">
                        <span className="block sm:inline">
                          {vendorProfile.address_line1}
                          {vendorProfile.address_line2 && `, ${vendorProfile.address_line2}`}
                        </span>
                        {vendorProfile.city && <span className="block sm:inline sm:ml-2">
                            <span className="hidden sm:inline">• </span>
                            {vendorProfile.city}, {vendorProfile.state} {vendorProfile.pincode}
                          </span>}
                      </div>}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm">
                      {vendorProfile.email && <span className="text-primary/90 font-medium truncate flex items-center gap-1">
                          <span className="opacity-70">Email:</span> {vendorProfile.email}
                        </span>}
                      {vendorProfile.phone && <span className="text-primary/90 font-medium flex items-center gap-1">
                          <span className="opacity-70">Phone:</span> {vendorProfile.phone}
                        </span>}
                      {vendorProfile.whatsapp_number && <span className="text-primary/90 font-medium flex items-center gap-1">
                          <span className="opacity-70">WhatsApp:</span> {vendorProfile.whatsapp_number}
                        </span>}
                    </div>
                  </div>
                </div>

                {/* Right: Rates & Inventory */}
                <div className="flex flex-col items-start lg:items-end gap-3 w-full lg:w-auto">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
                    {/* USD Rate Badge */}
                    <div className="group relative text-xs sm:text-sm bg-gradient-to-br from-muted/90 to-muted/70 px-3 sm:px-4 py-2 rounded-xl border border-border/50 shadow-md hover:shadow-lg transition-all duration-300 backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">1 USD = ₹{usdRate.toFixed(2)}</span>
                        <span className="text-muted-foreground text-xs">• {new Date().toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short'
                      })}</span>
                      </div>
                    </div>
                    
                    {/* Gold Rate Editor/Display */}
                    {editingGoldRate ? <div className="flex items-center gap-2 bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/30 shadow-sm w-full sm:w-auto">
                        <input type="number" value={tempGoldRate} onChange={e => setTempGoldRate(e.target.value)} onKeyDown={e => {
                    if (e.key === 'Enter' && !updatingGoldRate) {
                      handleUpdateGoldRateManual();
                    } else if (e.key === 'Escape' && !updatingGoldRate) {
                      setEditingGoldRate(false);
                      setTempGoldRate("");
                    }
                  }} placeholder={goldRate.toString()} min="1000" max="200000" step="100" disabled={updatingGoldRate} className="w-24 sm:w-32 px-3 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed" autoFocus />
                        <Button size="sm" onClick={handleUpdateGoldRateManual} disabled={updatingGoldRate} className="h-8 px-3 text-xs bg-amber-600 hover:bg-amber-700 disabled:opacity-50">
                          {updatingGoldRate ? <>
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              <span className="hidden sm:inline">Updating...</span>
                            </> : 'Save'}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => {
                    setEditingGoldRate(false);
                    setTempGoldRate("");
                  }} disabled={updatingGoldRate} className="h-8 px-2 text-xs disabled:opacity-50">
                          <X className="h-4 w-4" />
                        </Button>
                      </div> : <button onClick={() => {
                  setEditingGoldRate(true);
                  setTempGoldRate(goldRate.toString());
                }} className="group relative text-xs sm:text-sm bg-gradient-to-br from-amber-500/20 via-amber-600/15 to-amber-500/20 px-3 sm:px-4 py-2 rounded-xl border border-amber-500/40 hover:border-amber-500/60 shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-700 dark:text-amber-400">24K Gold: ₹{goldRate.toLocaleString('en-IN')}/g</span>
                          <Edit className="h-3.5 w-3.5 text-amber-600 dark:text-amber-500 group-hover:rotate-12 transition-transform" />
                        </div>
                      </button>}
                  </div>

                  {/* Total Inventory Card */}
                  {products.length > 0 && <div className="relative flex flex-col items-start lg:items-end gap-1 px-4 sm:px-5 py-3 bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 rounded-xl border border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300 w-full lg:w-auto overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative z-10 text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Inventory Value</div>
                      <div className="relative z-10 text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent drop-shadow-sm">
                        ₹{totalINR.toLocaleString('en-IN', {
                    maximumFractionDigits: 0
                  })}
                      </div>
                      <div className="relative z-10 text-sm sm:text-base text-muted-foreground font-semibold">${totalUSD.toLocaleString('en-US', {
                    maximumFractionDigits: 0
                  })}</div>
                      {filteredProducts.length !== products.length && <div className="relative z-10 text-[10px] sm:text-xs text-muted-foreground mt-1">
                          Showing {filteredProducts.length} of {products.length} products
                        </div>}
                    </div>}
                </div>
              </div>}

            {/* Action Buttons Section */}
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {/* Desktop Menu */}
              <div className="hidden lg:flex items-center flex-wrap gap-2 justify-center">
                {(permissions.can_view_interests || isAdmin) && <Button variant="outline" size="sm" onClick={() => navigate("/interests")}>
                    <Heart className="h-4 w-4 mr-2" />
                    Interests
                  </Button>}
                {(permissions.can_view_interests || isAdmin) && <Button variant="outline" size="sm" onClick={() => navigate("/video-requests")}>
                    <Video className="h-4 w-4 mr-2" />
                    Video Requests
                  </Button>}
                {(permissions.can_edit_profile || isAdmin) && <Button variant="outline" size="sm" onClick={() => navigate("/vendor-profile")}>
                    <Building2 className="h-4 w-4 mr-2" />
                    Profile
                  </Button>}
                {(permissions.can_share_catalog || isAdmin) && <TooltipProvider>
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
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                          {!isAdmin && shareLinksRemaining !== Infinity && shareLinksRemaining < 100 && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              ({shareLinksRemaining} left)
                            </span>
                          )}
                        </Button>
                      </TooltipTrigger>
                      {!canAddShareLinks && !isAdmin && (
                        <TooltipContent>
                          <p>Share link limit reached</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>}
                {isAdmin && <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Admin
                  </Button>}
                {(permissions.can_add_products || isAdmin) && <TooltipProvider>
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
                          <Plus className="h-4 w-4 mr-2" />
                          Add
                          {!isAdmin && productsRemaining !== Infinity && productsRemaining < 100 && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              ({productsRemaining} left)
                            </span>
                          )}
                        </Button>
                      </TooltipTrigger>
                      {!canAddProducts && !isAdmin && (
                        <TooltipContent>
                          <p>Product limit reached</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>}
                {(permissions.can_import_data || isAdmin) && <Button variant="outline" size="sm" onClick={() => navigate("/import")}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Import
                  </Button>}
                  <Button variant="outline" size="sm" onClick={exportToPDF}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate("/migrate-images")}>
                    <Upload className="h-4 w-4 mr-2" />
                    Migrate Images
                  </Button>
                  {(permissions.can_manage_team || isAdmin) && <Button variant="outline" size="sm" onClick={() => navigate("/team")}>
                      <Users className="h-4 w-4 mr-2" />
                      Team
                    </Button>}
                {(permissions.can_delete_products || isAdmin) && selectedProducts.size > 0 && <>
                    <Button variant="outline" size="sm" onClick={() => setBulkEditOpen(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Update ({selectedProducts.size})
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete ({selectedProducts.size})
                    </Button>
                  </>}
                {(permissions.can_view_sessions || isAdmin) && <Button variant="outline" size="sm" onClick={() => navigate("/active-sessions")}>
                    <Shield className="h-4 w-4 mr-2" />
                    Sessions
                  </Button>}
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
                    {(permissions.can_view_interests || isAdmin) && <DropdownMenuItem onClick={() => navigate("/interests")} className="py-3 cursor-pointer hover:bg-muted/50">
                        <Heart className="h-5 w-5 mr-3 text-primary" />
                        <span className="font-medium">View Interests</span>
                      </DropdownMenuItem>}
                    {(permissions.can_view_interests || isAdmin) && <DropdownMenuItem onClick={() => navigate("/video-requests")} className="py-3 cursor-pointer hover:bg-muted/50">
                        <Video className="h-5 w-5 mr-3 text-primary" />
                        <span className="font-medium">Video Requests</span>
                      </DropdownMenuItem>}
                    {(permissions.can_view_interests || isAdmin) && <DropdownMenuItem onClick={() => navigate("/purchase-inquiries")} className="py-3 cursor-pointer hover:bg-muted/50">
                        <ShoppingCart className="h-5 w-5 mr-3 text-primary" />
                        <span className="font-medium">Purchase Inquiries</span>
                      </DropdownMenuItem>}
                    {(permissions.can_edit_profile || isAdmin) && <DropdownMenuItem onClick={() => navigate("/vendor-profile")} className="py-3 cursor-pointer hover:bg-muted/50">
                        <Building2 className="h-5 w-5 mr-3 text-primary" />
                        <span className="font-medium">Vendor Profile</span>
                      </DropdownMenuItem>}
                    {(permissions.can_share_catalog || isAdmin) && <DropdownMenuItem 
                        onClick={() => {
                          if (!canAddShareLinks && !isAdmin) {
                            setUpgradeLimitType('share_links');
                            setIsUpgradeDialogOpen(true);
                            return;
                          }
                          navigate("/share");
                        }}
                        disabled={!canAddShareLinks && !isAdmin}
                        className="py-3 cursor-pointer hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Share2 className="h-5 w-5 mr-3 text-primary" />
                        <span className="font-medium">Share Catalog</span>
                        {!isAdmin && shareLinksRemaining !== Infinity && shareLinksRemaining < 100 && (
                          <span className="ml-auto text-xs text-muted-foreground">
                            ({shareLinksRemaining} left)
                          </span>
                        )}
                        {!canAddShareLinks && !isAdmin && <span className="ml-auto text-xs text-destructive">(Limit reached)</span>}
                      </DropdownMenuItem>}
                    {isAdmin && <>
                        <DropdownMenuSeparator className="my-2" />
                        <DropdownMenuItem onClick={() => navigate("/admin")} className="py-3 cursor-pointer hover:bg-muted/50">
                          <LayoutDashboard className="h-5 w-5 mr-3 text-primary" />
                          <span className="font-medium">Admin Dashboard</span>
                        </DropdownMenuItem>
                      </>}
                    <DropdownMenuSeparator className="my-2" />
                    {(permissions.can_add_products || isAdmin) && <DropdownMenuItem 
                        onClick={() => {
                          if (!canAddProducts && !isAdmin) {
                            setUpgradeLimitType('products');
                            setIsUpgradeDialogOpen(true);
                            return;
                          }
                          navigate("/add-product");
                        }}
                        disabled={!canAddProducts && !isAdmin}
                        className="py-3 cursor-pointer hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-5 w-5 mr-3 text-primary" />
                        <span className="font-medium">Add Product</span>
                        {!isAdmin && productsRemaining !== Infinity && productsRemaining < 100 && (
                          <span className="ml-auto text-xs text-muted-foreground">
                            ({productsRemaining} left)
                          </span>
                        )}
                        {!canAddProducts && !isAdmin && <span className="ml-auto text-xs text-destructive">(Limit reached)</span>}
                      </DropdownMenuItem>}
                    {(permissions.can_import_data || isAdmin) && <DropdownMenuItem onClick={() => navigate("/import")} className="py-3 cursor-pointer hover:bg-muted/50">
                        <FileSpreadsheet className="h-5 w-5 mr-3 text-primary" />
                        <span className="font-medium">Import Data</span>
                      </DropdownMenuItem>}
                    <DropdownMenuItem onClick={exportToPDF} className="py-3 cursor-pointer hover:bg-muted/50">
                      <FileDown className="h-5 w-5 mr-3 text-primary" />
                      <span className="font-medium">Export PDF</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/migrate-images")} className="py-3 cursor-pointer hover:bg-muted/50">
                      <Upload className="h-5 w-5 mr-3 text-primary" />
                      <span className="font-medium">Migrate Images</span>
                    </DropdownMenuItem>
                    {(permissions.can_manage_team || isAdmin) && <DropdownMenuItem onClick={() => navigate("/team")} className="py-3 cursor-pointer hover:bg-muted/50">
                        <Users className="h-5 w-5 mr-3 text-primary" />
                        <span className="font-medium">Manage Team</span>
                      </DropdownMenuItem>}
                    <DropdownMenuSeparator className="my-2" />
                    {(permissions.can_view_sessions || isAdmin) && <DropdownMenuItem onClick={() => navigate("/active-sessions")} className="py-3 cursor-pointer hover:bg-muted/50">
                        <Shield className="h-5 w-5 mr-3 text-primary" />
                        <span className="font-medium">Active Sessions</span>
                      </DropdownMenuItem>}
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
          {/* Plan Limit Warning */}
          <div className="mb-6">
            <PlanLimitWarning />
            <PlanUsageBanner />
          </div>
          
          {/* Rewards Widget */}
          <div className="mb-6">
            <RewardsWidget />
          </div>
          {loading ? <div className="space-y-8 animate-fade-in">
              {/* Loading Skeletons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
                {Array.from({
              length: 10
            }).map((_, index) => <div key={index} className="animate-scale-in" style={{
              animationDelay: `${index * 50}ms`
            }}>
                    <ProductCardSkeleton />
                  </div>)}
              </div>
            </div> : <div className="animate-fade-in">
              {/* Elegant Category Selector - Always visible */}
              {approvedCategories.length > 1 && <div className="mb-6 flex gap-2 overflow-x-auto justify-start md:justify-center pb-2 px-2 scrollbar-hide">
                  {approvedCategories.map(category => {
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
              return <button key={category} onClick={() => setSelectedProductType(category)} disabled={transitioning} className={`
                          group relative overflow-hidden flex-shrink-0
                          px-3 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl
                          font-serif text-sm sm:text-base md:text-lg font-semibold
                          transition-all duration-500 ease-out
                          disabled:opacity-50 disabled:cursor-wait
                          ${isSelected ? `bg-gradient-to-br ${style.gradient} border-2 ${style.border} ${style.glow} scale-105` : 'bg-card/50 border-2 border-border/30 hover:border-border/60 hover:scale-102'}
                        `}>
                        {/* Animated background shine effect */}
                        <div className={`
                          absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
                          -translate-x-full group-hover:translate-x-full
                          transition-transform duration-1000 ease-out
                        `} />
                        
                        {/* Content */}
                        <span className={`
                          relative flex items-center gap-2 sm:gap-2.5 md:gap-3
                          ${isSelected ? style.text : 'text-muted-foreground group-hover:text-foreground'}
                          transition-colors duration-300
                        `}>
                          <span className="text-lg sm:text-xl md:text-2xl">{style.icon}</span>
                          <div className="flex flex-col items-start">
                            <span className="tracking-wide whitespace-nowrap">{category}</span>
                            <span className={`
                              text-[10px] sm:text-xs font-normal opacity-70
                              ${isSelected ? '' : 'text-muted-foreground/60'}
                            `}>
                              {count} {count === 1 ? 'item' : 'items'}
                            </span>
                          </div>
                        </span>
                        
                        {/* Bottom accent line for selected state */}
                        {isSelected && <div className={`
                            absolute bottom-0 left-1/2 -translate-x-1/2
                            h-1 w-3/4 rounded-full
                            bg-gradient-to-r ${style.gradient}
                            animate-pulse
                          `} />}
                      </button>;
            })}
                </div>}

              {/* Product Showcase Carousel */}
              {filteredProducts.length > 0 && <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.2
          }} className="mb-8">
                  <ProductShowcaseCarousel products={filteredProducts} usdRate={usdRate} />
                </motion.div>}

              {products.length === 0 ? <div className="text-center py-16 sm:py-20">
                  <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/10 mb-6">
                    <Gem className="h-10 w-10 sm:h-12 sm:h-12 text-primary" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-3 text-foreground">No products yet</h2>
                  <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-md mx-auto">Start building your stunning jewelry catalog and showcase your collection</p>
                  <Button 
                    onClick={() => {
                      if (!canAddProducts && !isAdmin) {
                        setUpgradeLimitType('products');
                        setIsUpgradeDialogOpen(true);
                        return;
                      }
                      navigate("/add-product");
                    }}
                    disabled={!canAddProducts && !isAdmin}
                    size="lg" 
                    className="shadow-lg hover:shadow-xl transition-all duration-300 h-12 px-8"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Your First Product
                  </Button>
                </div> : <>

              {/* Filters - Always visible, not affected by transition */}
              <div key={`filters-${selectedProductType}`} className="mb-6 sm:mb-8 animate-slide-in-right">
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
              </div>

              {/* Select All Checkbox */}
              {(permissions.can_delete_products || isAdmin) && filteredProducts.length > 0 && <div className="mb-6 flex items-center gap-3 pb-4 border-b border-border/30">
                  <Checkbox id="select-all" checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0} onCheckedChange={toggleSelectAll} className="h-5 w-5" />
                  <label htmlFor="select-all" className="text-sm sm:text-base font-medium cursor-pointer select-none">
                    Select All ({filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'})
                  </label>
                </div>}

              {/* Products Grid or Empty State */}
              {filteredProducts.length === 0 ? <div className="text-center py-16 sm:py-20">
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted/50 mb-6">
                    <Gem className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-foreground">No products match your filters</h3>
                  <p className="text-muted-foreground mb-6">Try adjusting your search criteria</p>
                  <Button variant="outline" onClick={() => setFilters({
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
                lab: ""
              })} className="shadow-sm hover:shadow-md transition-all">
                    Clear All Filters
                  </Button>
                </div> : <>
                  <div key={selectedProductType} className={`
                      grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6
                      transition-opacity duration-300
                      ${transitioning ? 'opacity-0' : 'opacity-100 animate-fade-in'}
                    `}>
                    {displayedProducts.map((product, index) => <div key={product.id} className="animate-scale-in" style={{
                  animationDelay: `${index * 30}ms`
                }}>
                        <ProductCard 
                          product={product} 
                          isSelected={selectedProducts.has(product.id)} 
                          onToggleSelection={permissions.can_delete_products || isAdmin ? toggleProductSelection : () => {}} 
                          usdRate={usdRate}
                          vendorLogoUrl={vendorProfile?.logo_url}
                        />
                      </div>)}
                  </div>
                  
                  {/* Load More Button */}
                  {hasMoreProducts && <motion.div initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} className="mt-12 flex justify-center">
                      <Button onClick={loadMoreProducts} size="lg" className="px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all">
                        Load More Products
                        <span className="ml-2 text-sm opacity-75">
                          ({filteredProducts.length - displayCount} remaining)
                        </span>
                      </Button>
                    </motion.div>}
                  
                  {/* Product count info */}
                  <div className="mt-6 text-center text-sm text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{Math.min(displayCount, filteredProducts.length)}</span> of{' '}
                    <span className="font-semibold text-foreground">{filteredProducts.length}</span> products
                  </div>
                  
                  {/* Brand Showcase Section */}
                  <BrandShowcase vendorProfile={vendorProfile} />
                </>}
            </>}
        </div>}
    </main>
      </div>
      
      <UpgradePromptDialog
        open={isUpgradeDialogOpen}
        onOpenChange={setIsUpgradeDialogOpen}
        limitType={upgradeLimitType}
      />
      
      <PlanUpgradeCelebration
        open={showCelebration}
        onOpenChange={setShowCelebration}
        planName={celebrationPlan}
      />
      
      <PlanBenefitsShowcase
        open={showBenefits}
        onOpenChange={setShowBenefits}
        planName={celebrationPlan}
        benefits={
          celebrationPlan === "Professional Plan" ? [
            {
              title: "1,000 Products",
              description: "Expand your catalog with up to 1,000 products"
            },
            {
              title: "10 Share Links",
              description: "Create up to 10 shareable catalog links"
            },
            {
              title: "3 Team Members",
              description: "Invite up to 3 team members to collaborate"
            },
            {
              title: "Unlimited Product Images",
              description: "Add as many images as you need to showcase your products"
            },
            {
              title: "Custom Orders Management",
              description: "Manage custom order requests from customers"
            },
            {
              title: "Data Import Tools",
              description: "Easily import your product data from Excel files"
            }
          ] : [
            {
              title: "Unlimited Products",
              description: "No limits on the number of products you can add"
            },
            {
              title: "Unlimited Share Links",
              description: "Create as many shareable catalog links as you need"
            },
            {
              title: "Unlimited Team Members",
              description: "Invite unlimited team members to collaborate"
            },
            {
              title: "Advanced Analytics",
              description: "Detailed insights into your catalog performance"
            },
            {
              title: "Priority Support",
              description: "Get dedicated support from our team"
            },
            {
              title: "Custom Integrations",
              description: "Connect with your existing business tools"
            }
          ]
        }
      />
      
      <ReferralCelebration
        open={showReferralCelebration}
        onOpenChange={setShowReferralCelebration}
        referralType={referralType}
        referredName={referredName}
      />
      
      <MilestoneCelebration
        open={!!latestMilestone}
        onOpenChange={(open) => !open && clearLatestMilestone()}
        milestoneType={latestMilestone?.milestone_type || ''}
        milestoneValue={latestMilestone?.milestone_value || 0}
        pointsAwarded={latestMilestone?.points_awarded || 0}
      />
      
      <BulkEditDialog
        open={bulkEditOpen}
        onOpenChange={setBulkEditOpen}
        onUpdate={handleBulkUpdate}
        selectedCount={selectedProducts.size}
        selectedProductIds={Array.from(selectedProducts)}
      />
      
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteSelected}
        products={selectedProductsData}
        isDeleting={isDeleting}
      />
    </ApprovalGuard>;
};
export default Catalog;