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
        const response = await axios.get(`${API_URL}/api/newsletter/confirm/${token}`);
        setStatus('success');
        setMessage(response.data.message);
        
        // Redirect to home page after 5 seconds
        setTimeout(() => {
          navigate('/');
        }, 5000);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Failed to confirm subscription');
      }
    };

    if (token) {
      confirmSubscription();
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
              You will be redirected to the home page in a few seconds...
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