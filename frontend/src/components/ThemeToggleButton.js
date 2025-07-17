import React from 'react';
import { useDarkMode } from '../contexts/DarkModeContext';

const buttonStyle = {
  position: 'fixed',
  top: '70px', // adjust as needed to be just below navbar
  right: '24px',
  zIndex: 2000,
  background: 'rgba(30,30,30,0.85)',
  color: '#fff',
  border: 'none',
  borderRadius: '50%',
  width: '48px',
  height: '48px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.5rem',
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  transition: 'background 0.3s',
  padding: 0,
};

export default function ThemeToggleButton() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  return (
    <button
      onClick={toggleDarkMode}
      style={buttonStyle}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? '🌙' : '☀️'}
    </button>
  );
} 