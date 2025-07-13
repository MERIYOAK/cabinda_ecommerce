import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import { FaEdit, FaTrash, FaPlus, FaSignOutAlt, FaNewspaper, FaGift, FaBullhorn, FaBox, FaImage, FaCalendar, FaPercent, FaTags, FaToggleOn, FaToggleOff, FaGlobe, FaCheck, FaTimes, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import './Admin.css';
import API_URL from '../../config/api';
import AnnouncementManager from '../../components/admin/AnnouncementManager';
import { useTranslation } from 'react-i18next';

const Admin = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Notification state
  const [notification, setNotification] = useState(null);

  // Notification helper functions
  const showNotification = (type, title, message) => {
    setNotification({ type, title, message });
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const hideNotification = () => {
    setNotification(null);
  };

  // Notification component
  const NotificationModal = ({ notification, onClose }) => {
    if (!notification) return null;

    const getIcon = () => {
      switch (notification.type) {
        case 'success':
          return <FaCheck />;
        case 'error':
          return <FaTimes />;
        case 'warning':
          return <FaExclamationTriangle />;
        case 'info':
          return <FaInfoCircle />;
        default:
          return <FaInfoCircle />;
      }
    };

    return (
      <div className="notification-overlay" onClick={onClose}>
        <div className={`notification-container ${notification.type}`} onClick={(e) => e.stopPropagation()}>
          <span className="notification-icon">{getIcon()}</span>
          <div className="notification-title">{notification.title}</div>
          <div className="notification-message">{notification.message}</div>
          <button className="notification-button" onClick={onClose}>
            OK
          </button>
          <div className="notification-timer"></div>
        </div>
      </div>
    );
  };

  // Debug logging for translation
  console.log('Current language:', i18n.language);
  console.log('Translation test:', t('productForm.successAdd'));
  console.log('Interpolation test:', t('admin.success.newsletterSent', { count: 5 }));

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

  // Helper function to translate offer category
  const getOfferCategory = (category) => {
    const categoryKey = category.toLowerCase();
    return t(`admin.offerCategories.${categoryKey}`, category);
  };

  // Products state
  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState({
    name_pt: '',
    name_en: '',
    description_pt: '',
    description_en: '',
    price: '',
    category: 'Foodstuffs',
  });
  const [selectedProductImage, setSelectedProductImage] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);

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

  // Product search state
  const [productSearch, setProductSearch] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Newsletter state
  const [subscribers, setSubscribers] = useState([]);
  const [newsletterForm, setNewsletterForm] = useState({
    subject_pt: '',
    subject_en: '',
    message_pt: '',
    message_en: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    fetchInitialData();
  }, [navigate]);

  // Filter products based on search
  useEffect(() => {
    if (products.length > 0) {
      const filtered = products.filter(product => {
        const productName = getProductName(product).toLowerCase();
        const searchTerm = productSearch.toLowerCase();
        return productName.includes(searchTerm);
      });
      setFilteredProducts(filtered);
    }
  }, [productSearch, products, i18n.language]);

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
      setError(t('admin.errors.failedToLoadDashboard'));
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
      const response = await axiosInstance.get('/api/announcements?limit=5');
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
      const errorMessage = error.response?.data?.message || t('admin.errors.anErrorOccurred');
      showNotification('error', t('admin.errors.errorTitle'), errorMessage);
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
      // Validate required fields
      if (!newsletterForm.subject_pt || !newsletterForm.subject_en || 
          !newsletterForm.message_pt || !newsletterForm.message_en) {
        setError('Please fill in all newsletter fields in both languages');
        setLoading(false);
        return;
      }

      // Check if there are subscribers
      if (subscribers.length === 0) {
        setError('No subscribers found to send newsletter to');
        setLoading(false);
        return;
      }

      // Prepare the newsletter data in the format the backend expects
      // Send multilingual data to backend
      const newsletterData = {
        subject_pt: newsletterForm.subject_pt,
        subject_en: newsletterForm.subject_en,
        message_pt: newsletterForm.message_pt,
        message_en: newsletterForm.message_en
      };

      console.log('Sending newsletter data:', newsletterData);

      const response = await axiosInstance.post('/api/newsletter/send', newsletterData);
      console.log('Newsletter response:', response.data);
      console.log('Recipient count:', response.data.recipientCount);
      console.log('Recipient count type:', typeof response.data.recipientCount);
      
      // Ensure we have a valid count
      const recipientCount = response.data.recipientCount || 0;
      console.log('Final recipient count:', recipientCount);
      
      // Create custom success message with count
      const successMessage = i18n.language === 'pt' 
        ? `Newsletter enviada com sucesso para ${recipientCount} assinantes!`
        : `Newsletter sent successfully to ${recipientCount} subscribers!`;
      
      console.log('Custom success message:', successMessage);
      
      showNotification('success', t('admin.success.successTitle'), successMessage);
      setNewsletterForm({ subject_pt: '', subject_en: '', message_pt: '', message_en: '' });
    } catch (error) {
      console.error('Newsletter submission error:', error);
      if (error.response) {
        console.error('Response error data:', error.response.data);
        console.error('Response error status:', error.response.status);
        const errorMessage = error.response.data.message || 'Failed to send newsletter';
        showNotification('error', t('admin.errors.errorTitle'), errorMessage);
      } else if (error.request) {
        console.error('Request error:', error.request);
        showNotification('error', t('admin.errors.errorTitle'), 'Network error - please check your connection');
      } else {
        console.error('Error message:', error.message);
        showNotification('error', t('admin.errors.errorTitle'), error.message || 'Failed to send newsletter');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    // Prevent more than 4 active offers (add or edit)
    let activeOffersCount = offers.filter(o => o.isActive).length;
    // If editing, exclude the current offer from the count if it is active
    if (offerForm.id) {
      const editingOffer = offers.find(o => o._id === offerForm.id);
      if (editingOffer && editingOffer.isActive && !offerForm.isActive) {
        // Allow deactivation
        activeOffersCount -= 1;
      }
      if (
        offerForm.isActive &&
        (!editingOffer || !editingOffer.isActive) &&
        activeOffersCount >= 4
      ) {
        setError(t('admin.errors.maxActiveOffersEdit'));
        setLoading(false);
        return;
      }
    } else {
      if (offerForm.isActive && activeOffersCount >= 4) {
        setError(t('admin.errors.maxActiveOffersAdd'));
        setLoading(false);
        return;
      }
    }

    console.log('Form submission - current offerForm state:', offerForm);
    console.log('Products array at submission:', offerForm.products);

    try {
      // Check if token exists
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError(t('admin.errors.notLoggedIn'));
        navigate('/admin/login');
        return;
      }

      // Validate required fields
      if (!offerForm.title_pt || !offerForm.title_en || !offerForm.description_pt || !offerForm.description_en || 
          !offerForm.discountPercentage || !offerForm.startDate || !offerForm.endDate) {
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
        setError(t('admin.errors.selectAtLeastOneProduct'));
        setLoading(false);
        return;
      }

      // Validate banner image for new offers only
      if (!offerForm.bannerImage && !offerForm.id && !offerForm.bannerImagePreview) {
        setError(t('admin.errors.uploadBannerImage'));
        setLoading(false);
        return;
      }

      const formData = new FormData();
      // Send multilingual data to backend
      formData.append('title_pt', offerForm.title_pt);
      formData.append('title_en', offerForm.title_en);
      formData.append('description_pt', offerForm.description_pt);
      formData.append('description_en', offerForm.description_en);
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
        setSuccessMessage(t('admin.success.offerUpdated'));
      } else {
        console.log('Creating new offer...');
        response = await axiosInstance.post('/api/offers', formData, config);
        setOffers([response.data, ...offers]);
        setSuccessMessage(t('admin.success.offerCreated'));
      }
      resetOfferForm();
    } catch (error) {
      console.error('Error in form submission:', error);
      if (error.response) {
        console.error('Response error data:', error.response.data);
        console.error('Response error status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        setError(error.response.data.message || t('admin.errors.failedToSaveOffer'));
      } else if (error.request) {
        console.error('Request error:', error.request);
        setError(t('admin.errors.networkError'));
      } else {
        console.error('Error message:', error.message);
        setError(error.message || t('admin.errors.failedToSaveOffer'));
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
        setError(t('admin.errors.invalidImageType'));
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setError(t('admin.errors.imageSizeTooLarge'));
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
    
    // Create the updated form state - map multilingual title/description to form fields
    const updatedForm = {
      id: offer._id,
      title_pt: offer.title?.pt || (typeof offer.title === 'string' ? offer.title : ''),
      title_en: offer.title?.en || (typeof offer.title === 'string' ? offer.title : ''),
      description_pt: offer.description?.pt || (typeof offer.description === 'string' ? offer.description : ''),
      description_en: offer.description?.en || (typeof offer.description === 'string' ? offer.description : ''),
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
      setSuccessMessage(t('admin.success.offerDeleted'));
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
      title_pt: '',
      title_en: '',
      description_pt: '',
      description_en: '',
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
    // Validation: all language fields required
    if (!productForm.name_pt.trim() || !productForm.name_en.trim() || !productForm.description_pt.trim() || !productForm.description_en.trim()) {
      setError(t('productForm.errorRequired'));
      setLoading(false);
      return;
    }
    const formData = new FormData();
    formData.append('name_pt', productForm.name_pt);
    formData.append('name_en', productForm.name_en);
    formData.append('description_pt', productForm.description_pt);
    formData.append('description_en', productForm.description_en);
    formData.append('price', productForm.price);
    formData.append('category', productForm.category);
    if (selectedProductImage) {
      formData.append('image', selectedProductImage); // backend expects 'image' for imageUrl
    }

    try {
      if (editingProduct) {
        await axiosInstance.put(`/api/products/${editingProduct._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const successMsg = t('productForm.successUpdate');
        console.log('Success message (update):', successMsg);
        setSuccessMessage(successMsg);
      } else {
        await axiosInstance.post('/api/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const successMsg = t('productForm.successAdd');
        console.log('Success message (add):', successMsg);
        setSuccessMessage(successMsg);
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
      name_pt: product.name?.pt || (typeof product.name === 'string' ? product.name : ''),
      name_en: product.name?.en || (typeof product.name === 'string' ? product.name : ''),
      description_pt: product.description?.pt || (typeof product.description === 'string' ? product.description : ''),
      description_en: product.description?.en || (typeof product.description === 'string' ? product.description : ''),
      price: product.price,
      category: product.category,
    });
    if (product.imageUrl) {
      setProductImagePreview(product.imageUrl);
    }
    setSelectedProductImage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setLoading(true);
      try {
        await axiosInstance.delete(`/api/products/${productId}`);
        setSuccessMessage(t('admin.success.productDeleted'));
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
      name_pt: '',
      name_en: '',
      description_pt: '',
      description_en: '',
      price: '',
      category: 'Foodstuffs',
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
      setSuccessMessage(t('admin.success.announcementCreated'));
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
      setSuccessMessage(t('admin.success.announcementUpdated'));
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
      setSuccessMessage(t('admin.success.announcementDeleted'));
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
      setSuccessMessage(t('admin.success.announcementsStatusUpdated', { 
        count: ids.length, 
        status: active ? 'activated' : 'deactivated' 
      }));
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
      setSuccessMessage(t('admin.success.announcementsDeleted', { count: ids.length }));
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // Update the product selection handler with debug logging
  const handleProductSelection = (productId, checked) => {
    setOfferForm(prevForm => {
      let updatedProducts = prevForm.products || [];
      if (checked) {
        if (updatedProducts.length >= 2) {
          // Show a message or prevent selection
          setError(t('admin.errors.maxTwoProducts'));
          return prevForm;
        }
        updatedProducts = [...updatedProducts, productId];
      } else {
        updatedProducts = updatedProducts.filter(id => id !== productId);
      }
      setError(''); // Clear error if any
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
          <h1>{t('admin.dashboard')}</h1>
          <button onClick={handleLogout} className="logout-button">
            <FaSignOutAlt /> {t('admin.logout')}
          </button>
        </div>
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <FaBox /> {t('admin.products')}
          </button>
          <button
            className={`tab-button ${activeTab === 'announcements' ? 'active' : ''}`}
            onClick={() => setActiveTab('announcements')}
          >
            <FaBullhorn /> {t('admin.announcements')}
          </button>
          <button
            className={`tab-button ${activeTab === 'offers' ? 'active' : ''}`}
            onClick={() => setActiveTab('offers')}
          >
            <FaGift /> {t('admin.weeklyOffers')}
          </button>
          <button
            className={`tab-button ${activeTab === 'newsletter' ? 'active' : ''}`}
            onClick={() => setActiveTab('newsletter')}
          >
            <FaNewspaper /> {t('admin.newsletter')}
          </button>
        </div>
      </div>

      {/* Notification Modal */}
      <NotificationModal notification={notification} onClose={hideNotification} />

      {loading ? (
        <div className="loading-spinner"></div>
      ) : (
        <>
          {activeTab === 'products' && (
            <div className="products-section">
              <div className="add-product-container">
                <h2>{editingProduct ? t('productForm.editTitle') : t('productForm.addTitle')}</h2>
                <form onSubmit={handleProductSubmit} className="product-form">
                  <div className="form-group">
                    <label htmlFor="name_pt">{t('productForm.namePT')}</label>
                    <input
                      type="text"
                      id="name_pt"
                      value={productForm.name_pt}
                      onChange={(e) => setProductForm({ ...productForm, name_pt: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="name_en">{t('productForm.nameEN')}</label>
                    <input
                      type="text"
                      id="name_en"
                      value={productForm.name_en}
                      onChange={(e) => setProductForm({ ...productForm, name_en: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="description_pt">{t('productForm.descriptionPT')}</label>
                    <textarea
                      id="description_pt"
                      value={productForm.description_pt}
                      onChange={(e) => setProductForm({ ...productForm, description_pt: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="description_en">{t('productForm.descriptionEN')}</label>
                    <textarea
                      id="description_en"
                      value={productForm.description_en}
                      onChange={(e) => setProductForm({ ...productForm, description_en: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="price">{t('productForm.price')}</label>
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
                    <label htmlFor="category">{t('productForm.category')}</label>
                    <select
                      id="category"
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      required
                    >
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
                  <div className="form-group">
                    <label htmlFor="imageUrl">{t('productForm.image')}</label>
                    <div className="image-upload-section">
                      <input
                        type="file"
                        id="imageUrl"
                        accept="image/*"
                        onChange={handleProductImageChange}
                        className="file-input"
                      />
                      <div className="image-upload-content">
                        <FaImage className="image-upload-icon" />
                        <p>{t('productForm.image')}</p>
                      </div>
                    </div>
                    {productImagePreview && (
                      <div className="image-preview">
                        <img src={productImagePreview} alt={t('productForm.imagePreviewAlt')} />
                      </div>
                    )}
                  </div>
                  <div className="form-buttons">
                    <button type="submit" className="submit-button" disabled={loading}>
                      {loading ? t('productForm.saving') : editingProduct ? t('productForm.save') : t('productForm.create')}
                    </button>
                    {editingProduct && (
                      <button
                        type="button"
                        className="cancel-button"
                        onClick={resetProductForm}
                      >
                        {t('productForm.cancel')}
                      </button>
                    )}
                  </div>
                </form>
              </div>
              <div className="products-list-container">
                <h2>{t('admin.productsList')}</h2>
                <div className="table-responsive">
                  <table className="products-table">
                    <thead>
                      <tr>
                        <th>{t('AdminProductList.images')}</th>
                        <th>{t('AdminProductList.name')}</th>
                        <th>{t('AdminProductList.category')}</th>
                        <th>{t('AdminProductList.price')}</th>
                        <th>{t('AdminProductList.edit')}/{t('AdminProductList.delete')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product._id}>
                          <td>
                            <img
                              src={product.imageUrl || 'placeholder.jpg'}
                              alt={getProductName(product)}
                              className="product-thumbnail"
                            />
                          </td>
                          <td>{getProductName(product)}</td>
                          <td>{product.category}</td>
                          <td>{product.price}</td>
                          <td>
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="edit-button"
                            >
                              <FaEdit /> {t('AdminProductList.edit')}
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className="delete-button"
                            >
                              <FaTrash /> {t('AdminProductList.delete')}
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
                <h2>{offerForm.id ? t('admin.editOffer') : t('admin.createWeeklyOffer')}</h2>
                <form onSubmit={handleOfferSubmit} className="offer-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="title_pt">{t('admin.offerTitle')} (Portuguese)</label>
                      <input
                        type="text"
                        id="title_pt"
                        value={offerForm.title_pt}
                        onChange={(e) => setOfferForm({ ...offerForm, title_pt: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="title_en">{t('admin.offerTitle')} (English)</label>
                      <input
                        type="text"
                        id="title_en"
                        value={offerForm.title_en}
                        onChange={(e) => setOfferForm({ ...offerForm, title_en: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="description_pt">{t('admin.offerDescription')} (Portuguese)</label>
                    <textarea
                      id="description_pt"
                      value={offerForm.description_pt}
                      onChange={(e) => setOfferForm({ ...offerForm, description_pt: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="description_en">{t('admin.offerDescription')} (English)</label>
                    <textarea
                      id="description_en"
                      value={offerForm.description_en}
                      onChange={(e) => setOfferForm({ ...offerForm, description_en: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="category">{t('admin.offerCategory')}</label>
                      <select
                        id="category"
                        value={offerForm.category}
                        onChange={(e) => setOfferForm({ ...offerForm, category: e.target.value })}
                        required
                      >
                        <option value="seasonal">{t('admin.offerCategories.seasonal')}</option>
                        <option value="clearance">{t('admin.offerCategories.clearance')}</option>
                        <option value="flash">{t('admin.offerCategories.flash')}</option>
                        <option value="bundle">{t('admin.offerCategories.bundle')}</option>
                        <option value="holiday">{t('admin.offerCategories.holiday')}</option>
                        <option value="other">{t('admin.offerCategories.other')}</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="startDate">{t('admin.offerStartDate')}</label>
                      <input
                        type="datetime-local"
                        id="startDate"
                        value={offerForm.startDate}
                        onChange={(e) => setOfferForm({ ...offerForm, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="endDate">{t('admin.offerEndDate')}</label>
                      <input
                        type="datetime-local"
                        id="endDate"
                        value={offerForm.endDate}
                        onChange={(e) => setOfferForm({ ...offerForm, endDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="discountPercentage">{t('admin.offerDiscount')}</label>
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
                      {t('admin.offerActive')}
                    </label>
                  </div>
                  <div className="form-group">
                    <label>{t('admin.selectProducts')}</label>
                    <div className="product-search-container">
                      <input
                        type="text"
                        placeholder={t('admin.searchProducts')}
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="product-search-input"
                      />
                      <div className="product-search-info">
                        <span className="total-count">
                          {filteredProducts.length} {t('admin.productsFound')}
                        </span>
                        <span className="selected-count">
                          {offerForm.products?.length || 0} {t('admin.selected')}
                        </span>
                      </div>
                    </div>
                    <div className="products-grid">
                      {filteredProducts.map(product => {
                        const isSelected = offerForm.products && offerForm.products.includes(product._id);
                        const disableCheckbox = !isSelected && offerForm.products && offerForm.products.length >= 2;
                        return (
                          <div key={product._id} className="product-checkbox">
                            <input
                              type="checkbox"
                              id={`product-${product._id}`}
                              checked={isSelected}
                              onChange={(e) => handleProductSelection(product._id, e.target.checked)}
                              disabled={disableCheckbox}
                            />
                            <label htmlFor={`product-${product._id}`}>
                              <img 
                                src={product.imageUrl || '/placeholder.jpg'} 
                                alt={getProductName(product)} 
                                className="product-thumbnail"
                              />
                              <span>{getProductName(product)}</span>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                    {filteredProducts.length === 0 && productSearch && (
                      <div className="no-products-found">
                        {t('admin.noProductsFound')}
                      </div>
                    )}
                    {offerForm.products && offerForm.products.length >= 2 && (
                      <div style={{ color: 'red', marginTop: '0.5rem', fontSize: '0.95rem' }}>
                        {t('admin.errors.maxTwoProducts')}
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="bannerImage">{t('admin.bannerImage')}</label>
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
                        <p>{t('admin.clickToUploadBanner')}</p>
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
                      {loading ? t('admin.saving') : offerForm.id ? t('admin.updateOffer') : t('admin.createOffer')}
                    </button>
                    {offerForm.id && (
                      <button type="button" className="cancel-button" onClick={resetOfferForm}>
                        {t('admin.cancel')}
                      </button>
                    )}
                  </div>
                </form>
              </div>
              <div className="offers-list-container">
                <h2>{t('admin.activeOffers')}</h2>
                <div className="table-responsive">
                  <table className="offers-table">
                    <thead>
                      <tr>
                        <th>{t('admin.offerTable.banner')}</th>
                        <th>{t('admin.offerTable.title')}</th>
                        <th>{t('admin.offerTable.category')}</th>
                        <th>{t('admin.offerTable.duration')}</th>
                        <th>{t('admin.offerTable.discount')}</th>
                        <th>{t('admin.offerTable.products')}</th>
                        <th>{t('admin.offerTable.status')}</th>
                        <th>{t('admin.offerTable.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {offers.map(offer => (
                        <tr key={offer._id}>
                          <td>
                            <img
                              src={offer.bannerImage}
                              alt={getOfferTitle(offer)}
                              className="offer-banner-thumbnail"
                            />
                          </td>
                          <td>
                            <div className="offer-title">{getOfferTitle(offer)}</div>
                            <div className="offer-description">{getOfferDescription(offer)}</div>
                          </td>
                          <td>
                            <span className="offer-category">
                              <FaTags className="icon" />
                              {getOfferCategory(offer.category)}
                            </span>
                          </td>
                          <td>
                            <div className="offer-dates">
                              <div><FaCalendar className="icon" /> {t('admin.offerTable.start')}: {new Date(offer.startDate).toLocaleDateString()}</div>
                              <div><FaCalendar className="icon" /> {t('admin.offerTable.end')}: {new Date(offer.endDate).toLocaleDateString()}</div>
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
                              {offer.products.length} {t('admin.offerTable.productsCount')}
                              <div className="products-preview">
                                {offer.products.map(product => (
                                  <img
                                    key={product._id}
                                    src={product.imageUrl}
                                    alt={getProductName(product)}
                                    title={getProductName(product)}
                                    className="product-mini-thumbnail"
                                  />
                                ))}
                              </div>
                            </div>
                          </td>
                          <td>
                            {offer.isActive ? (
                              <span className="status-badge active">
                                <FaToggleOn className="icon" /> {t('admin.offerTable.active')}
                              </span>
                            ) : (
                              <span className="status-badge inactive">
                                <FaToggleOff className="icon" /> {t('admin.offerTable.inactive')}
                              </span>
                            )}
                          </td>
                          <td>
                            <button
                              onClick={() => handleEditOffer(offer)}
                              className="edit-button"
                            >
                              <FaEdit /> {t('admin.edit')}
                            </button>
                            <button
                              onClick={() => handleDeleteOffer(offer._id)}
                              className="delete-button"
                            >
                              <FaTrash /> {t('admin.delete')}
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
                <h2>{t('admin.composeNewsletter')}</h2>
                <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="subject_pt">{t('admin.newsletterSubjectPT')}</label>
                      <input
                        type="text"
                        id="subject_pt"
                        value={newsletterForm.subject_pt}
                        onChange={(e) => setNewsletterForm({ ...newsletterForm, subject_pt: e.target.value })}
                        required
                        placeholder={t('admin.newsletterSubjectPTHint')}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="subject_en">{t('admin.newsletterSubjectEN')}</label>
                      <input
                        type="text"
                        id="subject_en"
                        value={newsletterForm.subject_en}
                        onChange={(e) => setNewsletterForm({ ...newsletterForm, subject_en: e.target.value })}
                        required
                        placeholder={t('admin.newsletterSubjectENHint')}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="message_pt">{t('admin.newsletterMessagePT')}</label>
                      <textarea
                        id="message_pt"
                        value={newsletterForm.message_pt}
                        onChange={(e) => setNewsletterForm({ ...newsletterForm, message_pt: e.target.value })}
                        required
                        placeholder={t('admin.newsletterMessagePTHint')}
                        rows="10"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="message_en">{t('admin.newsletterMessageEN')}</label>
                      <textarea
                        id="message_en"
                        value={newsletterForm.message_en}
                        onChange={(e) => setNewsletterForm({ ...newsletterForm, message_en: e.target.value })}
                        required
                        placeholder={t('admin.newsletterMessageENHint')}
                        rows="10"
                      />
                    </div>
                  </div>
                  <div className="form-buttons">
                    <button 
                      type="submit" 
                      className="submit-button"
                      disabled={loading}
                    >
                      {loading ? t('admin.sending') : t('admin.sendNewsletter')}
                    </button>
                  </div>
                </form>
              </div>
              <div className="newsletter-preview">
                <h3>{t('admin.preview')}</h3>
                
                {/* Portuguese Version */}
                <div className="preview-container">
                  <div className="preview-language-header">
                    <h4>🇵🇹 Português</h4>
                  </div>
                  <h2>{newsletterForm.subject_pt || t('admin.newsletterSubject')}</h2>
                  <div className="preview-content" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                    {newsletterForm.message_pt || t('admin.newsletterContentPlaceholder')}
                  </div>
                </div>

                {/* English Version */}
                <div className="preview-container">
                  <div className="preview-language-header">
                    <h4>🇺🇸 English</h4>
                  </div>
                  <h2>{newsletterForm.subject_en || t('admin.newsletterSubject')}</h2>
                  <div className="preview-content" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                    {newsletterForm.message_en || t('admin.newsletterContentPlaceholder')}
                  </div>
                </div>

                <div className="subscribers-info">
                  <h4>{t('admin.subscribers')}</h4>
                  <p>{t('admin.totalSubscribers')}: {subscribers.length}</p>
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