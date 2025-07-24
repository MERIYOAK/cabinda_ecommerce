import React, { useEffect } from 'react';
import CookieConsent from 'react-cookie-consent';
import Cookies from 'js-cookie';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useTranslation, Trans } from 'react-i18next';

const COOKIE_KEY = 'cookieConsent';

// Helper to set consent in both cookie and localStorage
const setConsent = (value) => {
  Cookies.set(COOKIE_KEY, value, { expires: 365, sameSite: 'Lax' });
  localStorage.setItem(COOKIE_KEY, value);
};

// Helper to get consent from cookie or localStorage
const getConsent = () => {
  return Cookies.get(COOKIE_KEY) || localStorage.getItem(COOKIE_KEY);
};

const CookieConsentBanner = () => {
  const { darkMode } = useDarkMode();
  const { t } = useTranslation();

  useEffect(() => {
    // Sync cookie and localStorage on mount
    const consent = getConsent();
    if (consent) {
      Cookies.set(COOKIE_KEY, consent, { expires: 365, sameSite: 'Lax' });
      localStorage.setItem(COOKIE_KEY, consent);
    }
  }, []);

  // Site green: #007b45 (light), #004d29 (dark)
  const background = darkMode ? '#004d29' : '#007b45';
  const textColor = '#fff';
  const buttonStyle = {
    color: '#fff',
    background: darkMode ? '#339966' : '#4caf50',
    fontWeight: 'bold',
    borderRadius: 4,
    margin: '0 8px',
  };
  const declineButtonStyle = {
    color: '#fff',
    background: darkMode ? '#b71c1c' : '#f44336',
    fontWeight: 'bold',
    borderRadius: 4,
    margin: '0 8px',
  };

  return (
    <CookieConsent
      location="bottom"
      buttonText={t('cookieConsent.accept')}
      declineButtonText={t('cookieConsent.reject')}
      enableDeclineButton
      cookieName={COOKIE_KEY}
      style={{ background, color: textColor, fontSize: '1rem', zIndex: 9999, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
      buttonStyle={buttonStyle}
      declineButtonStyle={declineButtonStyle}
      onAccept={() => setConsent('accepted')}
      onDecline={() => setConsent('rejected')}
      expires={365}
    >
      <Trans i18nKey="cookieConsent.message">
        We use cookies to enhance your experience. By clicking 'Accept All', you consent to our use of cookies. Read our <a href="/privacy-policy" style={{ color: '#fff', textDecoration: 'underline' }}>Privacy Policy</a>.
      </Trans>
    </CookieConsent>
  );
};

export default CookieConsentBanner; 