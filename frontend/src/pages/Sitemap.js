import React from 'react';
import { Link } from 'react-router-dom';
import './Sitemap.css';
import { useTranslation } from 'react-i18next';

const Sitemap = () => {
  const { t } = useTranslation();
  const sitemapData = [
    {
      title: t('sitemap.mainPages'),
      links: [
        { name: t('navbar.home'), path: '/' },
        { name: t('navbar.products'), path: '/products' },
        { name: t('footer.aboutUs'), path: '/about' },
        { name: t('navbar.contact'), path: '/contact' }
      ]
    },
    {
      title: t('sitemap.productCategories'),
      links: [
        { name: t('products.foodstuffs'), path: '/products?category=Foodstuffs' },
        { name: t('products.household'), path: '/products?category=Household' },
        { name: t('products.beverages'), path: '/products?category=Beverages' },
        { name: t('products.electronics'), path: '/products?category=Electronics' },
        { name: t('products.constructionMaterials'), path: '/products?category=Construction Materials' },
        { name: t('products.plastics'), path: '/products?category=Plastics' },
        { name: t('products.cosmetics'), path: '/products?category=Cosmetics' },
        { name: t('products.powderDetergent'), path: '/products?category=Powder Detergent' },
        { name: t('products.liquidDetergent'), path: '/products?category=Liquid Detergent' },
        { name: t('products.juices'), path: '/products?category=Juices' },
        { name: t('products.dentalCare'), path: '/products?category=Dental Care' },
        { name: t('products.beef'), path: '/products?category=Beef' }
      ]
    },
    {
      title: t('sitemap.company'),
      links: [
        { name: t('footer.aboutUs'), path: '/about' },
        { name: t('navbar.contact'), path: '/contact' }
      ]
    }
  ];

  return (
    <div className="sitemap">
      <div className="container">
        <h1>{t('sitemap.title')}</h1>
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