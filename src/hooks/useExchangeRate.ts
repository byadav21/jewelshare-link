import { useState, useEffect, useCallback } from 'react';

/** Session storage key for cached rate */
const CACHE_KEY = 'usd_rate';

/** Session storage key for cache timestamp */
const CACHE_TIME_KEY = 'usd_rate_time';

/** Cache duration in milliseconds (1 hour) */
const CACHE_DURATION = 3600000;

/** Default fallback rate if API fails */
const DEFAULT_RATE = 87.67;

/**
 * Exchange rate hook return type
 */
interface UseExchangeRateReturn {
  /** Current USD to INR exchange rate */
  rate: number;
  /** Whether the rate is being fetched */
  loading: boolean;
  /** Any error that occurred during fetching */
  error: Error | null;
  /** Function to manually refresh the rate */
  refresh: () => Promise<void>;
}

/**
 * Custom hook for fetching and caching USD to INR exchange rate
 * 
 * @description Provides the current USD to INR exchange rate with
 * automatic caching to sessionStorage. Caches for 1 hour to minimize
 * API calls while keeping rates relatively fresh.
 * 
 * @returns Object containing rate, loading state, error, and refresh function
 * 
 * @example
 * ```tsx
 * function PriceDisplay({ priceINR }) {
 *   const { rate, loading, refresh } = useExchangeRate();
 *   
 *   if (loading) return <Skeleton />;
 *   
 *   const priceUSD = priceINR / rate;
 *   
 *   return (
 *     <div>
 *       <p>₹{priceINR.toLocaleString('en-IN')}</p>
 *       <p className="text-muted-foreground">
 *         ${priceUSD.toFixed(2)} USD
 *       </p>
 *       <button onClick={refresh}>Refresh rate</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useExchangeRate = (): UseExchangeRateReturn => {
  const [rate, setRate] = useState<number>(DEFAULT_RATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch exchange rate from API or cache
   */
  const fetchRate = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      // Check cache first (unless forcing refresh)
      if (!forceRefresh) {
        const cachedRate = sessionStorage.getItem(CACHE_KEY);
        const cachedTime = sessionStorage.getItem(CACHE_TIME_KEY);

        if (cachedRate && cachedTime && Date.now() - parseInt(cachedTime) < CACHE_DURATION) {
          setRate(parseFloat(cachedRate));
          setLoading(false);
          return;
        }
      }

      // Fetch fresh rate from API
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const data = await response.json();

      if (data.rates?.INR) {
        const newRate = data.rates.INR;
        setRate(newRate);
        
        // Cache the rate
        sessionStorage.setItem(CACHE_KEY, newRate.toString());
        sessionStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
      } else {
        throw new Error('INR rate not found in API response');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error('Failed to fetch exchange rate');
      console.error('Failed to fetch exchange rate:', errorMessage);
      setError(errorMessage);
      // Keep using cached/default rate on error
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Manual refresh function (bypasses cache)
   */
  const refresh = useCallback(async () => {
    await fetchRate(true);
  }, [fetchRate]);

  // Fetch rate on mount
  useEffect(() => {
    fetchRate();
  }, [fetchRate]);

  return { rate, loading, error, refresh };
};

/**
 * Get cached exchange rate synchronously
 * 
 * @description Retrieves the cached USD to INR rate from sessionStorage
 * without making an API call. Useful for synchronous operations.
 * 
 * @returns The cached rate or default rate if not cached
 * 
 * @example
 * ```ts
 * const rate = getCachedExchangeRate();
 * const quickConversion = inrAmount / rate;
 * ```
 */
export const getCachedExchangeRate = (): number => {
  const cachedRate = sessionStorage.getItem(CACHE_KEY);
  return cachedRate ? parseFloat(cachedRate) : DEFAULT_RATE;
};
