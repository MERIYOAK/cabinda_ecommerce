import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';
import './WeeklyOffers.css';
import API_URL from '../config/api';
import LoadingSpinner from './LoadingSpinner';
import { useTranslation } from 'react-i18next';

function WeeklyOffers() {
  const { t, i18n } = useTranslation();
  const [offers, setOffers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchActiveOffers();
  }, []);

  const fetchActiveOffers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/offers/public/active`);
      console.log('Fetched active offers:', response.data);
      
      // Check if response.data is an array (valid JSON) or HTML (error)
      if (Array.isArray(response.data)) {
        setOffers(response.data);
      } else if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        // API returned HTML instead of JSON (likely an error page)
        console.error('API returned HTML instead of JSON. This usually means the backend is not deployed or not accessible.');
        setError('Unable to load offers. Please try again later.');
        setOffers([]);
      } else {
        // Handle other unexpected response types
        console.error('Unexpected response format:', response.data);
        setError('Unable to load offers. Please try again later.');
        setOffers([]);
      }
    } catch (error) {
      console.error('Error fetching active offers:', error);
      
      // If API is not available, show a user-friendly message
      if (error.code === 'ERR_NETWORK' || error.response?.status === 404) {
        setError('Offers are currently unavailable. Please check back later.');
      } else {
        setError('Failed to load offers. Please check your connection and try again.');
      }
      
      setOffers([]); // Ensure offers is always an array
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return typeof price === 'number' ? price.toFixed(2) : '0.00';
  };

  const calculateSalePrice = (originalPrice, discountPercentage) => {
    if (typeof originalPrice !== 'number' || typeof discountPercentage !== 'number') {
      return '0.00';
    }
    const discount = originalPrice * (discountPercentage / 100);
    return (originalPrice - discount).toFixed(2);
  };

  const WHATSAPP_NUMBER = process.env.REACT_APP_WHATSAPP_NUMBER || '244922706107'; // Get from environment variable or use default
  const getWhatsAppMessage = (offer, products) => {
    let message = `${t('weeklyOffers.whatsappGreeting')} ${getOfferTitle(offer)}\n`;
    message += `${t('weeklyOffers.whatsappDetails')}: ${getOfferDescription(offer)}\n`;
    if (products && products.length > 0) {
      message += `${t('weeklyOffers.whatsappProducts')}:\n`;
      products.forEach((product, idx) => {
        message += `- ${getProductName(product)}\n`;
      });
    }
    return message;
  };

  return (
    <section className="weekly-offers">
      <div className="container">
        <h2>{t('weeklyOffers.title')}</h2>
        {loading && (
          <div className="loading-overlay">
            <LoadingSpinner 
              size="large" 
              color="primary" 
              variant="hexagon"
              text={t('weeklyOffers.loading')}
              showText={true}
            />
          </div>
        )}
        {error ? (
          <div className="error-message">{error}</div>
        ) : offers.length === 0 ? (
          <div className="no-offers">{t('weeklyOffers.noOffers')}</div>
        ) : (
          <div className="offers-grid">
            {offers.map(offer => {
              if (!offer || typeof offer !== 'object') {
                console.warn('Invalid offer object:', offer);
                return null;
              }

              // Filter out invalid products
              const validProducts = offer.products?.filter(product => 
                product && typeof product === 'object' && product._id
              ) || [];

              return (
                <div key={offer._id} className="offer-card">
                  <div className="offer-banner">
                    <img 
                      src={offer.bannerImage} 
                      alt={getOfferTitle(offer) || t('weeklyOffers.specialOffer')}
                      onError={(e) => {
                        console.error('Failed to load offer image:', offer.bannerImage);
                        e.target.src = 'https://via.placeholder.com/800x400?text=Offer+Image';
                      }}
                    />
                    <div className="discount-badge">
                      {typeof offer.discountPercentage === 'number' 
                        ? `${offer.discountPercentage}% ${t('weeklyOffers.off')}` 
                        : t('weeklyOffers.specialOffer')}
                    </div>
                  </div>
                  
                  <div className="offer-content">
                    <h3>{getOfferTitle(offer) || t('weeklyOffers.specialOffer')}</h3>
                    <p>{getOfferDescription(offer) || t('weeklyOffers.checkOutOffer')}</p>
                    {validProducts.length > 0 && (
                      <div className="offer-products">
                        <h4>{t('weeklyOffers.featuredProducts')}:</h4>
                        <div className="product-grid">
                          {validProducts.map(product => (
                            <Link 
                              key={product._id} 
                              to={`/products/${product._id}`}
                              className="product-item"
                            >
                              <div className="product-image">
                                <img 
                                  src={product.imageUrl || product.images?.[0]} 
                                  alt={getProductName(product) || t('weeklyOffers.productImage')}
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/200x200?text=Product+Image';
                                  }}
                                />
                              </div>
                              <div className="product-info">
                                <h5>{getProductName(product) || t('weeklyOffers.unnamedProduct')}</h5>
                                <div className="product-price">
                                  <span className="original-price">
                                    ${formatPrice(product.price)}
                                  </span>
                                  <span className="sale-price">
                                    ${calculateSalePrice(product.price, offer.discountPercentage)}
                                  </span>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="offer-dates">
                      <p>{t('weeklyOffers.validFrom')}: {offer.startDate ? new Date(offer.startDate).toLocaleDateString() : t('weeklyOffers.notAvailable')}</p>
                      <p>{t('weeklyOffers.until')}: {offer.endDate ? new Date(offer.endDate).toLocaleDateString() : t('weeklyOffers.notAvailable')}</p>
                    </div>
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(getWhatsAppMessage(offer, validProducts))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="whatsapp-offer-btn"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5em',
                        marginTop: '18px',
                        background: 'linear-gradient(90deg, #25d366 60%, #128c7e 100%)',
                        color: '#fff',
                        padding: '0.7em 1.5em',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '1.05rem',
                        textDecoration: 'none',
                        boxShadow: '0 2px 8px rgba(37, 211, 102, 0.10)',
                        transition: 'background 0.3s, box-shadow 0.3s, transform 0.2s',
                      }}
                    >
                      <FaWhatsapp style={{ fontSize: '1.3em' }} /> {t('weeklyOffers.buyViaWhatsapp')}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default WeeklyOffers; 