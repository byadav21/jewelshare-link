// Currency conversion utility using ExchangeRate-API
const EXCHANGE_RATE_API = 'https://api.exchangerate-api.com/v4/latest/INR';

let cachedRate: number | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

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
    return parseFloat((inrAmount * 0.012).toFixed(2));
  } catch (error) {
    console.error('Currency conversion error:', error);
    // Fallback rate (approximate)
    return parseFloat((inrAmount * 0.012).toFixed(2));
  }
};

export const getCachedUSDRate = (): number => {
  return cachedRate || 0.012; // Fallback approximate rate
};
