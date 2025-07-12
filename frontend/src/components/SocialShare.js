import React from 'react';
import { FaFacebook, FaTwitter, FaWhatsapp, FaLinkedin, FaTelegram, FaShare } from 'react-icons/fa';
import './SocialShare.css';

const SocialShare = ({ 
  url = window.location.href, 
  title = "AFRI-CABINDA - Premium Retail Shop", 
  description = "Discover premium products at AFRI-CABINDA. Your trusted retail destination for quality goods, exceptional service, and unbeatable prices!",
  image = "/shop-logo.jpg",
  showWhatsApp = true,
  showFacebook = true,
  showTwitter = true,
  showLinkedIn = false,
  showTelegram = false,
  className = ""
}) => {
  
  const shareData = {
    title: title,
    text: description,
    url: url
  };

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}&hashtags=AFRICABINDA,Retail,Quality`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} - ${description} ${url}`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
  };

  const handleShare = async (platform) => {
    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      // You can add a toast notification here
      alert('Link copied to clipboard!');
    } catch (error) {
      console.log('Error copying to clipboard:', error);
    }
  };

  return (
    <div className={`social-share ${className}`}>
      <div className="share-buttons">
        {showFacebook && (
          <button 
            className="share-button facebook"
            onClick={() => handleShare('facebook')}
            aria-label="Share on Facebook"
          >
            <FaFacebook />
          </button>
        )}
        
        {showTwitter && (
          <button 
            className="share-button twitter"
            onClick={() => handleShare('twitter')}
            aria-label="Share on Twitter"
          >
            <FaTwitter />
          </button>
        )}
        
        {showWhatsApp && (
          <button 
            className="share-button whatsapp"
            onClick={() => handleShare('whatsapp')}
            aria-label="Share on WhatsApp"
          >
            <FaWhatsapp />
          </button>
        )}
        
        {showLinkedIn && (
          <button 
            className="share-button linkedin"
            onClick={() => handleShare('linkedin')}
            aria-label="Share on LinkedIn"
          >
            <FaLinkedin />
          </button>
        )}
        
        {showTelegram && (
          <button 
            className="share-button telegram"
            onClick={() => handleShare('telegram')}
            aria-label="Share on Telegram"
          >
            <FaTelegram />
          </button>
        )}
        
        {navigator.share && (
          <button 
            className="share-button native"
            onClick={() => handleShare('native')}
            aria-label="Share"
          >
            <FaShare />
          </button>
        )}
        
        <button 
          className="share-button copy"
          onClick={copyToClipboard}
          aria-label="Copy link"
        >
          📋
        </button>
      </div>
    </div>
  );
};

export default SocialShare; 