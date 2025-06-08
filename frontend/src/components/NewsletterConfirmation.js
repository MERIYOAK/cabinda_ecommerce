import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config/api';
import './NewsletterConfirmation.css';

const NewsletterConfirmation = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('confirming');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmSubscription = async () => {
      try {
        console.log('Confirming subscription with token:', token);
        
        const config = {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        };

        // Make sure to encode the token properly
        const encodedToken = encodeURIComponent(token);
        const response = await axios.get(
          `${API_URL}/api/newsletter/confirm/${encodedToken}`,
          config
        );

        console.log('Confirmation response:', response.data);
        
        setStatus('success');
        setMessage(response.data.message || 'Successfully confirmed your subscription!');
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } catch (error) {
        console.error('Confirmation error:', error.response || error);
        
        setStatus('error');
        const errorMessage = error.response?.data?.message || 
                           'Failed to confirm subscription. Please try subscribing again.';
        setMessage(errorMessage);
      }
    };

    if (token) {
      confirmSubscription();
    } else {
      setStatus('error');
      setMessage('Invalid confirmation link. Please try subscribing again.');
    }
  }, [token, navigate]);

  return (
    <div className="newsletter-confirmation">
      <div className="confirmation-card">
        {status === 'confirming' && (
          <>
            <div className="loading-spinner"></div>
            <h2>Confirming your subscription...</h2>
            <p>Please wait while we verify your email.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="success-icon">✓</div>
            <h2>Subscription Confirmed!</h2>
            <p>{message}</p>
            <p className="redirect-message">
              Redirecting to home page...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="error-icon">✕</div>
            <h2>Confirmation Failed</h2>
            <p>{message}</p>
            <button 
              className="home-button"
              onClick={() => navigate('/')}
            >
              Return to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default NewsletterConfirmation; 