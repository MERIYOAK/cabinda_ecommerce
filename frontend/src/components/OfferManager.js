import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';
import { FaEdit, FaTrash, FaFilter, FaPlus, FaTags } from 'react-icons/fa';
import './OfferManager.css';
import LoadingSpinner from './LoadingSpinner';
import { useTranslation } from 'react-i18next';

function OfferManager() {
  const { i18n, t } = useTranslation();
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    search: ''
  });
  const [loading, setLoading] = useState(true);

  // Add a timeout to hide loading overlay after 5 seconds (safeguard)
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => setLoading(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [loading]);

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

  // Helper function to safely get offer title
  const getOfferTitle = (offer) => {
    if (typeof offer.title === 'string') {
      // Old structure - title is a string
      return offer.title;
    } else if (offer.title && typeof offer.title === 'object') {
      // New structure - title is an object with pt/en
      return offer.title[i18n.language] || offer.title.en || offer.title.pt || '';
    }
    return '';
  };

  // Helper function to safely get offer description
  const getOfferDescription = (offer) => {
    if (typeof offer.description === 'string') {
      // Old structure - description is a string
      return offer.description;
    } else if (offer.description && typeof offer.description === 'object') {
      // New structure - description is an object with pt/en
      return offer.description[i18n.language] || offer.description.en || offer.description.pt || '';
    }
    return '';
  };

  const categories = ['seasonal', 'clearance', 'flash', 'bundle', 'holiday', 'other'];

  const [offerForm, setOfferForm] = useState({
    title: '',
    description: '',
    category: 'other',
    discountPercentage: '',
    products: [],
    startDate: '',
    endDate: '',
    isActive: true
  });

  useEffect(() => {
    fetchOffers();
    fetchProducts();
  }, []);

  useEffect(() => {
    filterOffers();
  }, [filters, offers]);

  const filterOffers = () => {
    let filtered = offers;

    if (filters.category !== 'all') {
      filtered = filtered.filter(offer => offer.category === filters.category);
    }

    if (filters.status !== 'all') {
      const isActive = filters.status === 'active';
      filtered = filtered.filter(offer => offer.isActive === isActive);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(offer => 
        getOfferTitle(offer).toLowerCase().includes(searchLower) ||
        getOfferDescription(offer).toLowerCase().includes(searchLower)
      );
    }

    setFilteredOffers(filtered);
  };

  const fetchOffers = async () => {
    try {
      const response = await axiosInstance.get('/api/offers');
      setOffers(response.data);
    } catch (err) {
      setError('Failed to fetch offers');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get('/api/products');
      setProducts(response.data);
    } catch (err) {
      setError('Failed to fetch products');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(offerForm).forEach(key => {
        if (key === 'products') {
          formData.append(key, JSON.stringify(offerForm[key]));
        } else {
          formData.append(key, offerForm[key]);
        }
      });

      if (selectedImage) {
        formData.append('bannerImage', selectedImage);
      }

      if (isEditing && selectedOffer) {
        await axiosInstance.put(
          `/api/offers/${selectedOffer._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      } else {
        await axiosInstance.post('http://localhost:5000/api/offers', formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      setSuccessMessage(isEditing ? 'Offer updated successfully!' : 'Offer added successfully!');
      resetForm();
      fetchOffers();
    } catch (err) {
      setError('Failed to save offer');
    }
  };

  const handleEdit = (offer) => {
    setSelectedOffer(offer);
    setOfferForm({
      title: getOfferTitle(offer),
      description: getOfferDescription(offer),
      category: offer.category,
      discountPercentage: offer.discountPercentage,
      products: offer.products.map(p => p._id),
      startDate: offer.startDate.split('T')[0],
      endDate: offer.endDate.split('T')[0],
      isActive: offer.isActive
    });
    setImagePreview(offer.bannerImage || '/placeholder.jpg');
    setIsEditing(true);
  };

  const handleDelete = async (offerId) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        await axiosInstance.delete(`/api/offers/${offerId}`);
        setSuccessMessage('Offer deleted successfully!');
        fetchOffers();
      } catch (err) {
        setError('Failed to delete offer');
      }
    }
  };

  const resetForm = () => {
    setOfferForm({
      title: '',
      description: '',
      category: 'other',
      discountPercentage: '',
      products: [],
      startDate: '',
      endDate: '',
      isActive: true
    });
    setSelectedImage(null);
    setImagePreview('');
    setIsEditing(false);
    setSelectedOffer(null);
  };

  const handleImageChange = (e) => {
    console.log('File input changed', e.target.files);
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const renderProductOption = (product) => (
    <option key={product._id} value={product._id}>
      {getProductName(product)} - Kz{product.price.toFixed(2)}
    </option>
  );

  const renderSelectedProducts = () => {
    if (!Array.isArray(products) || products.length === 0) return null;

    const selectedProducts = products.filter(product => 
      offerForm.products.includes(product._id)
    );

    return (
      <div className="selected-products">
        <h4>Selected Products</h4>
        <div className="selected-products-grid">
          {selectedProducts.map(product => (
            <div key={product._id} className="selected-product-card">
              <img 
                src={product.images?.[0] || '/placeholder.jpg'} 
                alt={getProductName(product)}
                className="product-thumbnail"
              />
              <div className="product-info">
                <h5>{getProductName(product)}</h5>
                <div className="price-info">
                  <span className="original-price">Kz{product.price.toFixed(2)}</span>
                  <span className="sale-price">
                    Kz{(product.price * (1 - offerForm.discountPercentage / 100)).toFixed(2)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="remove-product-btn"
                onClick={() => {
                  setOfferForm({
                    ...offerForm,
                    products: offerForm.products.filter(id => id !== product._id)
                  });
                }}
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="offer-manager">
      {loading && (
        <div className="loading-overlay">
          <LoadingSpinner 
            size="large" 
            color="primary" 
            variant="ring"
            text={t('admin.saving')}
            showText={true}
          />
        </div>
      )}
      {!loading && (
        <div className="offer-form">
          <h3>{isEditing ? 'Edit Offer' : 'Add New Offer'}</h3>
          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                value={offerForm.title}
                onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                required
                className="form-control"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  value={offerForm.category}
                  onChange={(e) => setOfferForm({ ...offerForm, category: e.target.value })}
                  required
                  className="form-control"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="discountPercentage">Discount Percentage</label>
                <div className="input-with-icon">
                  <input
                    type="number"
                    id="discountPercentage"
                    value={offerForm.discountPercentage}
                    onChange={(e) => setOfferForm({ ...offerForm, discountPercentage: e.target.value })}
                    required
                    min="0"
                    max="100"
                    className="form-control"
                  />
                  <FaTags className="input-icon" />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={offerForm.description}
                onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                required
                className="form-control"
                rows="4"
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Start Date</label>
                <input
                  type="datetime-local"
                  id="startDate"
                  value={offerForm.startDate}
                  onChange={(e) => setOfferForm({ ...offerForm, startDate: e.target.value })}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDate">End Date</label>
                <input
                  type="datetime-local"
                  id="endDate"
                  value={offerForm.endDate}
                  onChange={(e) => setOfferForm({ ...offerForm, endDate: e.target.value })}
                  required
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="products">Select Products</label>
              <select
                id="products"
                multiple
                value={offerForm.products}
                onChange={(e) => {
                  const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                  setOfferForm({ ...offerForm, products: selectedOptions });
                }}
                className="form-control"
                required
              >
                {products.map(renderProductOption)}
              </select>
            </div>

            {renderSelectedProducts()}

            <div className="form-group">
              <label htmlFor="bannerImage">Banner Image</label>
              <input
                type="file"
                id="bannerImage"
                onChange={handleImageChange}
                accept="image/*"
                className="form-control"
                required={!isEditing}
              />
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={offerForm.isActive}
                  onChange={(e) => setOfferForm({ ...offerForm, isActive: e.target.checked })}
                />
                Active
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {isEditing ? 'Update Offer' : 'Create Offer'}
              </button>
              {isEditing && (
                <button type="button" onClick={resetForm} className="btn btn-secondary">
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="offers-list">
            <div className="list-header">
              <h3>Current Offers</h3>
              <div className="filters">
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="filter-select"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="filter-select"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <input
                  type="text"
                  placeholder="Search offers..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="search-input"
                />
              </div>
            </div>

            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Banner</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Discount</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOffers.map(offer => (
                    <tr key={offer._id}>
                      <td>
                        <div className="offer-banner-small">
                          <img src={offer.bannerImage || '/placeholder.jpg'} alt={getOfferTitle(offer)} />
                        </div>
                      </td>
                      <td>{getOfferTitle(offer)}</td>
                      <td>{offer.category.charAt(0).toUpperCase() + offer.category.slice(1)}</td>
                      <td>{offer.discountPercentage}%</td>
                      <td>
                        {new Date(offer.startDate).toLocaleDateString()} -
                        <br />
                        {new Date(offer.endDate).toLocaleDateString()}
                      </td>
                      <td>
                        <span className={`status ${offer.isActive ? 'active' : 'inactive'}`}>
                          {offer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleEdit(offer)}
                          className="btn btn-icon edit"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(offer._id)}
                          className="btn btn-icon delete"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OfferManager; 