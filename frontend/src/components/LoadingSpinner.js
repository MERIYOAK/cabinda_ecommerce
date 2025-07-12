import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  variant = 'circle',
  text = '',
  showText = true 
}) => {
  const spinnerClass = `loading-spinner ${variant} ${color} ${size}`;
  
  return (
    <div className="loading-spinner-container">
      <div className={spinnerClass}>
        {variant === 'pulse' && (
          <div className="circle-spinner">
            <div className="circle"></div>
          </div>
        )}
        
        {variant === 'ring' && (
          <div className="ring-spinner">
            <div className="ring"></div>
            <div className="ring"></div>
            <div className="ring"></div>
          </div>
        )}
        
        {variant === 'wave' && (
          <div className="wave-spinner">
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
          </div>
        )}
        
        {variant === 'circle' && (
          <div className="circle-spinner">
            <div className="circle"></div>
          </div>
        )}
        
        {/* Note: 'dots' variant has been replaced with 'circle' (rolling spinner) */}
        
        {variant === 'hexagon' && (
          <div className="hexagon-spinner">
            <div className="hexagon"></div>
            <div className="hexagon"></div>
            <div className="hexagon"></div>
          </div>
        )}
      </div>
      
      {showText && text && (
        <div className="loading-text">
          {text}
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner; 