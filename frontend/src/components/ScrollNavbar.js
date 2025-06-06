import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaWhatsapp } from 'react-icons/fa';
import './Navbar.css';
import shopLogo from '../images/shop-logo.jpg';

const ScrollNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const lastScrollYRef = useRef(0);
  const location = useLocation();
  const ticking = useRef(false);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;

    if (!ticking.current) {
      window.requestAnimationFrame(() => {
        setIsScrolled(currentScrollY > 50);
        
        if (currentScrollY > lastScrollYRef.current && currentScrollY > 150) {
          setIsHidden(true);
        } else {
          setIsHidden(false);
        }
        
        lastScrollYRef.current = currentScrollY;
        ticking.current = false;
      });

      ticking.current = true;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''} ${isHidden ? 'hidden' : ''}`}>
      <div className="navbar-container">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/" className="navbar-logo">
            <img src={shopLogo} alt="Shop Logo" className="nav-logo-img" />
            <span>Cabinda Shop</span>
          </Link>
        </div>

        <ul className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/products" className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`}>
              Products
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>
              About
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/contact" className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>
              Contact
            </Link>
          </li>
        </ul>

        <div className="nav-icons">
          <a 
            href="https://wa.me/+244999999999" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="whatsapp-link"
          >
            <FaWhatsapp />
          </a>
          <div className="mobile-menu-icon" onClick={toggleMobileMenu}>
            <FaBars />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ScrollNavbar; 