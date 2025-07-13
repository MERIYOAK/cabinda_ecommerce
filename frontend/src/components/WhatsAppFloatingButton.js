import React, { useState } from 'react';
import { FaWhatsapp, FaPhone, FaPlus } from 'react-icons/fa';
import './WhatsAppFloatingButton.css';

const WHATSAPP_NUMBER = process.env.REACT_APP_WHATSAPP_NUMBER || '244922706107';
const WHATSAPP_MESSAGE = 'Hello! I would like to know more about your products.';
const PHONE_NUMBER = `+${process.env.REACT_APP_WHATSAPP_NUMBER || '244922706107'}`;

const WhatsAppFloatingButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fab-container">
      {open && (
        <>
          <a
            href={`tel:${PHONE_NUMBER}`}
            className="fab-action fab-action-phone"
            aria-label="Call us"
            style={{ bottom: 110 }}
          >
            <FaPhone />
          </a>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fab-action fab-action-whatsapp"
            aria-label="Contact us on WhatsApp"
            style={{ bottom: 170 }}
          >
            <FaWhatsapp />
          </a>
        </>
      )}
      <button
        className={`fab-main fab-pulse${open ? ' open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Open contact options"
      >
        <FaPlus style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
      </button>
    </div>
  );
};

export default WhatsAppFloatingButton; 