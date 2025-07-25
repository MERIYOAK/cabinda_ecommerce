import React, { useState } from 'react';
import { FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaClock, FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';
import API_URL from '../config/api';
import './Contact.css';
import { useTranslation } from 'react-i18next';

// Environment variables for contact information
const CONTACT_ADDRESS = process.env.REACT_APP_CONTACT_ADDRESS || '123 Main Street, AFRI-CABINDA, Angola';
const CONTACT_PHONE = process.env.REACT_APP_CONTACT_PHONE || '+123 456 789';
const CONTACT_WHATSAPP = process.env.REACT_APP_WHATSAPP_NUMBER || '123456789';
const CONTACT_EMAIL = process.env.REACT_APP_CONTACT_EMAIL || 'info@retailshop.com';

const Contact = () => {
  const { t } = useTranslation();
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
    setStatus({ type: 'info', message: t('contact.sending') });

    try {
      // Send contact form data to backend
      const response = await axios.post(`${API_URL}/api/contact`, {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      });

      console.log('Contact form submitted successfully:', response.data);
      setStatus({
        type: 'success',
        message: t('contact.success')
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Contact form error:', error);
      setStatus({
        type: 'error',
        message: error.response?.data?.message || t('contact.error')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="hero-content">
          <h1>{t('contact.heroTitle')}</h1>
          <p>{t('contact.heroDesc')}</p>
        </div>
      </section>

      <div className="container">
        <div className="contact-content">
          <div className="contact-info" data-aos="fade-right">
            <h2>{t('contact.infoTitle')}</h2>
            <div className="info-items">
              <div className="info-item" data-aos="fade-up" data-aos-delay="100">
                <div className="icon-wrapper">
                  <FaMapMarkerAlt />
                </div>
                <div className="info-details">
                  <h3>{t('contact.visitUs')}</h3>
                  <p>{CONTACT_ADDRESS}</p>
                </div>
              </div>

              <div className="info-item" data-aos="fade-up" data-aos-delay="200">
                <div className="icon-wrapper">
                  <FaWhatsapp />
                </div>
                <div className="info-details">
                  <h3>WhatsApp</h3>
                  <p>{CONTACT_PHONE}</p>
                  <a href={`https://wa.me/${CONTACT_WHATSAPP}`} className="contact-link" target="_blank" rel="noopener noreferrer">
                    {t('contact.messageWhatsapp')}
                  </a>
                </div>
              </div>

              <div className="info-item" data-aos="fade-up" data-aos-delay="300">
                <div className="icon-wrapper">
                  <FaEnvelope />
                </div>
                <div className="info-details">
                  <h3>{t('contact.emailUs')}</h3>
                  <p>{CONTACT_EMAIL}</p>
                  <a href={`mailto:${CONTACT_EMAIL}`} className="contact-link">
                    {t('contact.sendEmail')}
                  </a>
                </div>
              </div>

              <div className="info-item" data-aos="fade-up" data-aos-delay="400">
                <div className="icon-wrapper">
                  <FaClock />
                </div>
                <div className="info-details">
                  <h3>{t('contact.openingHours')}</h3>
                  <p>{t('contact.hours')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-form" data-aos="fade-left">
            <div className="form-wrapper">
              <h2>{t('contact.formTitle')}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">{t('contact.name')}</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="form-control"
                      placeholder={t('contact.namePlaceholder')}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">{t('contact.email')}</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="form-control"
                      placeholder={t('contact.emailPlaceholder')}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">{t('contact.subject')}</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="form-control"
                    placeholder={t('contact.subjectPlaceholder')}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">{t('contact.message')}</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="form-control"
                    rows="5"
                    placeholder={t('contact.messagePlaceholder')}
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className={`submit-button ${isSubmitting ? 'submitting' : ''}`}
                  disabled={isSubmitting}
                >
                  <FaPaperPlane className="button-icon" />
                  <span>{isSubmitting ? t('contact.sendingBtn') : t('contact.sendBtn')}</span>
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