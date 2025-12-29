import React, { useState, useEffect } from 'react';
import { api } from '../utils/api.js';
import { useAuth } from '../utils/AuthContext.jsx';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    major: '',
    gpa: '',
    dse_score: '',
    skills: '',
    year_of_study: '',
    about_me: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile/me');
      if (response.data.ok) {
        setProfile(response.data.data);
        setFormData({
          email: response.data.data.email || '',
          phone: response.data.data.phone || '',
          major: response.data.data.major || '',
          gpa: response.data.data.gpa || '',
          dse_score: response.data.data.dse_score || '',
          skills: Array.isArray(response.data.data.skills) 
            ? response.data.data.skills.join(', ') 
            : response.data.data.skills || '',
          year_of_study: response.data.data.year_of_study || '',
          about_me: response.data.data.about_me || ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const skillsArray = formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill);
      
      const response = await api.put('/profile/update', {
        ...formData,
        skills: skillsArray,
        year_of_study: parseInt(formData.year_of_study) || 1
      });
      
      if (response.data.ok) {
        alert('Profile updated successfully!');
        setEditMode(false);
        fetchProfile();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="error">Failed to load profile</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your personal information and preferences</p>
      </div>

      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="profile-card">
            <div className="profile-photo">
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt="Profile" />
              ) : (
                <div className="profile-initials">
                  {profile.sid?.charAt(0).toUpperCase()}
                </div>
              )}
              <button className="change-photo-btn">
                Change Photo
              </button>
            </div>
            <div className="profile-info">
              <h2>{profile.sid}</h2>
              <p className="profile-email">{profile.email}</p>
              <div className="profile-role">
                <span className={`role-badge ${profile.role}`}>
                  {profile.role}
                </span>
              </div>
              <div className="profile-credits">
                <span className="credits-label">Credits:</span>
                <span className="credits-value">{profile.credits || 0}</span>
              </div>
            </div>
          </div>

          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-label">Year of Study</span>
              <span className="stat-value">{profile.year_of_study || 'Not set'}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Major</span>
              <span className="stat-value">{profile.major || 'Not set'}</span>
            </div>
            {profile.gpa && (
              <div className="stat-item">
                <span className="stat-label">GPA</span>
                <span className="stat-value">{profile.gpa}</span>
              </div>
            )}
          </div>
        </div>

        <div className="profile-main">
          <div className="profile-actions">
            <button
              onClick={() => setEditMode(!editMode)}
              className={`edit-btn ${editMode ? 'cancel' : ''}`}
            >
              {editMode ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {editMode ? (
            <form className="profile-form" onSubmit={handleSubmit}>
              <div className="form-section">
                <h3>Basic Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="major">Major</label>
                    <input
                      type="text"
                      id="major"
                      name="major"
                      value={formData.major}
                      onChange={handleInputChange}
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="year_of_study">Year of Study</label>
                    <select
                      id="year_of_study"
                      name="year_of_study"
                      value={formData.year_of_study}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Year</option>
                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                      <option value="3">Year 3</option>
                      <option value="4">Year 4</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Academic Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="gpa">GPA</label>
                    <input
                      type="number"
                      id="gpa"
                      name="gpa"
                      value={formData.gpa}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      max="4"
                      placeholder="0.00 - 4.00"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="dse_score">DSE Score</label>
                    <input
                      type="text"
                      id="dse_score"
                      name="dse_score"
                      value={formData.dse_score}
                      onChange={handleInputChange}
                      placeholder="e.g., 5**5*555"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Skills & About</h3>
                <div className="form-group">
                  <label htmlFor="skills">Skills</label>
                  <input
                    type="text"
                    id="skills"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    placeholder="e.g., JavaScript, Python, Design"
                  />
                  <p className="help-text">Separate skills with commas</p>
                </div>
                
                <div className="form-group">
                  <label htmlFor="about_me">About Me</label>
                  <textarea
                    id="about_me"
                    name="about_me"
                    value={formData.about_me}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Tell others about yourself..."
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setEditMode(false);
                    fetchProfile();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-details">
              <div className="detail-section">
                <h3>Contact Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{profile.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">{profile.phone || 'Not set'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Academic Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Major</span>
                    <span className="detail-value">{profile.major || 'Not set'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Year of Study</span>
                    <span className="detail-value">
                      {profile.year_of_study ? `Year ${profile.year_of_study}` : 'Not set'}
                    </span>
                  </div>
                  {profile.gpa && (
                    <div className="detail-item">
                      <span className="detail-label">GPA</span>
                      <span className="detail-value">{profile.gpa}</span>
                    </div>
                  )}
                  {profile.dse_score && (
                    <div className="detail-item">
                      <span className="detail-label">DSE Score</span>
                      <span className="detail-value">{profile.dse_score}</span>
                    </div>
                  )}
                </div>
              </div>

              {profile.skills && profile.skills.length > 0 && (
                <div className="detail-section">
                  <h3>Skills</h3>
                  <div className="skills-list">
                    {Array.isArray(profile.skills) ? (
                      profile.skills.map((skill, index) => (
                        <span key={index} className="skill-tag">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="skill-tag">{profile.skills}</span>
                    )}
                  </div>
                </div>
              )}

              {profile.about_me && (
                <div className="detail-section">
                  <h3>About Me</h3>
                  <p className="about-text">{profile.about_me}</p>
                </div>
              )}

              <div className="detail-section">
                <h3>Account Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Member Since</span>
                    <span className="detail-value">
                      {new Date(profile.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Last Updated</span>
                    <span className="detail-value">
                      {new Date(profile.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
