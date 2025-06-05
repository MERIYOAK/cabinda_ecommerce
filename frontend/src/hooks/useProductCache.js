import { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config/api';

const CACHE_KEY = 'productCache';
const CACHE_TIMESTAMP_KEY = 'productCacheTimestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useProductCache = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAndCacheProducts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/api/products`);
      const products = response.data.products || [];
      
      // Store products and timestamp in localStorage
      localStorage.setItem(CACHE_KEY, JSON.stringify(products));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
      
      setIsLoading(false);
      return products;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  };

  const getProductsByCategory = (category) => {
    const cachedProducts = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
    if (!category) return cachedProducts;
    return cachedProducts.filter(product => product.category === category);
  };

  const isCacheValid = () => {
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (!timestamp) return false;
    
    const age = Date.now() - parseInt(timestamp);
    return age < CACHE_DURATION;
  };

  const initializeCache = async () => {
    if (!isCacheValid()) {
      await fetchAndCacheProducts();
    } else {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    getProductsByCategory,
    fetchAndCacheProducts,
    initializeCache
  };
}; 