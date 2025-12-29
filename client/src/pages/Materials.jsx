import React, { useState, useEffect } from 'react';
import { api } from '../utils/api.js';
import { useAuth } from '../utils/AuthContext.jsx';
import './Materials.css';

const Materials = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [materials, setMaterials] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadData, setUploadData] = useState({
    file: null,
    fileName: '',
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses/list');
      if (response.data.ok) {
        setCourses(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const fetchMaterials = async (courseCode) => {
    try {
      const response = await api.get(`/materials/course/${courseCode}`);
      if (response.data.ok) {
        setMaterials(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch materials:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadData({
          ...uploadData,
          file: reader.result,
          fileName: file.name,
          name: file.name.replace(/\.[^/.]+$/, ""),
          fileType: file.type,
          fileSize: file.size
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !uploadData.file) {
      alert('Please select a course and choose a file');
      return;
    }

    try {
      const response = await api.post(`/materials/course/${selectedCourse}`, uploadData);
      if (response.data.ok) {
        alert('Material uploaded successfully!');
        setShowUpload(false);
        setUploadData({ file: null, fileName: '', name: '', description: '' });
        fetchMaterials(selectedCourse);
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Upload failed');
    }
  };

  const handleDownload = async (materialId) => {
    try {
      const response = await api.get(`/materials/download/${materialId}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = materialId;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="materials-page">
      <div className="materials-header">
        <h1>Learning Materials</h1>
        <p>Access course resources and study materials</p>
      </div>

      <div className="materials-container">
        <div className="sidebar">
          <div className="course-selector">
            <h3>Select Course</h3>
            <select 
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                fetchMaterials(e.target.value);
              }}
            >
              <option value="">Choose a course...</option>
              {courses.map(course => (
                <option key={course.code} value={course.code}>
                  {course.code} - {course.title}
                </option>
              ))}
            </select>
          </div>

          {user?.role === 'admin' && (
            <div className="admin-section">
              <button onClick={() => setShowUpload(!showUpload)} className="btn-upload">
                + Upload Material
              </button>
              
              {showUpload && (
                <div className="upload-form">
                  <h4>Upload New Material</h4>
                  <form onSubmit={handleUpload}>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Material Name"
                      value={uploadData.name}
                      onChange={e => setUploadData({...uploadData, name: e.target.value})}
                    />
                    <textarea
                      placeholder="Description (optional)"
                      value={uploadData.description}
                      onChange={e => setUploadData({...uploadData, description: e.target.value})}
                    />
                    <div className="form-actions">
                      <button type="submit">Upload</button>
                      <button type="button" onClick={() => setShowUpload(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="main-content">
          {selectedCourse ? (
            <>
              <h2>Materials for {selectedCourse}</h2>
              {materials.length === 0 ? (
                <p>No materials available for this course</p>
              ) : (
                <div className="materials-grid">
                  {materials.map(material => (
                    <div key={material.id} className="material-card">
                      <div className="material-header">
                        <h4>{material.name}</h4>
                        <span className="file-size">
                          {(material.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <div className="material-body">
                        <p>{material.description}</p>
                        <div className="material-meta">
                          <span>Uploaded by: {material.uploadedBy}</span>
                          <span>Downloads: {material.downloads}</span>
                        </div>
                      </div>
                      <div className="material-footer">
                        <button onClick={() => handleDownload(material.id)}>
                          Download
                        </button>
                        {user?.role === 'admin' && (
                          <button className="btn-delete">Delete</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="welcome-message">
              <h3>Welcome to Learning Materials</h3>
              <p>Select a course from the sidebar to view available materials</p>
              <p>Only administrators can upload new materials</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Materials;
