import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import './Admin.css';

const Admin = () => {
  const location = useLocation();
  const isMainDashboard = location.pathname === '/admin';

  return (
    <div className="admin-dashboard">
      {isMainDashboard ? (
        <>
          <div className="admin-header">
            <h1>Admin Dashboard</h1>
          </div>
          <div className="admin-sections">
            <div className="admin-section">
              <h2>Products</h2>
              <div className="admin-actions">
                <Link to="/admin/products/new" className="action-button">
                  Add Product
                </Link>
                <button className="action-button">
                  Manage Products
                </button>
              </div>
            </div>
            <div className="admin-section">
              <h2>Orders</h2>
              <button className="action-button">
                View Orders
              </button>
            </div>
            <div className="admin-section">
              <h2>Users</h2>
              <button className="action-button">
                Manage Users
              </button>
            </div>
            <div className="admin-section">
              <h2>Settings</h2>
              <button className="action-button">
                Site Settings
              </button>
            </div>
          </div>
        </>
      ) : (
        <Outlet />
      )}
    </div>
  );
};

export default Admin; 