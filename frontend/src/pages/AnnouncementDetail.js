import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaClock, FaArrowLeft } from 'react-icons/fa';
import API_URL from '../config/api';
import './AnnouncementDetail.css';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTranslation } from 'react-i18next';

function AnnouncementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to safely get announcement title
  const getAnnouncementTitle = (announcement) => {
    if (typeof announcement.title === 'string') {
      return announcement.title;
    } else if (announcement.title && typeof announcement.title === 'object') {
      return announcement.title[i18n.language] || announcement.title.en || announcement.title.pt || '';
    }
    return '';
  };

  // Helper function to safely get announcement content
  const getAnnouncementContent = (announcement) => {
    if (typeof announcement.content === 'string') {
      return announcement.content;
    } else if (announcement.content && typeof announcement.content === 'object') {
      return announcement.content[i18n.language] || announcement.content.en || announcement.content.pt || '';
    }
    return '';
  };

  // Helper function to translate announcement category
  const getAnnouncementCategory = (category) => {
    const categoryKey = category.toLowerCase().replace(' ', '');
    return t(`announcementForm.categories.${categoryKey}`, category);
  };

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);

    const fetchAnnouncement = async () => {
      try {
        console.log('Fetching announcement:', `${API_URL}/api/announcements/public/${id}`);
        const response = await axios.get(`${API_URL}/api/announcements/public/${id}`);
        console.log('Announcement response:', response.data);
        setAnnouncement(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching announcement:', err);
        setError('Failed to fetch announcement details');
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [id]);

  const handleBack = () => {
    // Set the navigation type to 'back' for scroll restoration
    window.history.pushState({ type: 'back' }, '');
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <LoadingSpinner 
          size="large" 
          color="primary" 
          variant="wave"
          text={t('announcements.loading')}
          showText={true}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="error-message">
        <h2>Announcement Not Found</h2>
        <p>The announcement you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="announcement-detail">
      {loading && (
        <div className="loading-overlay">
          <LoadingSpinner 
            size="large" 
            color="primary" 
            variant="wave"
            text={t('announcements.loading')}
            showText={true}
          />
        </div>
      )}
      {error ? (
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="announcement-header">
            <button onClick={() => navigate(-1)} className="back-button">
              ← {t('common.back')}
            </button>
            <span className={`announcement-type ${announcement.category.toLowerCase().replace(' ', '-')}`}>
              {getAnnouncementCategory(announcement.category)}
            </span>
            <h1>{getAnnouncementTitle(announcement)}</h1>
            <div className="announcement-meta">
              <span className="date">
                <FaClock />
                <span>{new Date(announcement.date).toLocaleDateString()}</span>
              </span>
            </div>
          </div>
          
          {announcement.imageUrl && (
            <div className="announcement-image">
              <img 
                src={announcement.imageUrl} 
                alt={getAnnouncementTitle(announcement)}
                onError={(e) => {
                  console.error('Failed to load image:', announcement.imageUrl);
                  e.target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Found';
                }}
              />
            </div>
          )}
          
          <div className="announcement-content">
            <p>{getAnnouncementContent(announcement)}</p>
          </div>
        </>
      )}
    </div>
  );
}

export default AnnouncementDetail; 