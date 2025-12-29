import React, { useState, useEffect } from 'react';
import { api } from '../utils/api.js';
import { useAuth } from '../utils/AuthContext.jsx';
import './CourseEditor.css';

const CourseEditor = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    timetable: []
  });
  const [newSession, setNewSession] = useState({
    day: 'Mon',
    time: '09:00-11:00',
    room: '',
    classNo: '01'
  });
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setFormData({
      code: course.code,
      title: course.title,
      description: course.description || '',
      timetable: course.timetable || []
    });
    setEditMode(false);
  };

  const handleAddSession = () => {
    if (!newSession.day || !newSession.time || !newSession.room) {
      alert('Please fill all session fields');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      timetable: [...prev.timetable, { ...newSession }]
    }));
    
    setNewSession({
      day: 'Mon',
      time: '09:00-11:00',
      room: '',
      classNo: '01'
    });
  };

  const handleRemoveSession = (index) => {
    setFormData(prev => ({
      ...prev,
      timetable: prev.timetable.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await api.put(`/courses/${selectedCourse.code}`, formData);
      alert('Course updated successfully!');
      setEditMode(false);
      fetchCourses();
    } catch (error) {
      alert('Failed to update course');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="access-denied">
        <h2>Admin Access Required</h2>
        <p>Only administrators can edit courses.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  return (
    <div className="course-editor">
      <div className="editor-header">
        <h1>Course Editor</h1>
        <p>Edit course details and timetable (Admin only)</p>
      </div>

      <div className="editor-container">
        <div className="course-list">
          <h3>All Courses</h3>
          <div className="courses">
            {courses.map(course => (
              <div
                key={course.code}
                className={`course-item ${selectedCourse?.code === course.code ? 'selected' : ''}`}
                onClick={() => handleCourseSelect(course)}
              >
                <div className="course-code">{course.code}</div>
                <div className="course-title">{course.title}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="course-editor-main">
          {selectedCourse ? (
            <>
              <div className="editor-header-bar">
                <h2>
                  {editMode ? 'Edit' : 'View'} Course: {selectedCourse.code}
                </h2>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className={`edit-toggle-btn ${editMode ? 'cancel' : ''}`}
                >
                  {editMode ? 'Cancel Edit' : 'Edit Course'}
                </button>
              </div>

              {editMode ? (
                <form className="edit-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Course Code</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Course Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows="4"
                    />
                  </div>

                  <div className="timetable-section">
                    <h3>Timetable</h3>
                    <div className="add-session">
                      <div className="session-inputs">
                        <select
                          value={newSession.day}
                          onChange={(e) => setNewSession({...newSession, day: e.target.value})}
                        >
                          <option value="Mon">Monday</option>
                          <option value="Tue">Tuesday</option>
                          <option value="Wed">Wednesday</option>
                          <option value="Thu">Thursday</option>
                          <option value="Fri">Friday</option>
                          <option value="Sat">Saturday</option>
                        </select>
                        
                        <select
                          value={newSession.time}
                          onChange={(e) => setNewSession({...newSession, time: e.target.value})}
                        >
                          <option value="09:00-11:00">09:00-11:00</option>
                          <option value="11:00-13:00">11:00-13:00</option>
                          <option value="14:00-16:00">14:00-16:00</option>
                          <option value="16:00-18:00">16:00-18:00</option>
                          <option value="18:00-20:00">18:00-20:00</option>
                        </select>
                        
                        <input
                          type="text"
                          placeholder="Room"
                          value={newSession.room}
                          onChange={(e) => setNewSession({...newSession, room: e.target.value})}
                        />
                        
                        <input
                          type="text"
                          placeholder="Class No"
                          value={newSession.classNo}
                          onChange={(e) => setNewSession({...newSession, classNo: e.target.value})}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddSession}
                        className="add-btn"
                      >
                        Add Session
                      </button>
                    </div>

                    <div className="sessions-list">
                      {formData.timetable.map((session, index) => (
                        <div key={index} className="session-item">
                          <span>{session.day}</span>
                          <span>{session.time}</span>
                          <span>{session.room}</span>
                          <span>{session.classNo}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSession(index)}
                            className="remove-btn"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="save-btn">
                      Save Changes
                    </button>
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setEditMode(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="course-details">
                  <div className="detail-group">
                    <h3>Course Details</h3>
                    <p><strong>Code:</strong> {selectedCourse.code}</p>
                    <p><strong>Title:</strong> {selectedCourse.title}</p>
                    <p><strong>Description:</strong> {selectedCourse.description || 'No description'}</p>
                  </div>

                  <div className="detail-group">
                    <h3>Timetable</h3>
                    {selectedCourse.timetable?.length > 0 ? (
                      <table className="timetable">
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
                      <p>No timetable set</p>
                    )}
                  </div>

                  <div className="detail-group">
                    <h3>Materials</h3>
                    <p>{selectedCourse.materials?.length || 0} materials available</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="no-course-selected">
              <h3>Select a course to edit</h3>
              <p>Choose a course from the list on the left</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseEditor;
