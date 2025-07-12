import React, { useState } from 'react';
import { FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import './AnnouncementManager.css';

const VALID_CATEGORIES = ['Promotion', 'New Arrival', 'Stock Update', 'Event', 'News'];

const AnnouncementManager = ({ 
  announcements = [],
  onCreateAnnouncement, 
  onUpdateAnnouncement, 
  onDeleteAnnouncement,
  onBatchUpdateStatus,
  onBatchDelete,
  loading 
}) => {
  const { t } = useTranslation();
  const announcementsArray = Array.isArray(announcements) ? announcements : [];

  const [selectedAnnouncements, setSelectedAnnouncements] = useState([]);
  const [formData, setFormData] = useState({
    title_pt: '',
    title_en: '',
    content_pt: '',
    content_en: '',
    category: 'Promotion',
    isImportant: false,
    image: null,
    imagePreview: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showInactiveOnly, setShowInactiveOnly] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title_pt', formData.title_pt);
    data.append('title_en', formData.title_en);
    data.append('content_pt', formData.content_pt);
    data.append('content_en', formData.content_en);
    data.append('category', formData.category);
    data.append('isImportant', formData.isImportant);
    if (formData.image) {
      data.append('image', formData.image);
    }

    if (editingId) {
      await onUpdateAnnouncement(editingId, data);
    } else {
      await onCreateAnnouncement(data);
    }

    resetForm();
  };

  const handleEdit = (announcement) => {
    setEditingId(announcement._id);
    setFormData({
      title_pt: announcement.title?.pt || (typeof announcement.title === 'string' ? announcement.title : ''),
      title_en: announcement.title?.en || (typeof announcement.title === 'string' ? announcement.title : ''),
      content_pt: announcement.content?.pt || (typeof announcement.content === 'string' ? announcement.content : ''),
      content_en: announcement.content?.en || (typeof announcement.content === 'string' ? announcement.content : ''),
      category: announcement.category,
      isImportant: announcement.isImportant,
      image: null,
      imagePreview: announcement.imageUrl
    });
  };

  const resetForm = () => {
    setFormData({
      title_pt: '',
      title_en: '',
      content_pt: '',
      content_en: '',
      category: 'Promotion',
      isImportant: false,
      image: null,
      imagePreview: ''
    });
    setEditingId(null);
    if (formData.imagePreview) {
      URL.revokeObjectURL(formData.imagePreview);
    }
  };

  const handleSelect = (id) => {
    setSelectedAnnouncements(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      return [...prev, id];
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedAnnouncements(filteredAnnouncements.map(a => a._id));
    } else {
      setSelectedAnnouncements([]);
    }
  };

  // Helper function to safely get announcement title
  const getAnnouncementTitle = (announcement) => {
    if (typeof announcement.title === 'string') {
      return announcement.title;
    } else if (announcement.title && typeof announcement.title === 'object') {
      return announcement.title.en || announcement.title.pt || '';
    }
    return '';
  };

  // Helper function to safely get announcement content
  const getAnnouncementContent = (announcement) => {
    if (typeof announcement.content === 'string') {
      return announcement.content;
    } else if (announcement.content && typeof announcement.content === 'object') {
      return announcement.content.en || announcement.content.pt || '';
    }
    return '';
  };

  const filteredAnnouncements = announcementsArray.filter(announcement => {
    const title = getAnnouncementTitle(announcement);
    const content = getAnnouncementContent(announcement);
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || announcement.category === filterCategory;
    const matchesStatus = showInactiveOnly ? !announcement.active : true;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="announcement-manager">
      <div className="announcement-form-container">
        <form onSubmit={handleSubmit} className="announcement-form">
          <h3>{editingId ? t('announcementForm.editTitle') : t('announcementForm.createTitle')}</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>{t('announcementForm.titlePT')}</label>
              <input
                type="text"
                value={formData.title_pt}
                onChange={(e) => setFormData({...formData, title_pt: e.target.value})}
                required
                placeholder={t('announcementForm.titlePTHint')}
              />
            </div>
            <div className="form-group">
              <label>{t('announcementForm.titleEN')}</label>
              <input
                type="text"
                value={formData.title_en}
                onChange={(e) => setFormData({...formData, title_en: e.target.value})}
                required
                placeholder={t('announcementForm.titleENHint')}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{t('announcementForm.contentPT')}</label>
              <textarea
                value={formData.content_pt}
                onChange={(e) => setFormData({...formData, content_pt: e.target.value})}
                required
                placeholder={t('announcementForm.contentPTHint')}
                rows="4"
              />
            </div>
            <div className="form-group">
              <label>{t('announcementForm.contentEN')}</label>
              <textarea
                value={formData.content_en}
                onChange={(e) => setFormData({...formData, content_en: e.target.value})}
                required
                placeholder={t('announcementForm.contentENHint')}
                rows="4"
              />
            </div>
          </div>

          <div className="form-group">
            <label>{t('announcementForm.category')}</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              {VALID_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{t(`announcementForm.categories.${cat.toLowerCase().replace(' ', '')}`)}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.isImportant}
                onChange={(e) => setFormData({...formData, isImportant: e.target.checked})}
              />
              {t('announcementForm.markAsImportant')}
            </label>
          </div>

          <div className="form-group">
            <label>{t('announcementForm.image')}</label>
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              required={!editingId}
            />
            {formData.imagePreview && (
              <img 
                src={formData.imagePreview} 
                alt={t('announcementForm.imagePreview')} 
                className="image-preview"
              />
            )}
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {editingId ? t('announcementForm.update') : t('announcementForm.create')} {t('announcementForm.announcement')}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm}>
                {t('announcementForm.cancel')}
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="announcements-list-container">
        <div className="list-controls">
          <div className="search-filter">
            <input
              type="text"
              placeholder={t('announcementList.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">{t('announcementList.allCategories')}</option>
              {VALID_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{t(`announcementForm.categories.${cat.toLowerCase().replace(' ', '')}`)}</option>
              ))}
            </select>
            <label>
              <input
                type="checkbox"
                checked={showInactiveOnly}
                onChange={(e) => setShowInactiveOnly(e.target.checked)}
              />
              {t('announcementList.showInactiveOnly')}
            </label>
          </div>

          {selectedAnnouncements.length > 0 && (
            <div className="batch-actions">
              <button 
                onClick={() => onBatchUpdateStatus(selectedAnnouncements, true)}
                className="activate-btn"
              >
                {t('announcementList.activateSelected')}
              </button>
              <button 
                onClick={() => onBatchUpdateStatus(selectedAnnouncements, false)}
                className="deactivate-btn"
              >
                {t('announcementList.deactivateSelected')}
              </button>
              <button 
                onClick={() => {
                  if (window.confirm(t('announcementList.confirmDeleteSelected'))) {
                    onBatchDelete(selectedAnnouncements);
                    setSelectedAnnouncements([]);
                  }
                }}
                className="delete-btn"
              >
                {t('announcementList.deleteSelected')}
              </button>
            </div>
          )}
        </div>

        <div className="announcements-list">
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedAnnouncements.length === filteredAnnouncements.length}
                  />
                </th>
                <th>{t('announcementList.image')}</th>
                <th>{t('announcementList.title')}</th>
                <th>{t('announcementList.category')}</th>
                <th>{t('announcementList.status')}</th>
                <th>{t('announcementList.important')}</th>
                <th>{t('announcementList.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredAnnouncements.map(announcement => (
                <tr key={announcement._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedAnnouncements.includes(announcement._id)}
                      onChange={() => handleSelect(announcement._id)}
                    />
                  </td>
                  <td>
                    <img 
                      src={announcement.imageUrl} 
                      alt={getAnnouncementTitle(announcement)} 
                      className="thumbnail"
                    />
                  </td>
                  <td>{getAnnouncementTitle(announcement)}</td>
                  <td>{announcement.category}</td>
                  <td>
                    {announcement.active ? (
                      <FaCheck className="status-icon active" />
                    ) : (
                      <FaTimes className="status-icon inactive" />
                    )}
                  </td>
                  <td>
                    {announcement.isImportant ? (
                      <FaCheck className="status-icon important" />
                    ) : (
                      <FaTimes className="status-icon" />
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleEdit(announcement)}
                        className="edit-btn"
                      >
                        <FaEdit style={{ marginRight: '0.4em' }} /> {t('announcementList.edit')}
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(t('announcementList.confirmDelete'))) {
                            onDeleteAnnouncement(announcement._id);
                          }
                        }}
                        className="delete-btn"
                      >
                        <FaTrash style={{ marginRight: '0.4em' }} /> {t('announcementList.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementManager; 