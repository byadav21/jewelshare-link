import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Generate or retrieve session ID for anonymous users
const getSessionId = () => {
  let sessionId = localStorage.getItem('wishlist_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('wishlist_session_id', sessionId);
  }
  return sessionId;
};

export const useWishlist = () => {
  const [wishlistId, setWishlistId] = useState<string | null>(null);
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeWishlist();
  }, []);

  const initializeWishlist = async () => {
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
  };

  const addToWishlist = async (productId: string, shareLinkId?: string) => {
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
  };

  const removeFromWishlist = async (productId: string) => {
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
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.includes(productId);
  };

  return {
    wishlistId,
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    itemCount: wishlistItems.length
  };
};
