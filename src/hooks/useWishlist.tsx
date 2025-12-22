import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Generate or retrieve a persistent session ID for anonymous users
 * 
 * @description Creates a unique session ID stored in localStorage that
 * persists across browser sessions. Used to identify wishlists for
 * users who haven't logged in.
 * 
 * @returns The session ID string (UUID format)
 */
const getSessionId = (): string => {
  let sessionId = localStorage.getItem('wishlist_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('wishlist_session_id', sessionId);
  }
  return sessionId;
};

/**
 * Wishlist hook return type
 */
interface UseWishlistReturn {
  /** The current wishlist's database ID */
  wishlistId: string | null;
  /** Array of product IDs in the wishlist */
  wishlistItems: string[];
  /** Whether the wishlist is being loaded */
  loading: boolean;
  /** Add a product to the wishlist */
  addToWishlist: (productId: string, shareLinkId?: string) => Promise<boolean>;
  /** Remove a product from the wishlist */
  removeFromWishlist: (productId: string) => Promise<boolean>;
  /** Check if a product is in the wishlist */
  isInWishlist: (productId: string) => boolean;
  /** Toggle a product's wishlist status */
  toggleWishlist: (productId: string, shareLinkId?: string) => Promise<boolean>;
  /** Number of items in the wishlist */
  itemCount: number;
}

/**
 * Custom hook for managing user wishlists
 * 
 * @description Provides wishlist functionality for both authenticated users
 * and anonymous users (via session ID). Handles wishlist creation,
 * item management, and persistence to the database.
 * 
 * @returns Object containing wishlist state and management functions
 * 
 * @example
 * ```tsx
 * function ProductCard({ product, shareLinkId }) {
 *   const { isInWishlist, toggleWishlist, loading } = useWishlist();
 *   
 *   return (
 *     <div>
 *       <h3>{product.name}</h3>
 *       <button 
 *         onClick={() => toggleWishlist(product.id, shareLinkId)}
 *         disabled={loading}
 *       >
 *         {isInWishlist(product.id) ? '❤️' : '🤍'}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useWishlist = (): UseWishlistReturn => {
  const [wishlistId, setWishlistId] = useState<string | null>(null);
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Initialize or fetch the user's wishlist
   */
  const initializeWishlist = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = user ? null : getSessionId();

      // Try to find existing wishlist
      let query = supabase.from('wishlists').select('id, wishlist_items(product_id)');

      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        query = query.eq('session_id', sessionId);
      }

      const { data: wishlists, error } = await query.maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching wishlist:', error);
        setLoading(false);
        return;
      }

      if (wishlists) {
        setWishlistId(wishlists.id);
        setWishlistItems(wishlists.wishlist_items?.map((item: any) => item.product_id) || []);
      } else {
        // Create new wishlist
        const { data: newWishlist, error: createError } = await supabase
          .from('wishlists')
          .insert({
            user_id: user?.id || null,
            session_id: sessionId,
            name: 'My Wishlist'
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating wishlist:', createError);
        } else if (newWishlist) {
          setWishlistId(newWishlist.id);
        }
      }
    } catch (err) {
      console.error('Error initializing wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize wishlist on mount
  useEffect(() => {
    initializeWishlist();
  }, [initializeWishlist]);

  /**
   * Add a product to the wishlist
   * 
   * @param productId - The ID of the product to add
   * @param shareLinkId - Optional share link ID for tracking
   * @returns Promise resolving to success status
   */
  const addToWishlist = useCallback(async (productId: string, shareLinkId?: string): Promise<boolean> => {
    if (!wishlistId) {
      toast.error('Wishlist not initialized');
      return false;
    }

    try {
      const { error } = await supabase.from('wishlist_items').insert({
        wishlist_id: wishlistId,
        product_id: productId,
        share_link_id: shareLinkId || null
      });

      if (error) {
        if (error.code === '23505') {
          toast.info('Product already in wishlist');
          return false;
        }
        throw error;
      }

      setWishlistItems(prev => [...prev, productId]);
      toast.success('Added to wishlist!');
      return true;
    } catch (err: any) {
      console.error('Error adding to wishlist:', err);
      toast.error('Failed to add to wishlist');
      return false;
    }
  }, [wishlistId]);

  /**
   * Remove a product from the wishlist
   * 
   * @param productId - The ID of the product to remove
   * @returns Promise resolving to success status
   */
  const removeFromWishlist = useCallback(async (productId: string): Promise<boolean> => {
    if (!wishlistId) return false;

    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('wishlist_id', wishlistId)
        .eq('product_id', productId);

      if (error) throw error;

      setWishlistItems(prev => prev.filter(id => id !== productId));
      toast.success('Removed from wishlist');
      return true;
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      toast.error('Failed to remove from wishlist');
      return false;
    }
  }, [wishlistId]);

  /**
   * Check if a product is in the wishlist
   * 
   * @param productId - The ID of the product to check
   * @returns Boolean indicating if the product is in the wishlist
   */
  const isInWishlist = useCallback((productId: string): boolean => {
    return wishlistItems.includes(productId);
  }, [wishlistItems]);

  /**
   * Toggle a product's wishlist status
   * 
   * @description Adds the product if not in wishlist, removes if already present
   * 
   * @param productId - The ID of the product to toggle
   * @param shareLinkId - Optional share link ID for tracking (used when adding)
   * @returns Promise resolving to success status
   */
  const toggleWishlist = useCallback(async (productId: string, shareLinkId?: string): Promise<boolean> => {
    if (isInWishlist(productId)) {
      return removeFromWishlist(productId);
    }
    return addToWishlist(productId, shareLinkId);
  }, [isInWishlist, addToWishlist, removeFromWishlist]);

  return {
    wishlistId,
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    itemCount: wishlistItems.length
  };
};
