import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

let cachedUser: User | null = null;
let cacheTime = 0;
const CACHE_TTL = 30000; // 30 seconds

/**
 * Get the current user with short-term caching to avoid repeated auth calls
 * Use this in hooks that all need the current user to reduce API calls
 */
export const getCachedUser = async (): Promise<User | null> => {
  const now = Date.now();
  
  // Return cached user if still valid
  if (cachedUser && (now - cacheTime) < CACHE_TTL) {
    return cachedUser;
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  cachedUser = user;
  cacheTime = now;
  
  return user;
};

/**
 * Clear the user cache - call this on logout
 */
export const clearUserCache = () => {
  cachedUser = null;
  cacheTime = 0;
};

// Listen for auth state changes to invalidate cache
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') {
    clearUserCache();
  } else if (event === 'SIGNED_IN') {
    clearUserCache(); // Force refresh on sign in
  }
});
