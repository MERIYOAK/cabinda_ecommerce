import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaGlobe, FaChevronDown } from 'react-icons/fa';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (language) => {
    i18n.changeLanguage(language);
    setIsOpen(false);
  };

  const getCurrentLanguageText = () => {
    return currentLang === 'pt' ? 'PT' : 'EN';
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'linear-gradient(90deg, #25d366 60%, #128c7e 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '25px',
          padding: '0.5rem 1rem',
          cursor: 'pointer',
          fontWeight: '500',
          transition: 'all 0.3s ease',
          boxShadow: '0 2px 8px rgba(37, 211, 102, 0.15)',
          fontSize: '0.9rem',
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'linear-gradient(90deg, #128c7e 60%, #075e54 100%)';
          e.target.style.boxShadow = '0 4px 16px rgba(37, 211, 102, 0.25)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'linear-gradient(90deg, #25d366 60%, #128c7e 100%)';
          e.target.style.boxShadow = '0 2px 8px rgba(37, 211, 102, 0.15)';
        }}
      >
        <FaGlobe style={{ fontSize: '1rem' }} />
        <span>{getCurrentLanguageText()}</span>
        <FaChevronDown 
          style={{ 
            fontSize: '0.8rem',
            transition: 'transform 0.3s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }} 
        />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            marginTop: '0.5rem',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            zIndex: 1000,
            minWidth: '120px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <button
            onClick={() => handleLanguageChange('pt')}
            style={{
              display: 'block',
              width: '100%',
              padding: '0.75rem 1rem',
              textAlign: 'left',
              border: 'none',
              background: currentLang === 'pt' ? 'rgba(37, 211, 102, 0.1)' : 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              color: currentLang === 'pt' ? '#25d366' : '#333',
              fontWeight: currentLang === 'pt' ? '600' : 'normal',
            }}
            onMouseEnter={(e) => {
              if (currentLang !== 'pt') {
                e.target.style.background = 'rgba(37, 211, 102, 0.1)';
                e.target.style.color = '#25d366';
              }
            }}
            onMouseLeave={(e) => {
              if (currentLang !== 'pt') {
                e.target.style.background = 'none';
                e.target.style.color = '#333';
              }
            }}
          >
            Português
          </button>
          <button
            onClick={() => handleLanguageChange('en')}
            style={{
              display: 'block',
              width: '100%',
              padding: '0.75rem 1rem',
              textAlign: 'left',
              border: 'none',
              background: currentLang === 'en' ? 'rgba(37, 211, 102, 0.1)' : 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              color: currentLang === 'en' ? '#25d366' : '#333',
              fontWeight: currentLang === 'en' ? '600' : 'normal',
            }}
            onMouseEnter={(e) => {
              if (currentLang !== 'en') {
                e.target.style.background = 'rgba(37, 211, 102, 0.1)';
                e.target.style.color = '#25d366';
              }
            }}
            onMouseLeave={(e) => {
              if (currentLang !== 'en') {
                e.target.style.background = 'none';
                e.target.style.color = '#333';
              }
            }}
          >
            English
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default LanguageSwitcher; 