import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import DatabaseError from '../components/DatabaseError';

export default function ShowSchools() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const response = await fetch('/api/schools');
      if (!response.ok) {
        throw new Error('Failed to fetch schools');
      }
      const data = await response.json();
      setSchools(data);
    } catch (err) {
      console.error('Database error:', err);
      setError('Database connection failed. Please check your environment variables.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this school?')) return;
    try {
      const res = await fetch(`/api/schools?id=${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setSchools(schools.filter(school => school.id !== id));
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete school');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditClick = (school) => {
    setEditing(school.id);
    setFormData({ ...school });
  };

  const handleUpdate = async () => {
    try {
      const updateData = { ...formData };
      
      // Only upload if it's a new image (data URL)
      if (updateData.image && updateData.image.startsWith('data:image')) {
        setImageUploading(true);
        
        try {
          // Convert data URL to blob
          const response = await fetch(updateData.image);
          const blob = await response.blob();
          
          const uploadFormData = new FormData();
          uploadFormData.append('image', blob, 'school-image.jpg');
          
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: uploadFormData,
          });
          
          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.error || 'Failed to upload image');
          }
          
          const uploadResult = await uploadResponse.json();
          updateData.image = uploadResult.path; // Use path instead of URL for local storage
        } catch (uploadError) {
          setError('Image upload failed: ' + uploadError.message);
          setImageUploading(false);
          return;
        }
        
        setImageUploading(false);
      }
      
      const res = await fetch('/api/schools', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      
      if (res.ok) {
        setEditing(null);
        fetchSchools(); // Refresh the list
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update school');
      }
    } catch (err) {
      setError(err.message);
      setImageUploading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, GIF)');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, image: e.target.result });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to process image');
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: null });
  };

  const filteredSchools = schools.filter(school => {
    const matchesSearch = school.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = filterState ? school.state === filterState : true;
    return matchesSearch && matchesState;
  });

  const states = [...new Set(schools.map(school => school.state))].sort();

  // Check for database connection errors
  if (error && error.includes('Database connection')) {
    return <DatabaseError />;
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading schools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <Head>
        <title>Schools Directory</title>
        <meta name="description" content="Comprehensive directory of educational institutions" />
      </Head>

      {error && (
        <div className="error-message">
          <div className="error-content">
            <span className="error-icon">!</span>
            <div>
              <h3>Error</h3>
              <p>{error}</p>
            </div>
          </div>
          <button onClick={() => setError('')} className="dismiss-button">
            &times;
          </button>
        </div>
      )}

      <header className="page-header">
        <div className="header-content">
          <h1>Schools Directory</h1>
          <p>Discover and manage educational institutions</p>
        </div>
      </header>

      {editing ? (
        <div className="edit-mode-container">
          <div className="edit-form-wrapper">
            <div className="edit-form">
              <div className="edit-form-header">
                <h3>Edit Institution Information</h3>
                <button 
                  onClick={() => setEditing(null)}
                  className="close-edit-btn"
                >
                  &times;
                </button>
              </div>
              
              <div className="image-upload-section">
                <div className="current-image">
                  {formData.image ? (
                    <>
                      <img src={formData.image} alt="Institution preview" />
                      <button 
                        type="button" 
                        onClick={removeImage}
                        className="remove-image-btn"
                        disabled={imageUploading}
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <div className="no-image-preview">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 16L8.5 10.5L11 13.5L14.5 9L16 11L20 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      <p>No Image</p>
                    </div>
                  )}
                </div>
                
                <div className="upload-controls">
                  <label className="file-upload-label">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={imageUploading}
                    />
                    <span className="upload-button">
                      {imageUploading ? 'Uploading...' : 'Change Image'}
                    </span>
                  </label>
                  <p className="upload-hint">JPG, PNG or GIF (Max 5MB)</p>
                </div>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Schools Name *</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Institution Name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="institution@example.com"
                    required
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Address</label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Full address"
                  />
                </div>
                
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder="City"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    value={formData.state || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    placeholder="State"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Contact Number *</label>
                  <input
                    type="text"
                    value={formData.contact_number || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact_number: e.target.value,
                      })
                    }
                    placeholder="10-digit number"
                    required
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  className="cancel-button" 
                  onClick={() => setEditing(null)}
                  type="button"
                  disabled={imageUploading}
                >
                  Cancel
                </button>
                <button 
                  className="save-button" 
                  onClick={handleUpdate}
                  disabled={imageUploading}
                >
                  {imageUploading ? (
                    <>
                      <span className="button-spinner"></span>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 14L21 9L12 4L3 9L12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 12L3 9V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V9L15 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 12V18C9 18.5304 9.21071 19.0391 9.58579 19.4142C9.96086 19.7893 10.4696 20 11 20H13C13.5304 20 14.0391 19.7893 14.4142 19.4142C14.7893 19.0391 15 18.5304 15 18V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>{schools.length}</h3>
                <p>Total Schools</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>{filteredSchools.length}</h3>
                <p>Filtered Results</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>{states.length}</h3>
                <p>Regions Covered</p>
              </div>
            </div>
          </div>

          <div className="controls-section">
            <div className="search-filter-container">
              <div className="search-box">
                <span className="search-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search by Schools name or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <div className="filter-group">
                <select
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Regions</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="results-info">
              <span className="results-count">
                Displaying {filteredSchools.length} of {schools.length} Schools
              </span>
            </div>
          </div>

          {schools.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 14L21 9L12 4L3 9L12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 12L3 9V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V9L15 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 12V18C9 18.5304 9.21071 19.0391 9.58579 19.4142C9.96086 19.7893 10.4696 20 11 20H13C13.5304 20 14.0391 19.7893 14.4142 19.4142C14.7893 19.0391 15 18.5304 15 18V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2>No Schools found</h2>
              <p>Begin by adding the first Schools to the directory</p>
            </div>
          ) : filteredSchools.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2>No matching Schools found</h2>
              <p>Adjust your search criteria or filters</p>
              <button 
                onClick={() => { setSearchTerm(''); setFilterState(''); }}
                className="reset-filters-btn"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="schools-grid">
              {filteredSchools.map((school) => (
                <div key={school.id} className="school-card">
                  <div className="school-image">
                    {school.image ? (
                      <img src={school.image} alt={school.name} />
                    ) : (
                      <div className="no-image">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 14L21 9L12 4L3 9L12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M9 12L3 9V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V9L15 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M9 12V18C9 18.5304 9.21071 19.0391 9.58579 19.4142C9.96086 19.7893 10.4696 20 11 20H13C13.5304 20 14.0391 19.7893 14.4142 19.4142C14.7893 19.0391 15 18.5304 15 18V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                    <div className="school-status">Active</div>
                  </div>
                  
                  <div className="school-info">
                    <h2>{school.name}</h2>
                    <div className="school-details">
                      <div className="detail-item">
                        <span className="detail-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.657 16.657L13.414 20.9C13.039 21.2746 12.5306 21.485 12.0005 21.485C11.4704 21.485 10.962 21.2746 10.587 20.9L6.343 16.657C5.22422 15.5381 4.46234 14.1127 4.15369 12.5608C3.84504 11.009 4.00349 9.40047 4.60901 7.93868C5.21452 6.4769 6.2399 5.22749 7.55548 4.34846C8.87107 3.46943 10.4178 3.00024 12 3.00024C13.5822 3.00024 15.1289 3.46943 16.4445 4.34846C17.7601 5.22749 18.7855 6.4769 19.391 7.93868C19.9965 9.40047 20.155 11.009 19.8463 12.5608C19.5377 14.1127 18.7758 15.5381 17.657 16.657Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M15 11C15 11.7956 14.6839 12.5587 14.1213 13.1213C13.5587 13.6839 12.7956 14 12 14C11.2044 14 10.4413 13.6839 9.87868 13.1213C9.31607 12.5587 9 11.7956 9 11C9 10.2044 9.31607 9.44129 9.87868 8.87868C10.4413 8.31607 11.2044 8 12 8C12.7956 8 13.5587 8.31607 14.1213 8.87868C14.6839 9.44129 15 10.2044 15 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                        <span className="detail-text">
                          {school.address || 'Address not provided'}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 11.5C13.3807 11.5 14.5 10.3807 14.5 9C14.5 7.61929 13.3807 6.5 12 6.5C10.6193 6.5 9.5 7.61929 9.5 9C9.5 10.3807 10.6193 11.5 12 11.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                        <span className="detail-text">
                          {school.city || 'Unknown'}, {school.state || 'Unknown'}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 16.92V19.92C22 20.52 21.53 20.99 20.94 21.02C20.56 21.04 20.2 20.9 19.94 20.64L17.95 18.65C17.83 18.53 17.75 18.37 17.75 18.19V15.39C17.75 14.79 17.26 14.31 16.67 14.25C16.28 14.21 15.89 14.36 15.63 14.63L13.65 16.61C13.53 16.73 13.37 16.81 13.19 16.81H10.39C9.79 16.81 9.32 16.32 9.26 15.73C9.22 15.34 9.37 14.95 9.64 14.69L11.63 12.7C11.75 12.58 11.83 12.42 11.83 12.24V9.44C11.83 8.84 11.34 8.37 10.75 8.31C10.36 8.27 9.97 8.42 9.71 8.69L7.72 10.68C7.6 10.8 7.44 10.88 7.26 10.88H4.46C3.86 10.88 3.39 10.39 3.33 9.8C3.29 9.41 3.44 9.02 3.71 8.76L5.7 6.77C5.82 6.65 5.90 6.49 5.90 6.31V3.51C5.90 2.91 6.39 2.44 6.98 2.38C7.37 2.34 7.76 2.49 8.02 2.76L10.01 4.75C10.13 4.87 10.29 4.95 10.47 4.95H13.27C13.87 4.95 14.34 5.44 14.40 6.03C14.44 6.42 14.29 6.81 14.02 7.07L12.03 9.06C11.91 9.18 11.83 9.34 11.83 9.52V12.32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                        <span className="detail-text">
                          {school.contact_number || 'Not provided'}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                        <span className="detail-text">
                          {school.email || 'Not provided'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-actions">
                    <button 
                      className="edit-button" 
                      onClick={() => handleEditClick(school)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Edit
                    </button>
                    <button 
                      className="delete-button" 
                      onClick={() => handleDelete(school.id)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 6V4C8 3.46957 8.21071 3.96086 8.58579 3.58579C8.96086 3.21071 9.46957 3 10 3H14C14.5304 3 15.0391 3.21071 15.4142 3.58579C15.7893 3.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 30px 20px;
          font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
          color: #1f2937;
          min-height: 100vh;
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
        }
        
        .loading-spinner {
          border: 3px solid #f3f4f6;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }
        
        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 30px;
          color: #dc2626;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        
        .error-content {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        
        .error-icon {
          font-size: 20px;
          margin-top: 2px;
          font-weight: bold;
        }
        
        .error-content h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
        }
        
        .error-content p {
          margin: 0;
          font-size: 14px;
          opacity: 0.9;
        }
        
        .dismiss-button {
          background: none;
          border: none;
          font-size: 24px;
          color: #9ca3af;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.2s;
        }
        
        .dismiss-button:hover {
          background: #f3f4f6;
          color: #374151;
        }
        
        .page-header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .header-content h1 {
          font-size: 32px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 8px 0;
        }
        
        .header-content p {
          font-size: 18px;
          color: #6b7280;
          margin: 0;
        }
        
        .dashboard-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 16px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          background: #eff6ff;
          color: #3b82f6;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .stat-content h3 {
          font-size: 28px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 4px 0;
          line-height: 1;
        }
        
        .stat-content p {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }
        
        .controls-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          margin-bottom: 30px;
        }
        
        .search-filter-container {
          display: flex;
          gap: 16px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        
        .search-box {
          position: relative;
          flex: 1;
          min-width: 250px;
        }
        
        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
        }
        
        .search-input {
          width: 100%;
          padding: 12px 16px 12px 44px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        
        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .filter-group {
          min-width: 180px;
        }
        
        .filter-select {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 16px;
          background: white;
          cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        
        .filter-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .results-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid #f3f4f6;
        }
        
        .results-count {
          font-size: 14px;
          color: #6b7280;
        }
        
        .reset-filters-btn {
          background: #f3f4f6;
          color: #4b5563;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .reset-filters-btn:hover {
          background: #e5e7eb;
        }
        
        .schools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 24px;
        }
        
        .school-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex;
          flex-direction: column;
        }
        
        .school-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .school-image {
          position: relative;
          height: 180px;
          overflow: hidden;
        }
        
        .school-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }
        
        .school-card:hover .school-image img {
          transform: scale(1.05);
        }
        
        .no-image {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          color: #9ca3af;
        }
        
        .school-status {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(34, 197, 94, 0.9);
          color: white;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
        }
        
        .school-info {
          padding: 24px;
          flex: 1;
        }
        
        .school-info h2 {
          font-size: 20px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 16px 0;
          line-height: 1.3;
        }
        
        .school-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .detail-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        
        .detail-icon {
          color: #6b7280;
          margin-top: 2px;
          flex-shrink: 0;
        }
        
        .detail-text {
          font-size: 14px;
          color: 4b5563;
          line-height: 1.4;
        }
        
        .card-actions {
          padding: 0 24px 24px;
          display: flex;
          gap: 12px;
        }
        
        .edit-button, .delete-button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .edit-button {
          background: #eff6ff;
          color: #3b82f6;
        }
        
        .edit-button:hover {
          background: #dbeafe;
        }
        
        .delete-button {
          background: #fef2f2;
          color: #ef4444;
        }
        
        .delete-button:hover {
          background: #fee2e2;
        }
        
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .empty-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 20px;
          color: #d1d5db;
        }
        
        .empty-state h2 {
          font-size: 24px;
          font-weight: 600;
          color: #374151;
          margin: 0 0 12px 0;
        }
        
        .empty-state p {
          font-size: 16px;
          color: #6b7280;
          margin: 0 0 24px 0;
        }
        
        .edit-mode-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .edit-form-wrapper {
          padding: 24px;
        }
        
        .edit-form {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .edit-form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .edit-form-header h3 {
          font-size: 24px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }
        
        .close-edit-btn {
          background: none;
          border: none;
          font-size: 28px;
          color: #9ca3af;
          cursor: pointer;
          padding: 0;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.2s;
        }
        
        .close-edit-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }
        
        .image-upload-section {
          display: flex;
          gap: 24px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }
        
        .current-image {
          width: 200px;
          height: 150px;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
          flex-shrink: 0;
        }
        
        .current-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .no-image-preview {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          color: #9ca3af;
        }
        
        .no-image-preview p {
          margin: 8px 0 0 0;
          font-size: 14px;
        }
        
        .remove-image-btn {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: rgba(239, 68, 68, 0.9);
          color: white;
          border: none;
          border-radius: 4px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .remove-image-btn:hover {
          background: rgba(220, 38, 38, 0.9);
        }
        
        .upload-controls {
          flex: 1;
          min-width: 250px;
        }
        
        .file-upload-label {
          display: block;
          margin-bottom: 8px;
        }
        
        .file-upload-label input {
          display: none;
        }
        
        .upload-button {
          display: inline-block;
          background: #3b82f6;
          color: white;
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .upload-button:hover {
          background: #2563eb;
        }
        
        .upload-hint {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
        }
        
        .form-group.full-width {
          grid-column: 1 / -1;
        }
        
        .form-group label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
        }
        
        .form-group input {
          padding: 10px 14px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 16px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        
        .form-group input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          padding-top: 24px;
          border-top: 1px solid #f3f4f6;
        }
        
        .cancel-button, .save-button {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .cancel-button {
          background: #f3f4f6;
          color: #4b5563;
        }
        
        .cancel-button:hover {
          background: #e5e7eb;
        }
        
        .save-button {
          background: #3b82f6;
          color: white;
        }
        
        .save-button:hover {
          background: #2563eb;
        }
        
        .button-spinner {
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 20px 16px;
          }
          
          .header-content h1 {
            font-size: 28px;
          }
          
          .header-content p {
            font-size: 16px;
          }
          
          .search-filter-container {
            flex-direction: column;
          }
          
          .search-box, .filter-group {
            min-width: 100%;
          }
          
          .schools-grid {
            grid-template-columns: 1fr;
          }
          
          .image-upload-section {
            flex-direction: column;
          }
          
          .current-image {
            width: 100%;
            max-width: 300px;
            margin: 0 auto;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}