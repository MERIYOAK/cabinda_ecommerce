import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Add your authentication logic here
  const isAuthenticated = localStorage.getItem('adminToken');

  if (!isAuthenticated) {
    // Redirect to login if there's no token
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute; 