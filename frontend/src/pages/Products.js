import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaFilter, FaSearch, FaChevronDown, FaWhatsapp } from 'react-icons/fa';
import axios from 'axios';
import API_URL from '../config/api';
import './Products.css';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTranslation } from 'react-i18next';

// Memoized ProductCard component to prevent unnecessary re-renders
const WHATSAPP_NUMBER = '244922706107'; // Updated WhatsApp number for client requests
const MAX_DESCRIPTION_LENGTH = 'Natural fruit juice made from fresh tropical fruits. No added sugars.'.length;

const ProductCard = memo(({ product }) => {
  const { t, i18n } = useTranslation();
  
  // Helper function to safely get product name
  const getProductName = (product) => {
    if (typeof product.name === 'string') {
      // Old structure - name is a string
      return product.name;
    } else if (product.name && typeof product.name === 'object') {
      // New structure - name is an object with pt/en
      return product.name[i18n.language] || product.name.en || product.name.pt || '';
    }
    return '';
  };

  // Helper function to safely get product description
  const getProductDescription = (product) => {
    if (typeof product.description === 'string') {
      // Old structure - description is a string
      return product.description;
    } else if (product.description && typeof product.description === 'object') {
      // New structure - description is an object with pt/en
      return product.description[i18n.language] || product.description.en || product.description.pt || '';
    }
    return '';
  };

  // Helper function to translate category names
  const getTranslatedCategory = (category) => {
    // Map category names to their translation keys
    const categoryMap = {
      'Foodstuffs': 'foodstuffs',
      'Household': 'household',
      'Beverages': 'beverages',
      'Electronics': 'electronics',
      'Construction Materials': 'constructionMaterials',
      'Plastics': 'plastics',
      'Cosmetics': 'cosmetics',
      'Powder Detergent': 'powderDetergent',
      'Liquid Detergent': 'liquidDetergent',
      'Juices': 'juices',
      'Dental Care': 'dentalCare',
      'Beef': 'beef'
    };
    
    const categoryKey = categoryMap[category] || category.toLowerCase().replace(/\s+/g, '');
    return t(`products.${categoryKey}`, category);
  };

  const handleWhatsAppClick = () => {
    const message = `${product.imageUrl}\n\nHello, I'm interested in this product: ${getProductName(product)}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };
  
  const description = getProductDescription(product);
  
  return (
    <div className="products-page-product-card">
      <div className="products-page-product-image">
        <img 
          src={product.imageUrl} 
          alt={getProductName(product)}
          onError={(e) => {
            console.error('Image failed to load:', {
              product: getProductName(product),
              url: product.imageUrl
            });
            e.target.src = 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=400&h=400&q=80';
          }}
        />
      </div>
      <div className="products-page-product-info">
        <div className="products-page-product-header">
          <h3>{getProductName(product)}</h3>
          <span className="products-page-category-tag">{getTranslatedCategory(product.category)}</span>
        </div>
        <div className="products-page-product-description">
          <div className="content">
            {description.length > MAX_DESCRIPTION_LENGTH
              ? description.slice(0, MAX_DESCRIPTION_LENGTH) + '...'
              : description}
          </div>
        </div>
        <div className="products-page-product-footer" style={{ paddingBottom: '1.5rem' }}>
          {/* <span className="product-price">${product.price}</span> */}
          <button className="products-page-whatsapp-buy-btn" onClick={handleWhatsAppClick}>
            <FaWhatsapp style={{ marginRight: '0.5rem', fontSize: '1.2rem' }} /> {t('products.buy')}
          </button>
        </div>
      </div>
    </div>
  );
});

// Memoized ProductsGrid component
const ProductsGrid = memo(({ products, loading, error }) => {
  const { t } = useTranslation();
  
  if (loading) {
    return (
      <div className="products-page-loading-overlay">
        <LoadingSpinner 
          size="large" 
          color="primary" 
          variant="wave"
          text={t('products.loading')}
          showText={true}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-page-error-message">
        <h2>{t('products.error')}</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="products-page-grid">
      {products.length === 0 ? (
        <div className="products-page-no-results">
          <h2>{t('products.noProductsFound')}</h2>
          <p>{t('products.noProductsFoundDesc')}</p>
        </div>
      ) : (
        products.map(product => (
          <ProductCard key={product._id} product={product} />
        ))
      )}
    </div>
  );
});

// Memoized FilterSection component with its own state management
const FilterSection = memo(({ initialFilters, onFilterChange }) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [localFilters, setLocalFilters] = useState(initialFilters);
  const [searchInput, setSearchInput] = useState(initialFilters.search || '');

  // Update local filters and price range when initial filters change
  useEffect(() => {
    setLocalFilters(initialFilters);
    setSearchInput(initialFilters.search || '');
  }, [initialFilters]);

  const handleFilterChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    if (name === 'search') {
      setSearchInput(value);
      // Debounce search to avoid too many API calls
      const timeoutId = setTimeout(() => {
        setLocalFilters(prev => ({ ...prev, [name]: value }));
        onFilterChange(name, value);
      }, 300);
      return () => clearTimeout(timeoutId);
    }

    setLocalFilters(prev => ({ ...prev, [name]: newValue }));
    onFilterChange(name, newValue);
    if (name !== 'search') {
      setIsVisible(false);
    }
  }, [onFilterChange]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onFilterChange('search', searchInput);
    setIsVisible(false);
  };

  const handleClearFilters = useCallback(() => {
    const clearedFilters = {
      category: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'name',
      search: ''
    };
    setLocalFilters(clearedFilters);
    setSearchInput('');
    Object.entries(clearedFilters).forEach(([name, value]) => {
      onFilterChange(name, value);
    });
    setIsVisible(false);
  }, [onFilterChange]);

  return (
    <div 
      className="products-page-filters-wrapper"
      >
      <button 
        className={`products-page-filter-toggle ${isVisible ? 'active' : ''}`}
        onClick={() => setIsVisible(v => !v)}
      >
        <FaFilter />
        <span>{t('products.filters')}</span>
        <FaChevronDown className="chevron-icon" />
      </button>

      <div
        className={`products-page-filters${isVisible ? ' show' : ''}`}
        style={{
          maxHeight: isVisible ? '600px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="products-page-search-wrapper products-page-filter-group" style={{ '--index': 0 }}>
          <label className="products-page-filter-label">{t('products.searchLabel')}</label>
          <form onSubmit={handleSearchSubmit} className="products-page-search-input-wrapper">
            <input
              type="text"
              name="search"
              value={searchInput}
              onChange={handleFilterChange}
              placeholder={t('products.searchPlaceholder')}
              className="products-page-search-input"
            />
            <FaSearch className="products-page-search-icon" />
          </form>
        </div>

        <div className="products-page-filter-group" style={{ '--index': 1 }}>
          <label className="products-page-filter-label">{t('products.categoryLabel')}</label>
          <select
            name="category"
            value={localFilters.category}
            onChange={handleFilterChange}
            className="products-page-category-filter"
          >
            <option value="">{t('products.allCategories')}</option>
            <option value="Foodstuffs">{t('products.foodstuffs')}</option>
            <option value="Household">{t('products.household')}</option>
            <option value="Beverages">{t('products.beverages')}</option>
            <option value="Electronics">{t('products.electronics')}</option>
            <option value="Construction Materials">{t('products.constructionMaterials')}</option>
            <option value="Plastics">{t('products.plastics')}</option>
            <option value="Cosmetics">{t('products.cosmetics')}</option>
            <option value="Powder Detergent">{t('products.powderDetergent')}</option>
            <option value="Liquid Detergent">{t('products.liquidDetergent')}</option>
            <option value="Juices">{t('products.juices')}</option>
            <option value="Dental Care">{t('products.dentalCare')}</option>
            <option value="Beef">{t('products.beef')}</option>
          </select>
        </div>

        <div className="products-page-filter-group" style={{ '--index': 2 }}>
          <label className="products-page-filter-label">{t('products.sortBy')}</label>
          <select
            name="sortBy"
            value={localFilters.sortBy}
            onChange={handleFilterChange}
            className="products-page-sort-filter"
          >
            <option value="name">{t('products.sortNameAZ')}</option>
            <option value="-name">{t('products.sortNameZA')}</option>
            <option value="-createdAt">{t('products.sortNewest')}</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleClearFilters}
          className="products-page-clear-filters-button"
        >
          {t('products.clearAllFilters')}
        </button>
      </div>
    </div>
  );
});

function Products() {
  const location = useLocation();
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]); // Store all products
  const [filteredProducts, setFilteredProducts] = useState([]); // Store filtered products
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(() => {
    // Initialize filters from URL params
    const params = new URLSearchParams(location.search);
    return {
      category: params.get('category') || '',
      search: params.get('search') || '',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
      sortBy: params.get('sort') || 'name'
    };
  });

  // Fetch all products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          category: filters.category || '',
          sort: filters.sortBy || 'name',
          limit: 10, // Assuming a default limit
          page: 1 // Assuming a default page
        }).toString();

        const response = await axios.get(`${API_URL}/api/products/public?${queryParams}`);
        setAllProducts(response.data.products);
        setFilteredProducts(response.data.products);
        setError('');
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters.category, filters.sortBy]);

  // Update filters when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newFilters = {
      category: params.get('category') || '',
      search: params.get('search') || '',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
      sortBy: params.get('sort') || 'name'
    };

    const currentFiltersStr = JSON.stringify(filters);
    const newFiltersStr = JSON.stringify(newFilters);
    
    if (currentFiltersStr !== newFiltersStr) {
      setFilters(newFilters);
    }
  }, [location.search]);

  // Filter products function
  const getFilteredProducts = useCallback((productList, currentFilters) => {
    let filtered = [...productList];

    // Helper function to safely get product name
    const getProductName = (product) => {
      if (typeof product.name === 'string') {
        // Old structure - name is a string
        return product.name;
      } else if (product.name && typeof product.name === 'object') {
        // New structure - name is an object with pt/en
        return product.name.en || product.name.pt || '';
      }
      return '';
    };

    // Helper function to safely get product description
    const getProductDescription = (product) => {
      if (typeof product.description === 'string') {
        // Old structure - description is a string
        return product.description;
      } else if (product.description && typeof product.description === 'object') {
        // New structure - description is an object with pt/en
        return product.description.en || product.description.pt || '';
      }
      return '';
    };

    // Apply category filter
    if (currentFilters.category) {
      filtered = filtered.filter(product => 
        product.category === currentFilters.category
      );
    }
    
    // Apply search filter
    if (currentFilters.search) {
      const searchTerm = currentFilters.search.toLowerCase();
      filtered = filtered.filter(product => 
        getProductName(product).toLowerCase().includes(searchTerm) ||
        getProductDescription(product).toLowerCase().includes(searchTerm)
      );
    }

    // Apply price filters
    if (currentFilters.minPrice) {
      filtered = filtered.filter(product => 
        product.price >= parseFloat(currentFilters.minPrice)
      );
    }

    if (currentFilters.maxPrice) {
      filtered = filtered.filter(product => 
        product.price <= parseFloat(currentFilters.maxPrice)
      );
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      const sortField = currentFilters.sortBy.startsWith('-') ? 
        currentFilters.sortBy.substring(1) : currentFilters.sortBy;
      const sortOrder = currentFilters.sortBy.startsWith('-') ? -1 : 1;
      
      if (sortField === 'price') {
        return (a.price - b.price) * sortOrder;
      } else if (sortField === 'name') {
        return getProductName(a).localeCompare(getProductName(b)) * sortOrder;
      } else if (sortField === 'createdAt') {
        return (new Date(a.createdAt) - new Date(b.createdAt)) * sortOrder;
      } else if (sortField === 'sales') {
        return ((a.sales || 0) - (b.sales || 0)) * sortOrder;
      } else if (sortField === 'rating') {
        return ((a.rating || 0) - (b.rating || 0)) * sortOrder;
      }
      return 0;
    });
  }, []);

  // Apply filters when they change
  useEffect(() => {
    if (allProducts.length > 0) {
      const filtered = getFilteredProducts(allProducts, filters);
      setFilteredProducts(filtered);
    }
  }, [filters, allProducts, getFilteredProducts]);

  // Update URL when filters change (debounced)
  useEffect(() => {
    const updateURL = () => {
      const currentParams = new URLSearchParams(location.search);
      const newParams = new URLSearchParams();
      
      if (filters.category) newParams.set('category', filters.category);
      if (filters.search) newParams.set('search', filters.search);
      if (filters.minPrice) newParams.set('minPrice', filters.minPrice);
      if (filters.maxPrice) newParams.set('maxPrice', filters.maxPrice);
      if (filters.sortBy) newParams.set('sort', filters.sortBy);

      const newSearch = newParams.toString();
      const currentSearch = currentParams.toString();

      if (currentSearch !== newSearch) {
        navigate(`/products?${newSearch}`, { replace: true });
      }
    };

    const timeoutId = setTimeout(updateURL, 300);
    return () => clearTimeout(timeoutId);
  }, [filters, navigate, location.search]);

  const handleFilterChange = useCallback((name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  if (loading) {
    return (
      <div className="products-page-loading-overlay">
        <LoadingSpinner size="large" color="primary" />
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-page-container">
        <FilterSection 
          initialFilters={filters}
          onFilterChange={handleFilterChange}
        />
        <ProductsGrid 
          products={filteredProducts}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
}

export default Products; 