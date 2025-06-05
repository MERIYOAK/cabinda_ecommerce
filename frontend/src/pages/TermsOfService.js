import React from 'react';
import './TermsOfService.css';

const TermsOfService = () => {
  return (
    <div className="terms-of-service">
      <div className="container">
        <h1>Terms of Service</h1>
        <p className="last-updated">Last Updated: {new Date().toLocaleDateString()}</p>

        <section className="terms-section">
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using Cabinda Retail Shop's website and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
        </section>

        <section className="terms-section">
          <h2>2. Use of Services</h2>
          <p>You agree to use our services only for lawful purposes and in accordance with these Terms. You are prohibited from:</p>
          <ul>
            <li>Using the service for any illegal purpose</li>
            <li>Attempting to gain unauthorized access to our systems</li>
            <li>Interfering with other users' access to the service</li>
            <li>Submitting false or misleading information</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>3. Account Registration</h2>
          <p>To access certain features of our service, you may need to create an account. You agree to:</p>
          <ul>
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Promptly update any changes to your information</li>
            <li>Accept responsibility for all activities under your account</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>4. Products and Pricing</h2>
          <p>We strive to provide accurate product information and pricing. However:</p>
          <ul>
            <li>We reserve the right to modify prices without notice</li>
            <li>Products are subject to availability</li>
            <li>We may limit order quantities</li>
            <li>Product descriptions and images are for illustration purposes</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>5. Payment and Shipping</h2>
          <p>By making a purchase, you agree to:</p>
          <ul>
            <li>Provide valid payment information</li>
            <li>Pay all charges at the prices in effect</li>
            <li>Pay applicable shipping and handling charges</li>
            <li>Provide accurate shipping information</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>6. Returns and Refunds</h2>
          <p>Our return and refund policy allows you to:</p>
          <ul>
            <li>Return items within 30 days of receipt</li>
            <li>Receive a full refund for unused items</li>
            <li>Exchange damaged or defective items</li>
            <li>Request refunds through our customer service</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>7. Contact Information</h2>
          <p>For questions about these Terms of Service, please contact us at:</p>
          <div className="contact-info">
            <p>Email: terms@cabindaretail.com</p>
            <p>Phone: +244 123 456 789</p>
            <p>Address: Cabinda, Angola</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService; 