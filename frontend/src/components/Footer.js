import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import './Footer.css';
import { useTranslation } from 'react-i18next';

// Environment variables for social media and company links
const FACEBOOK_URL = process.env.REACT_APP_FACEBOOK_URL || 'https://facebook.com';
const INSTAGRAM_URL = process.env.REACT_APP_INSTAGRAM_URL || 'https://instagram.com';
const TWITTER_URL = process.env.REACT_APP_TWITTER_URL || 'https://twitter.com';
const MERONI_URL = process.env.REACT_APP_MERONI_URL || 'https://www.meronvault.com';

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section about-section">
            <h3>{t('footer.aboutTitle')}</h3>
            <p>{t('footer.aboutDescription')}</p>
            <div className="social-links">
              <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="social-link">
                <FaFacebook />
              </a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="social-link">
                <FaInstagram />
              </a>
              <a href={TWITTER_URL} target="_blank" rel="noopener noreferrer" className="social-link">
                <FaTwitter />
              </a>
            </div>
          </div>

          <div className="footer-section links-section">
            <h3>{t('footer.quickLinks')}</h3>
            <ul className="footer-links">
              <li><Link to="/">{t('navbar.home')}</Link></li>
              <li><Link to="/products">{t('navbar.products')}</Link></li>
              <li><Link to="/about">{t('footer.aboutUs')}</Link></li>
              <li><Link to="/contact">{t('navbar.contact')}</Link></li>
              <li><Link to="/sitemap">{t('footer.sitemap')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p style={{ textAlign: 'center', width: '100%', margin: 0 }}>
            &copy; {new Date().getFullYear()} {t('footer.copyright')}
            <span style={{ marginLeft: '8px' }}>
              Powered by{' '}
              <a href={MERONI_URL} target="_blank" rel="noopener noreferrer">
                <span className="meroni-glow">MERONI</span>
              </a>
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 