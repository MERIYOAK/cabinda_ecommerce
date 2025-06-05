import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './WeeklyOffers.css';
import API_URL from '../config/api';
import LoadingSpinner from './LoadingSpinner';

function WeeklyOffers() {
  const [offers, setOffers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveOffers();
  }, []);

  const fetchActiveOffers = async () => {
    try {
      console.log('Fetching active offers from:', `${API_URL}/api/offers/public/active`);
      const response = await axios.get(`${API_URL}/api/offers/public/active`);
      console.log('Active offers response:', response.data);
      
      // Validate offers data
      if (!Array.isArray(response.data)) {
        console.error('Invalid offers data:', response.data);
        throw new Error('Invalid offers data received');
      }
      
      // Filter out offers with invalid product data
      const validOffers = response.data.filter(offer => {
        const isValid = offer && 
                       typeof offer === 'object' && 
                       Array.isArray(offer.products) &&
                       offer.products.every(product => 
                         product && typeof product === 'object' && product._id
                       );
        if (!isValid) {
          console.warn('Filtered out invalid offer:', offer);
        }
        return isValid;
      });

      setOffers(validOffers);
      setError('');
    } catch (err) {
      console.error('Error fetching offers:', err);
      setError(err.response?.data?.message || 'Failed to fetch offers');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to safely format price
  const formatPrice = (price) => {
    if (typeof price !== 'number' || isNaN(price)) {
      console.warn('Invalid price value:', price);
      return '0.00';
    }
    return price.toFixed(2);
  };

  // Helper function to calculate sale price
  const calculateSalePrice = (originalPrice, discountPercentage) => {
    if (typeof originalPrice !== 'number' || typeof discountPercentage !== 'number' || 
        isNaN(originalPrice) || isNaN(discountPercentage)) {
      console.warn('Invalid price or discount:', { originalPrice, discountPercentage });
      return '0.00';
    }
    return (originalPrice * (1 - discountPercentage / 100)).toFixed(2);
  };

  return (
    <section className="weekly-offers">
      <h2>Weekly Special Offers</h2>
      {loading ? (
        <div className="loading-overlay">
          <LoadingSpinner size="large" color="primary" />
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : offers.length === 0 ? (
        <div>No special offers available</div>
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
                    alt={offer.title || 'Special Offer'}
                    onError={(e) => {
                      console.error('Failed to load offer image:', offer.bannerImage);
                      e.target.src = 'https://via.placeholder.com/800x400?text=Offer+Image';
                    }}
                  />
                  <div className="discount-badge">
                    {typeof offer.discountPercentage === 'number' 
                      ? `${offer.discountPercentage}% OFF` 
                      : 'Special Offer'}
                  </div>
                </div>
                <div className="offer-content">
                  <h3>{offer.title || 'Special Offer'}</h3>
                  <p>{offer.description || 'Check out our special offer!'}</p>
                  {validProducts.length > 0 && (
                    <div className="offer-products">
                      <h4>Featured Products:</h4>
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
                                alt={product.name || 'Product Image'}
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/200x200?text=Product+Image';
                                }}
                              />
                            </div>
                            <div className="product-info">
                              <h5>{product.name || 'Unnamed Product'}</h5>
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
                    <p>Valid from: {offer.startDate ? new Date(offer.startDate).toLocaleDateString() : 'N/A'}</p>
                    <p>Until: {offer.endDate ? new Date(offer.endDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default WeeklyOffers; 