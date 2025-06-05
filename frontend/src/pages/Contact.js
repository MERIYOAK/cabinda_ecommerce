import React, { useState } from 'react';
import { FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaClock, FaPaperPlane } from 'react-icons/fa';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [status, setStatus] = useState({
    type: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: 'info', message: 'Sending message...' });

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Form submitted:', formData);
      setStatus({
        type: 'success',
        message: 'Message sent successfully! We will get back to you soon.'
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Failed to send message. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="hero-content">
          <h1>Get in Touch</h1>
          <p>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </div>
      </section>

      <div className="container">
        <div className="contact-content">
          <div className="contact-info" data-aos="fade-right">
            <h2>Contact Information</h2>
            <div className="info-items">
              <div className="info-item" data-aos="fade-up" data-aos-delay="100">
                <div className="icon-wrapper">
                  <FaMapMarkerAlt />
                </div>
                <div className="info-details">
                  <h3>Visit Us</h3>
                  <p>123 Main Street<br />Cabinda, Angola</p>
                </div>
              </div>

              <div className="info-item" data-aos="fade-up" data-aos-delay="200">
                <div className="icon-wrapper">
                  <FaWhatsapp />
                </div>
                <div className="info-details">
                  <h3>WhatsApp</h3>
                  <p>+123 456 789</p>
                  <a href="https://wa.me/123456789" className="contact-link" target="_blank" rel="noopener noreferrer">
                    Message us on WhatsApp
                  </a>
                </div>
              </div>

              <div className="info-item" data-aos="fade-up" data-aos-delay="300">
                <div className="icon-wrapper">
                  <FaEnvelope />
                </div>
                <div className="info-details">
                  <h3>Email Us</h3>
                  <p>info@retailshop.com</p>
                  <a href="mailto:info@retailshop.com" className="contact-link">
                    Send us an email
                  </a>
                </div>
              </div>

              <div className="info-item" data-aos="fade-up" data-aos-delay="400">
                <div className="icon-wrapper">
                  <FaClock />
                </div>
                <div className="info-details">
                  <h3>Opening Hours</h3>
                  <p>Monday - Saturday: 9:00 AM - 8:00 PM<br />Sunday: 10:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-form" data-aos="fade-left">
            <div className="form-wrapper">
              <h2>Send us a Message</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="form-control"
                      placeholder="Your name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="form-control"
                      placeholder="Your email"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="form-control"
                    placeholder="Message subject"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="form-control"
                    rows="5"
                    placeholder="Your message"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className={`submit-button ${isSubmitting ? 'submitting' : ''}`}
                  disabled={isSubmitting}
                >
                  <FaPaperPlane className="button-icon" />
                  <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                </button>

                {status.message && (
                  <div className={`status-message ${status.type}`}>
                    {status.message}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 