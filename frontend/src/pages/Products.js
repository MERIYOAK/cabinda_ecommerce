import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaFilter, FaSearch, FaChevronDown } from 'react-icons/fa';
import axios from 'axios';
import API_URL from '../config/api';
import './Products.css';
import LoadingSpinner from '../components/LoadingSpinner';
// Memoized ProductCard component to prevent unnecessary re-renders
const ProductCard = memo(({ product }) => {
  return (
    <div className="product-card">
      <div className="product-image">
        <img 
          src={product.imageUrl} 
          alt={product.name}
          onError={(e) => {
            console.error('Image failed to load:', {
              product: product.name,
              url: product.imageUrl
            });
            e.target.src = 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=400&h=400&q=80';
          }}
        />
        {product.isOnSale && (
          <div className="sale-badge">Sale!</div>
        )}
      </div>
      <div className="product-info">
        <div className="product-header">
          <h3>{product.name}</h3>
          <span className="category-tag">{product.category}</span>
        </div>
        <div className="product-description">
          <div className="content">
            {product.description}
          </div>
        </div>
        <div className="product-footer">
          <div className="price-container">
            {product.isOnSale ? (
              <>
                <span className="original-price">${product.price}</span>
                <span className="sale-price">${product.salePrice}</span>
              </>
            ) : (
              <span className="price">${product.price}</span>
            )}
          </div>
          <div className="product-meta">
            <span className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
            {product.rating > 0 && (
              <span className="rating">
                ★ {product.rating.toFixed(1)} ({product.numReviews})
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

// Memoized ProductsGrid component
const ProductsGrid = memo(({ products, loading, error }) => {
  if (loading) {
    return (
      <div className="loading-overlay">
        <LoadingSpinner size="large" color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="products-grid">
      {products.length === 0 ? (
        <div className="no-results">
          <h2>No Products Found</h2>
          <p>No products found matching your criteria.</p>
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
  const [isVisible, setIsVisible] = useState(false);
  const [localFilters, setLocalFilters] = useState(initialFilters);
  const [searchInput, setSearchInput] = useState(initialFilters.search || '');
  const [priceRange, setPriceRange] = useState({
    minPrice: initialFilters.minPrice || '',
    maxPrice: initialFilters.maxPrice || ''
  });

  // Update local filters and price range when initial filters change
  useEffect(() => {
    setLocalFilters(initialFilters);
    setSearchInput(initialFilters.search || '');
    setPriceRange({
      minPrice: initialFilters.minPrice || '',
      maxPrice: initialFilters.maxPrice || ''
    });
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

    // Handle price range inputs separately
    if (name === 'minPrice' || name === 'maxPrice') {
      setPriceRange(prev => ({
        ...prev,
        [name]: value
      }));
      return;
    }

    setLocalFilters(prev => ({ ...prev, [name]: newValue }));
    onFilterChange(name, newValue);
    if (name !== 'search') {
      setIsVisible(false);
    }
  }, [onFilterChange]);

  const handlePriceRangeSubmit = (e) => {
    e.preventDefault();
    // Only update if at least one value is entered
    if (priceRange.minPrice || priceRange.maxPrice) {
      onFilterChange('minPrice', priceRange.minPrice);
      onFilterChange('maxPrice', priceRange.maxPrice);
      setIsVisible(false);
    }
  };

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
      search: '',
      inStock: false
    };
    setLocalFilters(clearedFilters);
    setSearchInput('');
    setPriceRange({ minPrice: '', maxPrice: '' });
    Object.entries(clearedFilters).forEach(([name, value]) => {
      onFilterChange(name, value);
    });
    setIsVisible(false);
  }, [onFilterChange]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      const filtersWrapper = document.querySelector('.filters-wrapper');
      if (isVisible && filtersWrapper && !filtersWrapper.contains(event.target)) {
        setIsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  return (
    <div 
      className="filters-wrapper"
      onMouseEnter={() => !isVisible && setIsVisible(true)}
      onMouseLeave={() => isVisible && setIsVisible(false)}
      >
      <button 
        className={`filter-toggle ${isVisible ? 'active' : ''}`}
        onClick={() => setIsVisible(!isVisible)}
      >
        <FaFilter />
        <span>Filters</span>
        <FaChevronDown className="chevron-icon" />
      </button>

      <div className={`filters ${isVisible ? 'show' : ''}`}>
        <div className="search-wrapper filter-group" style={{ '--index': 0 }}>
          <label className="filter-label">Search Products</label>
          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="search-input-wrapper">
              <input
                type="text"
                name="search"
                value={searchInput}
                onChange={handleFilterChange}
                placeholder="Search products..."
                className="search-input"
                autoComplete="off"
              />
              <FaSearch className="search-icon" />
            </div>
            <button type="submit" style={{ display: 'none' }}>Search</button>
          </form>
        </div>

        <div className="filter-group" style={{ '--index': 1 }}>
          <label className="filter-label">Category</label>
          <select
            name="category"
            value={localFilters.category}
            onChange={handleFilterChange}
            className="category-filter"
          >
            <option value="">All Categories</option>
            <option value="Foodstuffs">Foodstuffs</option>
            <option value="Drinks">Drinks</option>
            <option value="Fashion">Fashion</option>
            <option value="Home & Living">Home & Living</option>
          </select>
        </div>

        <div className="filter-group" style={{ '--index': 2 }}>
          <label className="filter-label">Price Range</label>
          <form onSubmit={handlePriceRangeSubmit} className="price-range">
            <input
              type="number"
              name="minPrice"
              value={priceRange.minPrice}
              onChange={handleFilterChange}
              placeholder="Min"
              min="0"
              className="price-input"
            />
            <span className="price-separator">to</span>
            <input
              type="number"
              name="maxPrice"
              value={priceRange.maxPrice}
              onChange={handleFilterChange}
              placeholder="Max"
              min="0"
              className="price-input"
            />
            <button 
              type="submit" 
              className="apply-price-button"
              style={{ display: 'none' }}
            >
              Apply
            </button>
          </form>
        </div>

        <div className="filter-group" style={{ '--index': 3 }}>
          <label className="filter-label">Sort By</label>
          <select
            name="sortBy"
            value={localFilters.sortBy}
            onChange={handleFilterChange}
            className="sort-filter"
          >
            <option value="name">Name (A-Z)</option>
            <option value="-name">Name (Z-A)</option>
            <option value="price">Price (Low to High)</option>
            <option value="-price">Price (High to Low)</option>
            <option value="-createdAt">Newest First</option>
            <option value="-sales">Best Selling</option>
            <option value="-rating">Highest Rated</option>
          </select>
        </div>

        <div className="filter-group checkbox-group" style={{ '--index': 4 }}>
          <label className="filter-label checkbox-label">
            <input
              type="checkbox"
              name="inStock"
              checked={localFilters.inStock}
              onChange={handleFilterChange}
            />
            <span>In Stock Only</span>
          </label>
        </div>

        <button onClick={handleClearFilters} className="clear-filters-button">
          Clear All Filters
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
      sortBy: params.get('sort') || 'name',
      inStock: params.get('inStock') === 'true'
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
      sortBy: params.get('sort') || 'name',
      inStock: params.get('inStock') === 'true'
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
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
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

    // Apply stock filter
    if (currentFilters.inStock) {
      filtered = filtered.filter(product => product.stock > 0);
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      const sortField = currentFilters.sortBy.startsWith('-') ? 
        currentFilters.sortBy.substring(1) : currentFilters.sortBy;
      const sortOrder = currentFilters.sortBy.startsWith('-') ? -1 : 1;
      
      if (sortField === 'price') {
        return (a.price - b.price) * sortOrder;
      } else if (sortField === 'name') {
        return a.name.localeCompare(b.name) * sortOrder;
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
      if (filters.inStock) newParams.set('inStock', 'true');

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
      <div className="loading-overlay">
        <LoadingSpinner size="large" color="primary" />
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="container">
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