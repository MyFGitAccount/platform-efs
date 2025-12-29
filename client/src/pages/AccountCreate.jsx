import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api.js';
import './AccountCreate.css';

const AccountCreate = () => {
  const [formData, setFormData] = useState({
    sid: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

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
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size must be less than 5MB');
        return;
      }
      
      setPhoto(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.sid || !formData.email || !formData.password) {
      setError('All fields are required');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    if (!photo) {
      setError('Student card photo is required');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Convert photo to base64
      const reader = new FileReader();
      reader.readAsDataURL(photo);
      reader.onloadend = async () => {
        const base64Photo = reader.result;
        
        const response = await api.post('/auth/register', {
          sid: formData.sid,
          email: formData.email,
          password: formData.password,
          photoData: base64Photo,
          fileName: photo.name
        });
        
        if (response.data.ok) {
          setSuccess(true);
          setFormData({
            sid: '',
            email: '',
            password: '',
            confirmPassword: ''
          });
          setPhoto(null);
          setPhotoPreview('');
        } else {
          setError(response.data.error || 'Registration failed');
        }
        setLoading(false);
      };
      
      reader.onerror = () => {
        setError('Failed to process photo');
        setLoading(false);
      };
      
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="success-container">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h2>Account Request Submitted!</h2>
          <p>Your account request has been sent for admin approval.</p>
          <p>You will receive an email once your account is approved.</p>
          <button 
            onClick={() => navigate('/login')}
            className="back-btn"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Create Account</h1>
          <p>Join EFS Platform for enhanced learning experience</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="sid">Student ID *</label>
              <input
                type="text"
                id="sid"
                name="sid"
                value={formData.sid}
                onChange={handleInputChange}
                placeholder="e.g., 12345678"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="student@example.com"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="At least 6 characters"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="photo">Student Card Photo *</label>
            <div className="photo-upload">
              <input
                type="file"
                id="photo"
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={loading}
                required
              />
              <div className="upload-label">
                {photo ? 'Change Photo' : 'Choose Photo'}
              </div>
            </div>
            <p className="help-text">Upload a clear photo of your student ID card (Max 5MB)</p>
            
            {photoPreview && (
              <div className="photo-preview">
                <img src={photoPreview} alt="Preview" />
                <p>{photo?.name}</p>
              </div>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="register-btn"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit for Approval'}
          </button>

          <div className="register-footer">
            <p>
              Already have an account?{' '}
              <button 
                type="button" 
                onClick={() => navigate('/login')}
                className="login-link"
              >
                Login here
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountCreate;
