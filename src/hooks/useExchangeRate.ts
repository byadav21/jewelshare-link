import { useState, useEffect } from 'react';

const CACHE_KEY = 'usd_rate';
const CACHE_TIME_KEY = 'usd_rate_time';
const CACHE_DURATION = 3600000; // 1 hour

export const useExchangeRate = () => {
  const [rate, setRate] = useState<number>(87.67);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRate = async () => {
      // Check cache first
      const cachedRate = sessionStorage.getItem(CACHE_KEY);
      const cachedTime = sessionStorage.getItem(CACHE_TIME_KEY);
      
      if (cachedRate && cachedTime && Date.now() - parseInt(cachedTime) < CACHE_DURATION) {
        setRate(parseFloat(cachedRate));
        setLoading(false);
        return;
      }

      // Fetch fresh rate
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        
        if (data.rates?.INR) {
          const newRate = data.rates.INR;
          setRate(newRate);
          sessionStorage.setItem(CACHE_KEY, newRate.toString());
          sessionStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
        }
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRate();
  }, []);

  return { rate, loading };
};
