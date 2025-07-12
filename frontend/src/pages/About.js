import React from 'react';
import { FaShoppingBasket, FaHandshake, FaUsers, FaAward, FaHeart, FaStore } from 'react-icons/fa';
import './About.css';
import { useTranslation } from 'react-i18next';

// Import images
const heroImage =   require('../images/shop4.jpg');
const storeImage1 = require('../images/shop2.jpg');
const storeImage2 = require('../images/shop3.jpg');
const teamImage =   require('../images/shop6.jpg');

function About() {
  const { t } = useTranslation();
  return (
    <div className="about-page">
      <section className="about-hero" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${heroImage})` }}>
        <div className="container">
          <div className="hero-content">
            <h1>{t('about.heroTitle')}</h1>
            <p>{t('about.heroDesc')}</p>
          </div>
        </div>
      </section>

      <div className="container">
        <section className="about-content">
          <div className="about-section story-section">
            <div className="text-content">
              <h2>{t('about.storyTitle')}</h2>
              <p>{t('about.storyDesc')}</p>
            </div>
            <div className="image-gallery">
              <img src={storeImage1} alt={t('about.storeFrontAlt')} className="gallery-img" />
              <img src={storeImage2} alt={t('about.storeInsideAlt')} className="gallery-img" />
            </div>
          </div>

          <div className="about-section mission-section">
            <div className="image-content">
              <img src={teamImage} alt={t('about.teamAlt')} className="team-image" />
            </div>
            <div className="text-content">
              <h2>{t('about.missionTitle')}</h2>
              <p>{t('about.missionDesc')}</p>
              <ul className="mission-list">
                <li>
                  <FaShoppingBasket className="icon" />
                  <span>{t('about.mission1')}</span>
                </li>
                <li>
                  <FaHandshake className="icon" />
                  <span>{t('about.mission2')}</span>
                </li>
                <li>
                  <FaUsers className="icon" />
                  <span>{t('about.mission3')}</span>
                </li>
                <li>
                  <FaStore className="icon" />
                  <span>{t('about.mission4')}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="about-section features-section">
            <h2>{t('about.whyChooseUs')}</h2>
            <div className="features-grid">
              <div className="feature" data-aos="fade-up">
                <FaAward className="feature-icon" />
                <h3>{t('about.feature1Title')}</h3>
                <p>{t('about.feature1Desc')}</p>
              </div>
              <div className="feature" data-aos="fade-up" data-aos-delay="100">
                <FaShoppingBasket className="feature-icon" />
                <h3>{t('about.feature2Title')}</h3>
                <p>{t('about.feature2Desc')}</p>
              </div>
              <div className="feature" data-aos="fade-up" data-aos-delay="200">
                <FaHandshake className="feature-icon" />
                <h3>{t('about.feature3Title')}</h3>
                <p>{t('about.feature3Desc')}</p>
              </div>
              <div className="feature" data-aos="fade-up" data-aos-delay="300">
                <FaStore className="feature-icon" />
                <h3>{t('about.feature4Title')}</h3>
                <p>{t('about.feature4Desc')}</p>
              </div>
            </div>
          </div>

          <div className="about-section values-section">
            <h2>{t('about.valuesTitle')}</h2>
            <div className="values-grid">
              <div className="value" data-aos="fade-right">
                <FaAward className="value-icon" />
                <h3>{t('about.value1Title')}</h3>
                <p>{t('about.value1Desc')}</p>
              </div>
              <div className="value" data-aos="fade-up">
                <FaHandshake className="value-icon" />
                <h3>{t('about.value2Title')}</h3>
                <p>{t('about.value2Desc')}</p>
              </div>
              <div className="value" data-aos="fade-left">
                <FaHeart className="value-icon" />
                <h3>{t('about.value3Title')}</h3>
                <p>{t('about.value3Desc')}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default About; 