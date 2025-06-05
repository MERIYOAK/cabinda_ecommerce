import React from 'react';
import { Link } from 'react-router-dom';
import './Sitemap.css';

const Sitemap = () => {
  const sitemapData = [
    {
      title: 'Main Pages',
      links: [
        { name: 'Home', path: '/' },
        { name: 'Products', path: '/products' },
        { name: 'About Us', path: '/about' },
        { name: 'Contact', path: '/contact' }
      ]
    },
    {
      title: 'Product Categories',
      links: [
        { name: 'Electronics', path: '/products?category=electronics' },
        { name: 'Clothing', path: '/products?category=clothing' },
        { name: 'Home & Living', path: '/products?category=home-living' },
        { name: 'Books', path: '/products?category=books' }
      ]
    },
    {
      title: 'Customer Service',
      links: [
        { name: 'FAQ', path: '/faq' },
        { name: 'Shipping Information', path: '/shipping' },
        { name: 'Returns Policy', path: '/returns' },
        { name: 'Track Order', path: '/track-order' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', path: '/privacy-policy' },
        { name: 'Terms of Service', path: '/terms-of-service' },
        { name: 'Cookie Policy', path: '/cookie-policy' }
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', path: '/about' },
        { name: 'Careers', path: '/careers' },
        { name: 'Blog', path: '/blog' },
        { name: 'Contact Us', path: '/contact' }
      ]
    }
  ];

  return (
    <div className="sitemap">
      <div className="container">
        <h1>Sitemap</h1>
        <div className="sitemap-grid">
          {sitemapData.map((section, index) => (
            <div key={index} className="sitemap-section">
              <h2>{section.title}</h2>
              <ul>
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link to={link.path}>{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sitemap; 