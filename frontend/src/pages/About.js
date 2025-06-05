import React from 'react';
import { FaShoppingBasket, FaHandshake, FaUsers, FaAward, FaHeart, FaStore } from 'react-icons/fa';
import './About.css';

// Import images
const heroImage = 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80';
const storeImage1 = 'https://images.unsplash.com/photo-1515706886582-54c73c5eaf41?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80';
const storeImage2 = 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80';
const teamImage = 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80';

function About() {
  return (
    <div className="about-page">
      <section className="about-hero" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${heroImage})` }}>
        <div className="container">
          <div className="hero-content">
            <h1>About Our Store</h1>
            <p>Your trusted partner in quality foodstuffs and drinks in Cabinda, Angola</p>
          </div>
        </div>
      </section>

      <div className="container">
        <section className="about-content">
          <div className="about-section story-section">
            <div className="text-content">
              <h2>Our Story</h2>
              <p>
                Founded in 2023, our retail shop has been serving the Cabinda community
                with high-quality foodstuffs and beverages. We started with a simple
                mission: to provide our customers with the best products at competitive
                prices while delivering exceptional service.
              </p>
            </div>
            <div className="image-gallery">
              <img src={storeImage1} alt="Our store front" className="gallery-img" />
              <img src={storeImage2} alt="Inside our store" className="gallery-img" />
            </div>
          </div>

          <div className="about-section mission-section">
            <div className="image-content">
              <img src={teamImage} alt="Our team" className="team-image" />
            </div>
            <div className="text-content">
              <h2>Our Mission</h2>
              <p>We are committed to excellence in every aspect of our business.</p>
              <ul className="mission-list">
                <li>
                  <FaShoppingBasket className="icon" />
                  <span>Providing high-quality products at competitive prices</span>
                </li>
                <li>
                  <FaHandshake className="icon" />
                  <span>Ensuring excellent customer service and satisfaction</span>
                </li>
                <li>
                  <FaUsers className="icon" />
                  <span>Supporting local communities and businesses</span>
                </li>
                <li>
                  <FaStore className="icon" />
                  <span>Maintaining the highest standards of food safety</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="about-section features-section">
            <h2>Why Choose Us?</h2>
            <div className="features-grid">
              <div className="feature" data-aos="fade-up">
                <FaAward className="feature-icon" />
                <h3>Quality Products</h3>
                <p>We carefully select our products from trusted suppliers to ensure the highest quality.</p>
              </div>
              <div className="feature" data-aos="fade-up" data-aos-delay="100">
                <FaShoppingBasket className="feature-icon" />
                <h3>Competitive Prices</h3>
                <p>We offer the best prices in the region with regular promotions and discounts.</p>
              </div>
              <div className="feature" data-aos="fade-up" data-aos-delay="200">
                <FaHandshake className="feature-icon" />
                <h3>Customer Service</h3>
                <p>Our friendly team is always ready to assist you with your inquiries via WhatsApp.</p>
              </div>
              <div className="feature" data-aos="fade-up" data-aos-delay="300">
                <FaStore className="feature-icon" />
                <h3>Convenience</h3>
                <p>Easy product browsing and inquiry process through our website.</p>
              </div>
            </div>
          </div>

          <div className="about-section values-section">
            <h2>Our Values</h2>
            <div className="values-grid">
              <div className="value" data-aos="fade-right">
                <FaAward className="value-icon" />
                <h3>Quality</h3>
                <p>We never compromise on the quality of our products.</p>
              </div>
              <div className="value" data-aos="fade-up">
                <FaHandshake className="value-icon" />
                <h3>Integrity</h3>
                <p>We conduct our business with honesty and transparency.</p>
              </div>
              <div className="value" data-aos="fade-left">
                <FaHeart className="value-icon" />
                <h3>Community</h3>
                <p>We are committed to serving and supporting our local community.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default About; 