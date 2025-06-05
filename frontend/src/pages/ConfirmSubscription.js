import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config/api';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import './ConfirmSubscription.css';

function ConfirmSubscription() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('confirming'); // 'confirming', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmSubscription = async () => {
      const token = searchParams.get('token');
      if (!token) {
        setStatus('error');
        setMessage('Invalid confirmation link. Please try subscribing again.');
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/api/newsletter/confirm/${token}`);
        setStatus('success');
        setMessage(response.data.message);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Failed to confirm subscription. Please try again.');
      }
    };

    confirmSubscription();
  }, [searchParams]);

  const renderContent = () => {
    switch (status) {
      case 'confirming':
        return (
          <div className="confirming">
            <FaSpinner className="spinner" />
            <p>Confirming your subscription...</p>
          </div>
        );
      case 'success':
        return (
          <div className="success">
            <FaCheckCircle className="icon success" />
            <h2>Subscription Confirmed!</h2>
            <p>{message}</p>
            <a href="/" className="button">Return to Homepage</a>
          </div>
        );
      case 'error':
        return (
          <div className="error">
            <FaTimesCircle className="icon error" />
            <h2>Confirmation Failed</h2>
            <p>{message}</p>
            <a href="/" className="button">Return to Homepage</a>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="confirm-subscription">
      <div className="confirm-container">
        {renderContent()}
      </div>
    </div>
  );
}

export default ConfirmSubscription; 