import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaClock, FaArrowLeft } from 'react-icons/fa';
import API_URL from '../config/api';
import './AnnouncementDetail.css';
import LoadingSpinner from '../components/LoadingSpinner';

function AnnouncementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="announcement-detail-loading">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="announcement-detail-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={handleBack} className="back-button">
          <FaArrowLeft /> Back to Announcements
        </button>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="announcement-detail-not-found">
        <h2>Announcement Not Found</h2>
        <p>The announcement you're looking for doesn't exist.</p>
        <button onClick={handleBack} className="back-button">
          <FaArrowLeft /> Back to Announcements
        </button>
      </div>
    );
  }

  return (
    <div className="announcement-detail">
      {loading ? (
        <div className="loading-overlay">
          <LoadingSpinner size="large" color="primary" />
        </div>
      ) : error ? (
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="back-button">
            Go Back
          </button>
        </div>
      ) : announcement ? (
        <>
          <div className="announcement-header">
            <button onClick={() => navigate(-1)} className="back-button">
              ← Back
            </button>
            <span className={`announcement-type ${announcement.category.toLowerCase().replace(' ', '-')}`}>
              {announcement.category}
            </span>
            <h1>{announcement.title}</h1>
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
                alt={announcement.title}
                onError={(e) => {
                  console.error('Failed to load image:', announcement.imageUrl);
                  e.target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Found';
                }}
              />
            </div>
          )}
          
          <div className="announcement-content">
            <p>{announcement.content}</p>
          </div>
        </>
      ) : (
        <div className="not-found">
          <h2>Announcement Not Found</h2>
          <button onClick={() => navigate(-1)} className="back-button">
            Go Back
          </button>
        </div>
      )}
    </div>
  );
}

export default AnnouncementDetail; 