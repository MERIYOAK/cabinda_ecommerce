import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaSignOutAlt } from 'react-icons/fa';
import OfferManager from '../components/OfferManager';
import './Admin.css';
import API_URL from '../config/api';

function Admin() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingAnnouncement, setIsEditingAnnouncement] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('products');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [newsletterForm, setNewsletterForm] = useState({
    subject: '',
    message: ''
  });

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    category: 'Promotion',
    isImportant: false,
    imageUrl: ''
  });

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'foodstuffs',
    stock: '',
    isOnSale: false,
    salePrice: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Verify token is valid
    const verifyToken = async () => {
      try {
        await axios.get(`${API_URL}/api/admin/verify`);
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    };
    
    verifyToken();
  }, [navigate]);

  useEffect(() => {
    fetchProducts();
    fetchSubscribers();
    fetchAnnouncements();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products`);
      setProducts(response.data.products);
      setLoading(false);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/admin/login');
      } else {
        console.error('Error fetching products:', error);
        setError('Failed to fetch products');
      }
      setLoading(false);
    }
  };

  const fetchSubscribers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/newsletter/subscribers`);
      setSubscribers(response.data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/admin/login');
      } else {
        console.error('Error fetching subscribers:', error);
        setError('Failed to fetch subscribers');
      }
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/announcements`);
      setAnnouncements(response.data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/admin/login');
      } else {
        console.error('Error fetching announcements:', error);
        setError('Failed to fetch announcements');
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

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
    if (selectedImage) {
      formData.append('image', selectedImage);
    }

    try {
      if (selectedProduct) {
        await axios.put(`${API_URL}/api/products/${selectedProduct._id}`, formData);
        setSuccessMessage('Product updated successfully!');
      } else {
        await axios.post(`${API_URL}/api/products`, formData);
        setSuccessMessage('Product added successfully!');
      }
      
      setProductForm({
        name: '',
        description: '',
        price: '',
        category: 'foodstuffs',
        stock: '',
        isOnSale: false,
        salePrice: ''
      });
      setSelectedImage(null);
      setImagePreview('');
      setIsEditing(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      setError(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      isOnSale: product.isOnSale,
      salePrice: product.salePrice || ''
    });
    setIsEditing(true);
    setImagePreview(product.images?.[0] || '');
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API_URL}/api/products/${productId}`);
        setSuccessMessage('Product deleted successfully!');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        setError('Failed to delete product');
      }
    }
  };

  const handleDeleteSubscriber = async (subscriberId) => {
    if (window.confirm('Are you sure you want to remove this subscriber?')) {
      try {
        await axios.delete(`${API_URL}/api/newsletter/subscribers/${subscriberId}`);
        setSuccessMessage('Subscriber deleted successfully!');
        fetchSubscribers();
      } catch (error) {
        console.error('Error deleting subscriber:', error);
        setError('Failed to delete subscriber');
      }
    }
  };

  const handleAnnouncementImageUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      let imageUrl = announcementForm.imageUrl;
      if (selectedImage) {
        imageUrl = await handleAnnouncementImageUpload(selectedImage);
      }

      const announcementData = {
        ...announcementForm,
        imageUrl
      };

      if (selectedAnnouncement) {
        await axios.put(`${API_URL}/api/announcements/${selectedAnnouncement._id}`, announcementData);
        setSuccessMessage('Announcement updated successfully!');
      } else {
        await axios.post(`${API_URL}/api/announcements`, announcementData);
        setSuccessMessage('Announcement added successfully!');
      }

      setAnnouncementForm({
        title: '',
        content: '',
        category: 'Promotion',
        isImportant: false,
        imageUrl: ''
      });
      setSelectedImage(null);
      setImagePreview('');
      setIsEditingAnnouncement(false);
      setSelectedAnnouncement(null);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      setError(error.response?.data?.message || 'Failed to save announcement');
    }
  };

  const handleEditAnnouncement = (announcement) => {
    setSelectedAnnouncement(announcement);
    setAnnouncementForm({
      title: announcement.title,
      content: announcement.content,
      category: announcement.category,
      isImportant: announcement.isImportant,
      imageUrl: announcement.imageUrl
    });
    setIsEditingAnnouncement(true);
    setImagePreview(announcement.imageUrl);
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await axios.delete(`${API_URL}/api/announcements/${announcementId}`);
        setSuccessMessage('Announcement deleted successfully!');
        fetchAnnouncements();
      } catch (error) {
        console.error('Error deleting announcement:', error);
        setError('Failed to delete announcement');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/admin/login');
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/newsletter/send`, newsletterForm);
      setSuccessMessage(`Newsletter sent successfully to ${response.data.recipientCount} subscribers!`);
      setNewsletterForm({
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending newsletter:', error);
      setError(error.response?.data?.message || 'Failed to send newsletter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="container">
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
              Products
            </button>
            <button
              className={`tab-button ${activeTab === 'announcements' ? 'active' : ''}`}
              onClick={() => setActiveTab('announcements')}
            >
              Announcements
            </button>
            <button
              className={`tab-button ${activeTab === 'newsletter' ? 'active' : ''}`}
              onClick={() => setActiveTab('newsletter')}
            >
              Newsletter
            </button>
            <button
              className={`tab-button ${activeTab === 'offers' ? 'active' : ''}`}
              onClick={() => setActiveTab('offers')}
            >
              Offers
            </button>
            <button
              className={`tab-button ${activeTab === 'subscribers' ? 'active' : ''}`}
              onClick={() => setActiveTab('subscribers')}
            >
              Subscribers
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        {activeTab === 'products' && (
          <div className="products-section">
            <div className="add-product-container">
              <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
              <form onSubmit={handleProductSubmit} className="product-form">
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
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="price">Price</label>
                  <div className="price-input-group">
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
                </div>
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    required
                  >
                    <option value="Foodstuffs">Foodstuffs</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Home & Living">Home & Living</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="stock">Stock</label>
                  <div className="stock-input-group">
                    <input
                      type="number"
                      id="stock"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      required
                      min="0"
                    />
                    <div className="stock-controls">
                      <button
                        type="button"
                        className="stock-control-button"
                        onClick={() => setProductForm(prev => ({ ...prev, stock: Number(prev.stock) + 1 }))}
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        className="stock-control-button"
                        onClick={() => setProductForm(prev => ({ ...prev, stock: Math.max(0, Number(prev.stock) - 1) }))}
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </div>
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="isOnSale"
                    checked={productForm.isOnSale}
                    onChange={(e) => setProductForm({ ...productForm, isOnSale: e.target.checked })}
                  />
                  <label htmlFor="isOnSale">On Sale</label>
                </div>
                {productForm.isOnSale && (
                  <div className="form-group">
                    <label htmlFor="salePrice">Sale Price</label>
                    <div className="price-input-group">
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
                  </div>
                )}
                <div className="form-group">
                  <label htmlFor="image">Product Image</label>
                  <input
                    type="file"
                    id="image"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="image-preview" />
                  )}
                </div>
                <div className="form-buttons">
                  <button type="submit" className="submit-button">
                    {isEditing ? 'Update Product' : 'Add Product'}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setProductForm({
                          name: '',
                          description: '',
                          price: '',
                          category: 'foodstuffs',
                          stock: '',
                          isOnSale: false,
                          salePrice: ''
                        });
                        setSelectedImage(null);
                        setImagePreview('');
                      }}
                      className="cancel-button"
                    >
                      Cancel Editing
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="products-list-container">
              <h2>Product List</h2>
              <div className="products-table-wrapper">
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product._id}>
                        <td>
                          <img
                            src={product.images?.[0] || 'placeholder.jpg'}
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
                          <button
                            onClick={() => handleEdit(product)}
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
            <div className="add-announcement-container">
              <h2>{isEditingAnnouncement ? 'Edit Announcement' : 'Add New Announcement'}</h2>
              <form onSubmit={handleAnnouncementSubmit} className="announcement-form">
                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    type="text"
                    id="title"
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="content">Content</label>
                  <textarea
                    id="content"
                    value={announcementForm.content}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    value={announcementForm.category}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, category: e.target.value })}
                    required
                  >
                    <option value="Promotion">Promotion</option>
                    <option value="New Arrival">New Arrival</option>
                    <option value="Event">Event</option>
                    <option value="Stock Update">Stock Update</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={announcementForm.isImportant}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, isImportant: e.target.checked })}
                    />
                    Mark as Important
                  </label>
                </div>
                <div className="form-group">
                  <label htmlFor="image">Announcement Image</label>
                  <input
                    type="file"
                    id="image"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="image-preview" />
                  )}
                </div>
                <div className="form-buttons">
                  <button type="submit" className="submit-button">
                    {isEditingAnnouncement ? 'Update Announcement' : 'Add Announcement'}
                  </button>
                  {isEditingAnnouncement && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingAnnouncement(false);
                        setSelectedAnnouncement(null);
                        setAnnouncementForm({
                          title: '',
                          content: '',
                          category: 'Promotion',
                          isImportant: false,
                          imageUrl: ''
                        });
                        setSelectedImage(null);
                        setImagePreview('');
                      }}
                      className="cancel-button"
                    >
                      Cancel Editing
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="announcements-list-container">
              <h2>Announcements List</h2>
              <div className="announcements-table-wrapper">
                <table className="announcements-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Important</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {announcements.map(announcement => (
                      <tr key={announcement._id}>
                        <td>
                          <img
                            src={announcement.imageUrl || 'placeholder.jpg'}
                            alt={announcement.title}
                            className="announcement-thumbnail"
                          />
                        </td>
                        <td>{announcement.title}</td>
                        <td>{announcement.category}</td>
                        <td>{announcement.isImportant ? 'Yes' : 'No'}</td>
                        <td>
                          <button
                            onClick={() => handleEditAnnouncement(announcement)}
                            className="edit-button"
                          >
                            <FaEdit /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAnnouncement(announcement._id)}
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
            </div>
          </div>
        )}

        {activeTab === 'offers' && <OfferManager />}

        {activeTab === 'subscribers' && (
          <div className="subscribers-section">
            <h2>Newsletter Subscribers</h2>
            <div className="subscribers-table-wrapper">
              <table className="subscribers-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Subscription Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map(subscriber => (
                    <tr key={subscriber._id}>
                      <td>{subscriber.email}</td>
                      <td>{new Date(subscriber.subscriptionDate).toLocaleDateString()}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteSubscriber(subscriber._id)}
                          className="delete-button"
                        >
                          <FaTrash /> Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin; 