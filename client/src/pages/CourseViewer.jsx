import React, { useState, useEffect } from 'react';
import { api } from '../utils/api.js';
import './CourseViewer.css';

const CourseViewer = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [requestForm, setRequestForm] = useState({
    code: '',
    title: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    const filtered = courses.filter(course =>
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [searchTerm, courses]);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses/list');
      if (response.data.ok) {
        setCourses(response.data.data);
        setFilteredCourses(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseDetails = async (code) => {
    try {
      const response = await api.get(`/courses/${code}`);
      if (response.data.ok) {
        setSelectedCourse(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch course details:', error);
    }
  };

  const handleCourseClick = (course) => {
    fetchCourseDetails(course.code);
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!requestForm.code || !requestForm.title) {
      alert('Please enter both course code and title');
      return;
    }

    setRequesting(true);
    try {
      const response = await api.post('/courses/request', requestForm);
      if (response.data.ok) {
        alert('Course request submitted for admin approval');
        setRequestForm({ code: '', title: '' });
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit request');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  return (
    <div className="course-viewer">
      <div className="course-header">
        <h1>Course Catalog</h1>
        <p>Browse available courses and request new ones</p>
      </div>

      <div className="course-container">
        <div className="course-sidebar">
          <div className="search-section">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <div className="search-info">
              Found {filteredCourses.length} courses
            </div>
          </div>

          <div className="courses-list">
            {filteredCourses.map(course => (
              <div
                key={course.code}
                className={`course-item ${selectedCourse?.code === course.code ? 'selected' : ''}`}
                onClick={() => handleCourseClick(course)}
              >
                <div className="course-code">{course.code}</div>
                <div className="course-title">{course.title}</div>
                <div className="course-materials">
                  {course.materials?.length || 0} materials
                </div>
              </div>
            ))}
          </div>

          <div className="request-section">
            <h3>Request New Course</h3>
            <form onSubmit={handleRequestSubmit}>
              <input
                type="text"
                placeholder="Course Code (e.g., COMP101)"
                value={requestForm.code}
                onChange={(e) => setRequestForm({...requestForm, code: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Course Title"
                value={requestForm.title}
                onChange={(e) => setRequestForm({...requestForm, title: e.target.value})}
                required
              />
              <button type="submit" disabled={requesting}>
                {requesting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
            <p className="note">Course requests require admin approval</p>
          </div>
        </div>

        <div className="course-details">
          {selectedCourse ? (
            <>
              <div className="course-header-details">
                <h2>{selectedCourse.code} - {selectedCourse.title}</h2>
                <div className="course-actions">
                  <button className="btn-enroll">Add to Timetable</button>
                </div>
              </div>

              <div className="course-description">
                <h3>Description</h3>
                <p>{selectedCourse.description || 'No description available'}</p>
              </div>

              <div className="course-timetable">
                <h3>Timetable</h3>
                {selectedCourse.timetable?.length > 0 ? (
                  <table className="timetable-table">
                    <thead>
                      <tr>
                        <th>Day</th>
                        <th>Time</th>
                        <th>Room</th>
                        <th>Class No</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCourse.timetable.map((session, index) => (
                        <tr key={index}>
                          <td>{session.day}</td>
                          <td>{session.time}</td>
                          <td>{session.room}</td>
                          <td>{session.classNo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No timetable information available</p>
                )}
              </div>

              <div className="course-materials-section">
                <h3>Learning Materials</h3>
                {selectedCourse.materials?.length > 0 ? (
                  <div className="materials-list">
                    {selectedCourse.materials.map(material => (
                      <div key={material.id} className="material-item">
                        <div className="material-info">
                          <h4>{material.name}</h4>
                          <p>{material.description}</p>
                          <div className="material-meta">
                            <span>Size: {(material.size / 1024 / 1024).toFixed(2)} MB</span>
                            <span>Downloads: {material.downloads}</span>
                            <span>Uploaded: {new Date(material.uploadedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <button 
                          className="btn-download"
                          onClick={() => window.open(`/api/materials/download/${material.id}`, '_blank')}
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No materials available for this course</p>
                )}
              </div>
            </>
          ) : (
            <div className="no-course-selected">
              <h3>Select a course to view details</h3>
              <p>Click on any course from the list to see its timetable and materials</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseViewer;
