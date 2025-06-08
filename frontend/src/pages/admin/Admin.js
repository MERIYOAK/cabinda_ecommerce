import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import { FaEdit, FaTrash, FaPlus, FaSignOutAlt, FaNewspaper, FaGift, FaBullhorn, FaBox, FaImage, FaCalendar, FaPercent, FaTags, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import './Admin.css';
import API_URL from '../../config/api';
import AnnouncementManager from '../../components/admin/AnnouncementManager';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Products state
  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'foodstuffs',
    stock: '',
    isOnSale: false,
    salePrice: ''
  });

  // Announcements state
  const [announcements, setAnnouncements] = useState([]);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    category: 'Promotion',
    isImportant: false,
    imageUrl: ''
  });

  // Weekly offers state
  const [offers, setOffers] = useState([]);
  const [offerForm, setOfferForm] = useState({
    id: null,
    title: '',
    description: '',
    category: 'seasonal',
    discountPercentage: '',
    startDate: '',
    endDate: '',
    products: [],
    isActive: true,
    bannerImage: null,
    bannerImagePreview: ''
  });

  // Newsletter state
  const [subscribers, setSubscribers] = useState([]);
  const [newsletterForm, setNewsletterForm] = useState({
    subject: '',
    message: ''
  });

  // Add new state for product image
  const [selectedProductImage, setSelectedProductImage] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    fetchInitialData();
  }, [navigate]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchProducts(),
        fetchAnnouncements(),
        fetchOffers(),
        fetchSubscribers()
      ]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get('/api/products');
      setProducts(response.data.products);
    } catch (error) {
      handleError(error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await axiosInstance.get('/api/announcements');
      setAnnouncements(response.data.announcements || response.data || []);
    } catch (error) {
      handleError(error);
      setAnnouncements([]);
    }
  };

  const fetchOffers = async () => {
    try {
      const response = await axiosInstance.get('/api/offers');
      setOffers(response.data);
    } catch (error) {
      handleError(error);
    }
  };

  const fetchSubscribers = async () => {
    try {
      const response = await axiosInstance.get('/api/newsletter/subscribers');
      setSubscribers(response.data);
    } catch (error) {
      handleError(error);
    }
  };

  const handleError = (error) => {
    console.error('Error:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('adminToken');
      navigate('/admin/login');
    } else {
      setError(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    delete axiosInstance.defaults.headers.common['Authorization'];
    navigate('/admin/login');
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await axiosInstance.post('/api/newsletter/send', newsletterForm);
      setSuccessMessage(`Newsletter sent successfully to ${response.data.recipientCount} subscribers!`);
      setNewsletterForm({ subject: '', message: '' });
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    console.log('Form submission - current offerForm state:', offerForm);
    console.log('Products array at submission:', offerForm.products);

    try {
      // Check if token exists
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('You are not logged in. Please log in again.');
        navigate('/admin/login');
        return;
      }

      // Validate required fields
      if (!offerForm.title || !offerForm.description || !offerForm.discountPercentage || 
          !offerForm.startDate || !offerForm.endDate) {
        throw new Error('Please fill in all required fields');
      }

      // Ensure products array exists
      if (!offerForm.products) {
        setOfferForm(prev => ({ ...prev, products: [] }));
      }

      // Validate products array
      if (!Array.isArray(offerForm.products) || offerForm.products.length === 0) {
        console.log('Products validation failed:', {
          isArray: Array.isArray(offerForm.products),
          length: offerForm.products?.length,
          products: offerForm.products
        });
        setError('Please select at least one product for the offer');
        setLoading(false);
        return;
      }

      // Validate banner image for new offers only
      if (!offerForm.bannerImage && !offerForm.id && !offerForm.bannerImagePreview) {
        setError('Please upload a banner image');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('title', offerForm.title);
      formData.append('description', offerForm.description);
      formData.append('category', offerForm.category);
      formData.append('discountPercentage', offerForm.discountPercentage.toString());
      formData.append('startDate', new Date(offerForm.startDate).toISOString());
      formData.append('endDate', new Date(offerForm.endDate).toISOString());
      formData.append('isActive', offerForm.isActive.toString());
      
      // Add products to FormData
      offerForm.products.forEach(productId => {
        formData.append('products[]', productId);
      });

      // Add banner image if available
      if (offerForm.bannerImage) {
        formData.append('bannerImage', offerForm.bannerImage);
      }

      // Log FormData contents
      console.log('FormData contents:');
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      };

      let response;
      if (offerForm.id) {
        console.log('Updating existing offer:', offerForm.id);
        response = await axiosInstance.put(`/api/offers/${offerForm.id}`, formData, config);
        setOffers(offers.map(offer => 
          offer._id === offerForm.id ? response.data : offer
        ));
        setSuccessMessage('Offer updated successfully!');
      } else {
        console.log('Creating new offer...');
        response = await axiosInstance.post('/api/offers', formData, config);
        setOffers([response.data, ...offers]);
        setSuccessMessage('Offer created successfully!');
      }
      resetOfferForm();
    } catch (error) {
      console.error('Error in form submission:', error);
      if (error.response) {
        console.error('Response error data:', error.response.data);
        console.error('Response error status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        setError(error.response.data.message || 'Failed to save offer');
      } else if (error.request) {
        console.error('Request error:', error.request);
        setError('Network error - please check your connection and server status');
      } else {
        console.error('Error message:', error.message);
        setError(error.message || 'Failed to save offer');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOfferImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a valid image file (JPEG, PNG, or GIF)');
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setError('Image file size must be less than 5MB');
        return;
      }

      setOfferForm({
        ...offerForm,
        bannerImage: file,
        bannerImagePreview: URL.createObjectURL(file)
      });
      setError(''); // Clear any previous errors
    }
  };

  const handleEditOffer = (offer) => {
    console.log('Editing offer:', offer);
    console.log('Original products:', offer.products);
    
    // Extract product IDs from the offer's products array
    const productIds = offer.products.map(product => product._id || product);
    console.log('Extracted product IDs:', productIds);
    
    // Create the updated form state
    const updatedForm = {
      id: offer._id,
      title: offer.title,
      description: offer.description,
      category: offer.category,
      discountPercentage: offer.discountPercentage,
      startDate: new Date(offer.startDate).toISOString().slice(0, 16),
      endDate: new Date(offer.endDate).toISOString().slice(0, 16),
      products: productIds,
      isActive: offer.isActive,
      bannerImage: null,
      bannerImagePreview: offer.bannerImage
    };

    console.log('Setting offer form with data:', updatedForm);
    
    // Update the form state
    setOfferForm(updatedForm);
    
    // Force update the products array in case it's not updating properly
    setTimeout(() => {
      setOfferForm(prev => {
        if (prev.products.length === 0) {
          console.log('Forcing products array update:', productIds);
          return { ...prev, products: productIds };
        }
        return prev;
      });
    }, 0);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteOffer = async (offerId) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await axiosInstance.delete(`/api/offers/${offerId}`);
      setOffers(offers.filter(offer => offer._id !== offerId));
      setSuccessMessage('Offer deleted successfully!');
      resetOfferForm();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const resetOfferForm = () => {
    setOfferForm({
      id: null,
      title: '',
      description: '',
      category: 'seasonal',
      discountPercentage: '',
      startDate: '',
      endDate: '',
      products: [],
      isActive: true,
      bannerImage: null,
      bannerImagePreview: ''
    });
    if (offerForm.bannerImagePreview) {
      URL.revokeObjectURL(offerForm.bannerImagePreview);
    }
  };

  // Product form handlers
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    const formData = new FormData();
    formData.append('name', productForm.name);
    formData.append('description', productForm.description);
    formData.append('price', productForm.price);
    formData.append('category', productForm.category);
    formData.append('stock', productForm.stock);
    formData.append('isOnSale', productForm.isOnSale);
    if (productForm.isOnSale) {
      formData.append('salePrice', productForm.salePrice);
    }
    if (selectedProductImage) {
      formData.append('image', selectedProductImage);
    }

    try {
      if (editingProduct) {
        await axiosInstance.put(`/api/products/${editingProduct._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccessMessage('Product updated successfully!');
      } else {
        await axiosInstance.post('/api/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccessMessage('Product added successfully!');
      }
      
      resetProductForm();
      fetchProducts();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedProductImage(file);
      setProductImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      isOnSale: product.isOnSale || false,
      salePrice: product.salePrice || ''
    });
    if (product.imageUrl) {
      setProductImagePreview(product.imageUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setLoading(true);
      try {
        await axiosInstance.delete(`/api/products/${productId}`);
        setSuccessMessage('Product deleted successfully!');
        fetchProducts();
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      category: 'foodstuffs',
      stock: '',
      isOnSale: false,
      salePrice: ''
    });
    setSelectedProductImage(null);
    setProductImagePreview('');
    setEditingProduct(null);
  };

  // Add announcement handlers
  const handleCreateAnnouncement = async (formData) => {
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await axiosInstance.post('/api/announcements', formData);
      setAnnouncements([response.data, ...announcements]);
      setSuccessMessage('Announcement created successfully!');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAnnouncement = async (id, formData) => {
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await axiosInstance.put(`/api/announcements/${id}`, formData);
      setAnnouncements(announcements.map(a => a._id === id ? response.data : a));
      setSuccessMessage('Announcement updated successfully!');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      await axiosInstance.delete(`/api/announcements/${id}`);
      setAnnouncements(announcements.filter(a => a._id !== id));
      setSuccessMessage('Announcement deleted successfully!');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchUpdateAnnouncementStatus = async (ids, active) => {
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      await axiosInstance.put('/api/announcements/batch/status', { ids, active });
      setAnnouncements(announcements.map(a => 
        ids.includes(a._id) ? { ...a, active } : a
      ));
      setSuccessMessage(`${ids.length} announcements ${active ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchDeleteAnnouncements = async (ids) => {
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      await axiosInstance.delete('/api/announcements/batch', { data: { ids } });
      setAnnouncements(announcements.filter(a => !ids.includes(a._id)));
      setSuccessMessage(`${ids.length} announcements deleted successfully!`);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // Update the product selection handler with debug logging
  const handleProductSelection = (productId, checked) => {
    console.log('Product selection changed:', { productId, checked });
    setOfferForm(prevForm => {
      const updatedProducts = checked
        ? [...(prevForm.products || []), productId]
        : (prevForm.products || []).filter(id => id !== productId);
      
      console.log('Updated products array:', updatedProducts);
      
      return {
        ...prevForm,
        products: updatedProducts
      };
    });
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-title-section">
          <h1>Admin Dashboard</h1>
          <button onClick={handleLogout} className="logout-button">
            <FaSignOutAlt /> Logout
          </button>
        </div>
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <FaBox /> Products
          </button>
          <button
            className={`tab-button ${activeTab === 'announcements' ? 'active' : ''}`}
            onClick={() => setActiveTab('announcements')}
          >
            <FaBullhorn /> Announcements
          </button>
          <button
            className={`tab-button ${activeTab === 'offers' ? 'active' : ''}`}
            onClick={() => setActiveTab('offers')}
          >
            <FaGift /> Weekly Offers
          </button>
          <button
            className={`tab-button ${activeTab === 'newsletter' ? 'active' : ''}`}
            onClick={() => setActiveTab('newsletter')}
          >
            <FaNewspaper /> Newsletter
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      {loading ? (
        <div className="loading-spinner"></div>
      ) : (
        <>
          {activeTab === 'products' && (
            <div className="products-section">
              <div className="add-product-container">
                <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <form onSubmit={handleProductSubmit} className="product-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Product Name</label>
                      <input
                        type="text"
                        id="name"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="category">Category</label>
                      <select
                        id="category"
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        required
                      >
                        <option value="foodstuffs">Foodstuffs</option>
                        <option value="electronics">Electronics</option>
                        <option value="clothing">Clothing</option>
                        <option value="household">Household</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="price">Price</label>
                      <input
                        type="number"
                        id="price"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="stock">Stock</label>
                      <input
                        type="number"
                        id="stock"
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                        required
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={productForm.isOnSale}
                          onChange={(e) => setProductForm({ ...productForm, isOnSale: e.target.checked })}
                        />
                        On Sale
                      </label>
                    </div>
                    {productForm.isOnSale && (
                      <div className="form-group">
                        <label htmlFor="salePrice">Sale Price</label>
                        <input
                          type="number"
                          id="salePrice"
                          value={productForm.salePrice}
                          onChange={(e) => setProductForm({ ...productForm, salePrice: e.target.value })}
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="image">Product Image</label>
                    <div className="image-upload-section">
                      <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={handleProductImageChange}
                        className="file-input"
                      />
                      <div className="image-upload-content">
                        <FaImage className="image-upload-icon" />
                        <p>Click to upload image</p>
                      </div>
                    </div>
                    {productImagePreview && (
                      <div className="image-preview">
                        <img src={productImagePreview} alt="Product preview" />
                      </div>
                    )}
                  </div>
                  <div className="form-buttons">
                    <button type="submit" className="submit-button" disabled={loading}>
                      {loading ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                    </button>
                    {editingProduct && (
                      <button
                        type="button"
                        className="cancel-button"
                        onClick={resetProductForm}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
              <div className="products-list-container">
                <h2>Products List</h2>
                <div className="table-responsive">
                  <table className="products-table">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product._id}>
                          <td>
                            <img
                              src={product.imageUrl || 'placeholder.jpg'}
                              alt={product.name}
                              className="product-thumbnail"
                            />
                          </td>
                          <td>{product.name}</td>
                          <td>{product.category}</td>
                          <td>
                            {product.isOnSale ? (
                              <>
                                <span className="original-price">${product.price}</span>
                                <span className="sale-price">${product.salePrice}</span>
                              </>
                            ) : (
                              `$${product.price}`
                            )}
                          </td>
                          <td>{product.stock}</td>
                          <td>
                            <span className={`status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="edit-button"
                            >
                              <FaEdit /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className="delete-button"
                            >
                              <FaTrash /> Delete
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

          {activeTab === 'announcements' && (
            <div className="announcements-section">
              <AnnouncementManager
                announcements={announcements}
                onCreateAnnouncement={handleCreateAnnouncement}
                onUpdateAnnouncement={handleUpdateAnnouncement}
                onDeleteAnnouncement={handleDeleteAnnouncement}
                onBatchUpdateStatus={handleBatchUpdateAnnouncementStatus}
                onBatchDelete={handleBatchDeleteAnnouncements}
                loading={loading}
              />
            </div>
          )}

          {activeTab === 'offers' && (
            <div className="offers-section">
              <div className="add-offer-container">
                <h2>{offerForm.id ? 'Edit Offer' : 'Create Weekly Offer'}</h2>
                <form onSubmit={handleOfferSubmit} className="offer-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="title">Offer Title</label>
                      <input
                        type="text"
                        id="title"
                        value={offerForm.title}
                        onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="category">Category</label>
                      <select
                        id="category"
                        value={offerForm.category}
                        onChange={(e) => setOfferForm({ ...offerForm, category: e.target.value })}
                        required
                      >
                        <option value="seasonal">Seasonal</option>
                        <option value="clearance">Clearance</option>
                        <option value="flash">Flash Sale</option>
                        <option value="bundle">Bundle</option>
                        <option value="holiday">Holiday</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      value={offerForm.description}
                      onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                      required
                    />
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
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="discountPercentage">Discount (%)</label>
                      <input
                        type="number"
                        id="discountPercentage"
                        value={offerForm.discountPercentage}
                        onChange={(e) => setOfferForm({ ...offerForm, discountPercentage: e.target.value })}
                        required
                        min="0"
                        max="100"
                      />
                    </div>
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
                  <div className="form-group">
                    <label>Select Products</label>
                    <div className="products-grid">
                      {products.map(product => {
                        const isSelected = offerForm.products && offerForm.products.includes(product._id);
                        console.log(`Product ${product._id} selected:`, isSelected);
                        return (
                          <div key={product._id} className="product-checkbox">
                            <input
                              type="checkbox"
                              id={`product-${product._id}`}
                              checked={isSelected}
                              onChange={(e) => handleProductSelection(product._id, e.target.checked)}
                            />
                            <label htmlFor={`product-${product._id}`}>
                              <img 
                                src={product.imageUrl || '/placeholder.jpg'} 
                                alt={product.name} 
                                className="product-thumbnail"
                              />
                              <span>{product.name}</span>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="bannerImage">Banner Image</label>
                    <div className="image-upload-section">
                      <input
                        type="file"
                        id="bannerImage"
                        accept="image/*"
                        onChange={handleOfferImageChange}
                        className="file-input"
                        required={!offerForm.id}
                      />
                      <div className="image-upload-content">
                        <FaImage className="image-upload-icon" />
                        <p>Click to upload banner image</p>
                      </div>
                    </div>
                    {offerForm.bannerImagePreview && (
                      <div className="image-preview">
                        <img src={offerForm.bannerImagePreview} alt="Banner preview" />
                      </div>
                    )}
                  </div>
                  <div className="form-buttons">
                    <button type="submit" className="submit-button" disabled={loading}>
                      {loading ? 'Saving...' : offerForm.id ? 'Update Offer' : 'Create Offer'}
                    </button>
                    {offerForm.id && (
                      <button type="button" className="cancel-button" onClick={resetOfferForm}>
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
              <div className="offers-list-container">
                <h2>Active Offers</h2>
                <div className="table-responsive">
                  <table className="offers-table">
                    <thead>
                      <tr>
                        <th>Banner</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Duration</th>
                        <th>Discount</th>
                        <th>Products</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {offers.map(offer => (
                        <tr key={offer._id}>
                          <td>
                            <img
                              src={offer.bannerImage}
                              alt={offer.title}
                              className="offer-banner-thumbnail"
                            />
                          </td>
                          <td>
                            <div className="offer-title">{offer.title}</div>
                            <div className="offer-description">{offer.description}</div>
                          </td>
                          <td>
                            <span className="offer-category">
                              <FaTags className="icon" />
                              {offer.category.charAt(0).toUpperCase() + offer.category.slice(1)}
                            </span>
                          </td>
                          <td>
                            <div className="offer-dates">
                              <div><FaCalendar className="icon" /> Start: {new Date(offer.startDate).toLocaleDateString()}</div>
                              <div><FaCalendar className="icon" /> End: {new Date(offer.endDate).toLocaleDateString()}</div>
                            </div>
                          </td>
                          <td>
                            <span className="offer-discount">
                              <FaPercent className="icon" />
                              {offer.discountPercentage}%
                            </span>
                          </td>
                          <td>
                            <div className="offer-products">
                              {offer.products.length} products
                              <div className="products-preview">
                                {offer.products.map(product => (
                                  <img
                                    key={product._id}
                                    src={product.imageUrl}
                                    alt={product.name}
                                    title={product.name}
                                    className="product-mini-thumbnail"
                                  />
                                ))}
                              </div>
                            </div>
                          </td>
                          <td>
                            {offer.isActive ? (
                              <span className="status-badge active">
                                <FaToggleOn className="icon" /> Active
                              </span>
                            ) : (
                              <span className="status-badge inactive">
                                <FaToggleOff className="icon" /> Inactive
                              </span>
                            )}
                          </td>
                          <td>
                            <button
                              onClick={() => handleEditOffer(offer)}
                              className="edit-button"
                            >
                              <FaEdit /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteOffer(offer._id)}
                              className="delete-button"
                            >
                              <FaTrash /> Delete
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

          {activeTab === 'newsletter' && (
            <div className="newsletter-section">
              <div className="compose-newsletter-container">
                <h2>Compose Newsletter</h2>
                <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
                  <div className="form-group">
                    <label htmlFor="subject">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      value={newsletterForm.subject}
                      onChange={(e) => setNewsletterForm({ ...newsletterForm, subject: e.target.value })}
                      required
                      placeholder="Enter newsletter subject"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      value={newsletterForm.message}
                      onChange={(e) => setNewsletterForm({ ...newsletterForm, message: e.target.value })}
                      required
                      placeholder="Enter newsletter content"
                      rows="10"
                    />
                  </div>
                  <div className="form-buttons">
                    <button 
                      type="submit" 
                      className="submit-button"
                      disabled={loading}
                    >
                      {loading ? 'Sending...' : 'Send Newsletter'}
                    </button>
                  </div>
                </form>
              </div>
              <div className="newsletter-preview">
                <h3>Preview</h3>
                <div className="preview-container">
                  <h2>{newsletterForm.subject || 'Newsletter Subject'}</h2>
                  <div className="preview-content">
                    {newsletterForm.message || 'Newsletter content will appear here...'}
                  </div>
                </div>
                <div className="subscribers-info">
                  <h4>Subscribers</h4>
                  <p>Total Subscribers: {subscribers.length}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Admin;  