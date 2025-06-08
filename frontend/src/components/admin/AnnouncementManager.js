import React, { useState } from 'react';
import { FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
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
  const announcementsArray = Array.isArray(announcements) ? announcements : [];

  const [selectedAnnouncements, setSelectedAnnouncements] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
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
    data.append('title', formData.title);
    data.append('content', formData.content);
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
      title: announcement.title,
      content: announcement.content,
      category: announcement.category,
      isImportant: announcement.isImportant,
      image: null,
      imagePreview: announcement.imageUrl
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
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

  const filteredAnnouncements = announcementsArray.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || announcement.category === filterCategory;
    const matchesStatus = showInactiveOnly ? !announcement.active : true;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="announcement-manager">
      <div className="announcement-form-container">
        <form onSubmit={handleSubmit} className="announcement-form">
          <h3>{editingId ? 'Edit Announcement' : 'Create New Announcement'}</h3>
          
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              {VALID_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
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
              Mark as Important
            </label>
          </div>

          <div className="form-group">
            <label>Image</label>
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              required={!editingId}
            />
            {formData.imagePreview && (
              <img 
                src={formData.imagePreview} 
                alt="Preview" 
                className="image-preview"
              />
            )}
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {editingId ? 'Update' : 'Create'} Announcement
            </button>
            {editingId && (
              <button type="button" onClick={resetForm}>
                Cancel
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
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {VALID_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <label>
              <input
                type="checkbox"
                checked={showInactiveOnly}
                onChange={(e) => setShowInactiveOnly(e.target.checked)}
              />
              Show Inactive Only
            </label>
          </div>

          {selectedAnnouncements.length > 0 && (
            <div className="batch-actions">
              <button 
                onClick={() => onBatchUpdateStatus(selectedAnnouncements, true)}
                className="activate-btn"
              >
                Activate Selected
              </button>
              <button 
                onClick={() => onBatchUpdateStatus(selectedAnnouncements, false)}
                className="deactivate-btn"
              >
                Deactivate Selected
              </button>
              <button 
                onClick={() => {
                  if (window.confirm('Delete selected announcements?')) {
                    onBatchDelete(selectedAnnouncements);
                    setSelectedAnnouncements([]);
                  }
                }}
                className="delete-btn"
              >
                Delete Selected
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
                <th>Image</th>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Important</th>
                <th>Actions</th>
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
                      alt={announcement.title} 
                      className="thumbnail"
                    />
                  </td>
                  <td>{announcement.title}</td>
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
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="edit-btn"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this announcement?')) {
                          onDeleteAnnouncement(announcement._id);
                        }
                      }}
                      className="delete-btn"
                    >
                      <FaTrash />
                    </button>
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