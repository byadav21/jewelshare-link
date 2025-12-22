/**
 * Currency Conversion Utilities
 * 
 * @description Provides functions for converting between currencies,
 * with built-in caching to minimize API calls. Uses the ExchangeRate-API
 * for live rates with fallback values.
 * 
 * @module currencyConversion
 */

/** API endpoint for fetching exchange rates */
const EXCHANGE_RATE_API = 'https://api.exchangerate-api.com/v4/latest/INR';

/** Cached exchange rate value */
let cachedRate: number | null = null;

/** Timestamp of when the rate was cached */
let cacheTimestamp: number = 0;

/** Cache duration in milliseconds (1 hour) */
const CACHE_DURATION = 3600000;

/** Fallback USD/INR rate when API is unavailable */
const FALLBACK_RATE = 0.012;

/**
 * Convert Indian Rupees to US Dollars
 * 
 * @description Converts an INR amount to USD using live exchange rates.
 * Caches the exchange rate for 1 hour to minimize API calls.
 * Falls back to an approximate rate if the API is unavailable.
 * 
 * @param inrAmount - The amount in Indian Rupees to convert
 * @returns Promise resolving to the USD amount (rounded to 2 decimal places)
 * 
 * @example
 * ```ts
 * const usd = await convertINRtoUSD(10000);
 * console.log(`₹10,000 = $${usd}`); // e.g., "₹10,000 = $120.00"
 * ```
 * 
 * @throws Never throws - returns fallback conversion on error
 */
export const convertINRtoUSD = async (inrAmount: number): Promise<number> => {
  try {
    // Check if we have a valid cached rate
    const now = Date.now();
    if (cachedRate && (now - cacheTimestamp) < CACHE_DURATION) {
      return parseFloat((inrAmount * cachedRate).toFixed(2));
    }

    // Fetch new rate
    const response = await fetch(EXCHANGE_RATE_API);
    const data = await response.json();

    if (data.rates && data.rates.USD) {
      cachedRate = data.rates.USD;
      cacheTimestamp = now;
      return parseFloat((inrAmount * cachedRate).toFixed(2));
    }

    // Fallback to approximate rate if API fails
    console.warn('Currency API failed, using fallback rate');
    return parseFloat((inrAmount * FALLBACK_RATE).toFixed(2));
  } catch (error) {
    console.error('Currency conversion error:', error);
    // Fallback rate (approximate)
    return parseFloat((inrAmount * FALLBACK_RATE).toFixed(2));
  }
};

/**
 * Get the cached USD rate
 * 
 * @description Returns the currently cached INR to USD exchange rate.
 * Useful for synchronous operations where you can't await a fresh rate.
 * 
 * @returns The cached exchange rate or the fallback rate if not cached
 * 
 * @example
 * ```ts
 * const rate = getCachedUSDRate();
 * const quickEstimate = inrAmount * rate;
 * ```
 */
export const getCachedUSDRate = (): number => {
  return cachedRate || FALLBACK_RATE;
};

/**
 * Clear the cached exchange rate
 * 
 * @description Forces a fresh rate fetch on the next conversion.
 * Useful when you know the cached rate is stale.
 * 
 * @example
 * ```ts
 * clearCachedRate();
 * const freshUsd = await convertINRtoUSD(10000);
 * ```
 */
export const clearCachedRate = (): void => {
  cachedRate = null;
  cacheTimestamp = 0;
};

/**
 * Convert US Dollars to Indian Rupees
 * 
 * @description Converts a USD amount to INR using live exchange rates.
 * Uses the inverse of the INR to USD rate.
 * 
 * @param usdAmount - The amount in US Dollars to convert
 * @returns Promise resolving to the INR amount (rounded to 2 decimal places)
 * 
 * @example
 * ```ts
 * const inr = await convertUSDtoINR(100);
 * console.log(`$100 = ₹${inr}`); // e.g., "$100 = ₹8,333.33"
 * ```
 */
export const convertUSDtoINR = async (usdAmount: number): Promise<number> => {
  try {
    const now = Date.now();
    
    // Use cached rate if available
    if (cachedRate && (now - cacheTimestamp) < CACHE_DURATION) {
      return parseFloat((usdAmount / cachedRate).toFixed(2));
    }

    // Fetch new rate
    const response = await fetch(EXCHANGE_RATE_API);
    const data = await response.json();

    if (data.rates && data.rates.USD) {
      cachedRate = data.rates.USD;
      cacheTimestamp = now;
      return parseFloat((usdAmount / cachedRate).toFixed(2));
    }

    console.warn('Currency API failed, using fallback rate');
    return parseFloat((usdAmount / FALLBACK_RATE).toFixed(2));
  } catch (error) {
    console.error('Currency conversion error:', error);
    return parseFloat((usdAmount / FALLBACK_RATE).toFixed(2));
  }
};

/**
 * Format amount with currency symbol
 * 
 * @description Formats a number as a currency string with proper
 * locale formatting and currency symbol.
 * 
 * @param amount - The amount to format
 * @param currency - The currency code ('INR' or 'USD')
 * @param locale - The locale for formatting (default: 'en-IN' for INR, 'en-US' for USD)
 * @returns Formatted currency string
 * 
 * @example
 * ```ts
 * formatCurrency(100000, 'INR');  // "₹1,00,000"
 * formatCurrency(1500.50, 'USD'); // "$1,500.50"
 * ```
 */
export const formatCurrency = (
  amount: number,
  currency: 'INR' | 'USD',
  locale?: string
): string => {
  const defaultLocale = currency === 'INR' ? 'en-IN' : 'en-US';
  const formatLocale = locale || defaultLocale;
  
  return new Intl.NumberFormat(formatLocale, {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'INR' ? 0 : 2,
    maximumFractionDigits: 2
  }).format(amount);
};
