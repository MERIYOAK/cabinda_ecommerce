import React from 'react';
import { useTranslation } from 'react-i18next';
import './MultilingualInput.css';

const MultilingualInput = ({
  name,
  values,
  onChange,
  type = 'text',
  required = false,
  error = null,
}) => {
  const { t } = useTranslation();

  const handleChange = (lang, value) => {
    onChange({
      ...values,
      [lang]: value
    });
  };

  return (
    <div className="multilingual-input">
      <div className="input-group">
        <label htmlFor={`${name}-en`}>
          🇺🇸 {t('English')}
          {required && <span className="required">*</span>}
        </label>
        <input
          type={type}
          id={`${name}-en`}
          value={values.en || ''}
          onChange={(e) => handleChange('en', e.target.value)}
          required={required}
          className={error ? 'error' : ''}
        />
      </div>

      <div className="input-group">
        <label htmlFor={`${name}-pt`}>
          🇵🇹 {t('Portuguese')}
          {required && <span className="required">*</span>}
        </label>
        <input
          type={type}
          id={`${name}-pt`}
          value={values.pt || ''}
          onChange={(e) => handleChange('pt', e.target.value)}
          required={required}
          className={error ? 'error' : ''}
        />
      </div>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default MultilingualInput; 