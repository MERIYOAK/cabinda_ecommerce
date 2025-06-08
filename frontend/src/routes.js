import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Products from './pages/Products';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminLogin from './pages/admin/Login';
import Admin from './pages/admin/Admin';
import ProductForm from './components/ProductForm';
import ProtectedRoute from './components/ProtectedRoute';
import AnnouncementDetail from './pages/AnnouncementDetail';
import NewsletterConfirmation from './components/NewsletterConfirmation';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/announcement/:id" element={<AnnouncementDetail />} />
      <Route path="/newsletter/confirm/:token" element={<NewsletterConfirmation />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }
      >
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/edit/:id" element={<ProductForm />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes; 