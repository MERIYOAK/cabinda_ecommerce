import React, { useEffect, useState } from 'react';

function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setShowPrompt(false);
        setDeferredPrompt(null);
      });
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 20, left: 0, right: 0, margin: 'auto', zIndex: 3000,
      background: '#232323', color: '#fff', padding: '1rem 2rem', borderRadius: 12, textAlign: 'center', maxWidth: 400,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12
    }}>
      <span style={{flex: 1}}>Install this app for a better experience!</span>
      <button
        onClick={handleInstallClick}
        style={{
          marginLeft: 8, background: '#25d366', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1.2rem', cursor: 'pointer'
        }}
      >
        Install
      </button>
      <button
        onClick={handleClose}
        aria-label="Close install prompt"
        style={{
          marginLeft: 8, background: 'transparent', color: '#fff', border: 'none', fontSize: 20, cursor: 'pointer', lineHeight: 1
        }}
      >
        ×
      </button>
    </div>
  );
}

export default InstallPwaPrompt; 