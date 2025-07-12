import React, { useState } from 'react';
import axios from 'axios';
import { FaEnvelope, FaTimes, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import API_URL from '../config/api';
import './Newsletter.css';

function Newsletter() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationState, setValidationState] = useState('idle'); // 'idle', 'validating', 'invalid', 'valid'

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!validateEmail(email)) {
      setValidationState('invalid');
      setError(t('newsletter.invalidEmail'));
      return;
    }

    setIsLoading(true);
    setValidationState('validating');

    try {
      // First check the subscription status
      const statusResponse = await axios.get(`${API_URL}/api/newsletter/status/${email}`);
      
      if (statusResponse.data.status === 'subscribed') {
        setValidationState('invalid');
        setError(t('newsletter.alreadySubscribed'));
        return;
      }

      if (statusResponse.data.status === 'pending') {
        // Resend confirmation email
        await axios.post(`${API_URL}/api/newsletter/subscribe`, { email });
        setValidationState('valid');
        setMessage(t('newsletter.confirmationSent'));
        return;
      }

      // New subscription
      const subscribeResponse = await axios.post(`${API_URL}/api/newsletter/subscribe`, { email });
      setValidationState('valid');
      setMessage(subscribeResponse.data.message);
      setEmail('');
    } catch (err) {
      setValidationState('invalid');
      const errorMessage = err.response?.data?.message || t('newsletter.failedToSubscribe');
      setError(errorMessage);
      console.error('Newsletter subscription error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = () => {
    switch (validationState) {
      case 'validating':
        return null;
      case 'valid':
        return <FaCheck className="validation-icon success" />;
      case 'invalid':
        return <FaTimes className="validation-icon error" />;
      default:
        return <FaEnvelope className="input-icon" />;
    }
  };

  return (
    <div className="newsletter-container">
      <div className="newsletter-content">
        <h2>{t('newsletter.title')}</h2>
        <p>{t('newsletter.description')}</p>
        
        <form onSubmit={handleSubmit} className="newsletter-form">
          <div className={`input-group ${validationState}`}>
            <div className="input-wrapper">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setValidationState('idle');
                  setError('');
                  setMessage('');
                }}
                placeholder={t('newsletter.placeholder')}
                disabled={isLoading}
                required
              />
              {getIcon()}
            </div>
            <button 
              type="submit" 
              className={isLoading ? 'loading' : ''}
              disabled={isLoading}
            >
              {isLoading ? t('newsletter.sending') : t('newsletter.subscribe')}
            </button>
          </div>
          
          {error && (
            <div className="message error">
              <FaExclamationTriangle /> {error}
            </div>
          )}
          
          {message && (
            <div className="message success">
              <FaCheck /> {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Newsletter; 