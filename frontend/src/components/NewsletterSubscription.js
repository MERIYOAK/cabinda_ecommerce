import React, { useState } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
import './NewsletterSubscription.css';

const NewsletterSubscription = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset status
    setMessage('');
    
    // Validate email
    if (!email || !validateEmail(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    try {
      setStatus('loading');
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: false
      };

      const response = await axios.post(
        `${API_URL}/api/newsletter/subscribe`,
        { email },
        config
      );

      setStatus('success');
      setMessage(response.data.message);
      setEmail(''); // Clear the input
    } catch (error) {
      setStatus('error');
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Failed to subscribe. Please try again later.');
      }
      console.error('Newsletter subscription error:', error);
    }
  };

  return (
    <div className="newsletter-subscription">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={status === 'loading'}
            className={status === 'error' ? 'error' : ''}
          />
          <button 
            type="submit" 
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>
        </div>
        
        {message && (
          <div className={`message ${status}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default NewsletterSubscription; 