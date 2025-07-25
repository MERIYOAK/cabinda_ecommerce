import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './ProductForm.css';
import LoadingSpinner from './LoadingSpinner';
import { useTranslation } from 'react-i18next';

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name_pt: '',
    name_en: '',
    description_pt: '',
    description_en: '',
    price: '',
    category: '',
    image: null,
    imagePreview: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add a timeout to hide loading overlay after 5 seconds (safeguard)
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => setLoading(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/products/${id}`);
      setFormData({
        name_pt: response.data.name_pt || '',
        name_en: response.data.name_en || '',
        description_pt: response.data.description_pt || '',
        description_en: response.data.description_en || '',
        price: response.data.price || '',
        category: response.data.category || '',
        image: response.data.imageUrl ? {
          name: response.data.imageUrl.split('/').pop(), // Extract filename
          size: 0, // No size for URL
          type: 'image/jpeg' // Assuming JPEG for URL
        } : null,
        imagePreview: response.data.imageUrl || ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation: all language fields required
    if (!formData.name_pt.trim() || !formData.name_en.trim() || !formData.description_pt.trim() || !formData.description_en.trim()) {
      setError('Please fill in all name and description fields in both languages.');
      return;
    }
    try {
      setLoading(true);
      const submitData = new FormData();
      submitData.append('name_pt', formData.name_pt);
      submitData.append('name_en', formData.name_en);
      submitData.append('description_pt', formData.description_pt);
      submitData.append('description_en', formData.description_en);
      submitData.append('price', formData.price);
      submitData.append('category', formData.category);
      if (formData.image) {
        submitData.append('image', formData.image);
      }
      if (id) {
        await axios.put(`/api/products/${id}`, submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await axios.post('/api/products', submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    console.log('File input changed', e.target.files);
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  return (
    <div className="product-form-container">
      <h2>{id ? t('productForm.editTitle') : t('productForm.addTitle')}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name_pt">{t('productForm.namePT')}</label>
          <input
            type="text"
            id="name_pt"
            name="name_pt"
            value={formData.name_pt}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="name_en">{t('productForm.nameEN')}</label>
          <input
            type="text"
            id="name_en"
            name="name_en"
            value={formData.name_en}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description_pt">{t('productForm.descriptionPT')}</label>
          <textarea
            id="description_pt"
            name="description_pt"
            value={formData.description_pt}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description_en">{t('productForm.descriptionEN')}</label>
          <textarea
            id="description_en"
            name="description_en"
            value={formData.description_en}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="price">{t('productForm.price')}</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
          />
        </div>
        <div className="form-group">
          <label htmlFor="category">{t('productForm.category')}</label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="image">{t('productForm.image')}</label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
          />
          {formData.imagePreview && (
            <div className="image-preview">
              <img src={formData.imagePreview} alt={t('productForm.imagePreviewAlt')} />
            </div>
          )}
        </div>
        <div className="form-actions">
          <button type="submit" className="submit-button">
            {id ? t('productForm.save') : t('productForm.create')}
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate('/admin')}
          >
            {t('productForm.cancel')}
          </button>
        </div>
        {error && <div className="error">{t(error)}</div>}
      </form>
      {loading && (
        <div className="loading-overlay">
          <LoadingSpinner 
            size="large" 
            color="primary" 
            variant="circle"
            text={t('productForm.saving')}
            showText={true}
          />
        </div>
      )}
    </div>
  );
};

export default ProductForm; 