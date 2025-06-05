import React from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy">
      <div className="container">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last Updated: {new Date().toLocaleDateString()}</p>

        <section className="policy-section">
          <h2>1. Information We Collect</h2>
          <p>We collect information that you provide directly to us, including:</p>
          <ul>
            <li>Name and contact information</li>
            <li>Billing and shipping addresses</li>
            <li>Payment information</li>
            <li>Order history</li>
            <li>Communication preferences</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Process your orders and payments</li>
            <li>Send order confirmations and updates</li>
            <li>Provide customer support</li>
            <li>Send marketing communications (with your consent)</li>
            <li>Improve our services</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>3. Information Sharing</h2>
          <p>We may share your information with:</p>
          <ul>
            <li>Payment processors and shipping partners</li>
            <li>Service providers who assist our operations</li>
            <li>Law enforcement when required by law</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>4. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>5. Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
        </section>

        <section className="policy-section">
          <h2>6. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at:</p>
          <div className="contact-info">
            <p>Email: privacy@cabindaretail.com</p>
            <p>Phone: +244 123 456 789</p>
            <p>Address: Cabinda, Angola</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 