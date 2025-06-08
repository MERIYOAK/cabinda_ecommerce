import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../config/api';
import './Login.css';
import LoadingSpinner from '../../components/LoadingSpinner';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/admin/login`, credentials);
      localStorage.setItem('adminToken', response.data.token);
      // Set the token in axios default headers for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      navigate('/admin');
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {loading ? (
        <div className="loading-overlay">
          <LoadingSpinner size="medium" color="primary" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="login-form">
          <h2>Admin Login</h2>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <input
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Password"
              required
            />
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      )}
    </div>
  );
};

export default Login; 