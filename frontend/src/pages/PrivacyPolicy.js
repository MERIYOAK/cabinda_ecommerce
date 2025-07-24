import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  return (
    <div className="privacy-policy-page">
      <h1>{t('privacy.title')}</h1>
      <Trans i18nKey="privacy.intro">
        <p>Your privacy is important to us. This policy explains how we use cookies and handle your data on our website.</p>
      </Trans>
      <h2>{t('privacy.cookiesTitle')}</h2>
      <Trans i18nKey="privacy.cookies">
        <p>We use cookies to enhance your experience, analyze site usage, and provide relevant offers. You can accept or reject cookies at any time using the cookie banner.</p>
      </Trans>
      <h2>{t('privacy.dataTitle')}</h2>
      <Trans i18nKey="privacy.data">
        <p>We only collect personal data that you provide voluntarily, such as your email for newsletters or your WhatsApp number for inquiries. We do not share your data with third parties except as required by law.</p>
      </Trans>
      <h2>{t('privacy.rightsTitle')}</h2>
      <Trans i18nKey="privacy.rights">
        <p>You have the right to access, correct, or delete your personal data. Contact us if you have any questions about your privacy.</p>
      </Trans>
      <h2>{t('privacy.contactTitle')}</h2>
      <Trans i18nKey="privacy.contact">
        <p>If you have any questions about this policy, please contact us via the contact form or WhatsApp.</p>
      </Trans>
    </div>
  );
};

export default PrivacyPolicy; 