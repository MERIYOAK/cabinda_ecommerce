import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../config/api';
import './Login.css';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FaUserShield } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const { t } = useTranslation();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [focused, setFocused] = useState({ email: false, password: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFocus = (e) => {
    setFocused(prev => ({ ...prev, [e.target.name]: true }));
  };

  const handleBlur = (e) => {
    setFocused(prev => ({ ...prev, [e.target.name]: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/admin/login`, credentials);
      localStorage.setItem('adminToken', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      navigate('/admin');
    } catch (error) {
      setError(error.response?.data?.message || t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card animate-fade-in">
        <div className="login-logo">
          <FaUserShield size={48} />
        </div>
        <h2>{t('login.title')}</h2>
        {loading && (
          <div className="loading-overlay">
            <LoadingSpinner 
              size="medium" 
              color="primary" 
              variant="circle"
              text={t('login.loggingIn')}
              showText={true}
            />
          </div>
        )}
        {!loading && (
          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
              <input
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="form-input"
                required
                autoComplete="username"
                placeholder={t('login.email')}
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="form-input"
                required
                autoComplete="current-password"
                placeholder={t('login.password')}
              />
            </div>
            <button type="submit" className="login-button">
              {t('login.loginBtn')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login; 