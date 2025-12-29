import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { api } from '../utils/api.js';
import { useAuth } from '../utils/AuthContext.jsx';
import './Calendar.css';

const Calendar = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchTimetable();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/calendar/courses');
      if (response.data.ok) {
        setCourses(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimetable = async () => {
    try {
      const response = await api.get('/calendar/mytimetable');
      if (response.data.ok) {
        setSelectedCourses(response.data.data);
        checkConflicts(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch timetable:', error);
    }
  };

  const toggleCourse = (course) => {
    const exists = selectedCourses.find(c => c.id === course.id);
    let newSelection;
    
    if (exists) {
      newSelection = selectedCourses.filter(c => c.id !== course.id);
    } else {
      newSelection = [...selectedCourses, course];
    }
    
    setSelectedCourses(newSelection);
    checkConflicts(newSelection);
  };

  const checkConflicts = (courses) => {
    const conflicts = [];
    
    for (let i = 0; i < courses.length; i++) {
      for (let j = i + 1; j < courses.length; j++) {
        const c1 = courses[i];
        const c2 = courses[j];
        
        if (c1.weekday === c2.weekday) {
          const start1 = timeToMinutes(c1.startTime);
          const end1 = timeToMinutes(c1.endTime);
          const start2 = timeToMinutes(c2.startTime);
          const end2 = timeToMinutes(c2.endTime);
          
          if (Math.max(start1, start2) < Math.min(end1, end2)) {
            conflicts.push({
              course1: `${c1.code} (${c1.classNo})`,
              course2: `${c2.code} (${c2.classNo})`,
              day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][c1.weekday],
              time: `${c1.startTime}-${c1.endTime}`,
              campus1: c1.campus,
              campus2: c2.campus
            });
          }
        }
      }
    }
    
    setConflicts(conflicts);
  };

  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  };

  const saveTimetable = async () => {
    if (!user?.sid) {
      alert('Please login to save timetable');
      return;
    }

    setSaving(true);
    try {
      await api.post('/calendar/save', {
        sid: user.sid,
        courses: selectedCourses
      });
      alert('Timetable saved successfully!');
    } catch (error) {
      alert('Failed to save timetable');
    } finally {
      setSaving(false);
    }
  };

  const exportAsPNG = () => {
    const element = document.getElementById('timetable-view');
    if (!element) return;

    html2canvas(element).then(canvas => {
      const link = document.createElement('a');
      link.download = `timetable-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  const getCourseColor = (courseCode) => {
    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
      '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
    ];
    
    let hash = 0;
    for (let i = 0; i < courseCode.length; i++) {
      hash = courseCode.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = Array.from({ length: 14 }, (_, i) => {
    const hour = 8 + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <h1>Timetable Planner</h1>
        <p>Drag and drop courses to create your perfect schedule</p>
        
        <div className="calendar-actions">
          <button 
            onClick={saveTimetable} 
            className="btn-save"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Timetable'}
          </button>
          <button onClick={exportAsPNG} className="btn-export">
            Export as PNG
          </button>
        </div>
      </div>

      <div className="calendar-container">
        <div className="course-selection">
          <h3>Available Courses</h3>
          <div className="search-box">
            <input type="text" placeholder="Search courses..." />
          </div>
          <div className="courses-list">
            {courses.map(course => (
              <div
                key={course.id}
                className={`course-item ${selectedCourses.find(c => c.id === course.id) ? 'selected' : ''}`}
                onClick={() => toggleCourse(course)}
                style={{ borderLeftColor: getCourseColor(course.code) }}
              >
                <div className="course-header">
                  <span className="course-code">{course.code}</span>
                  <span className="course-class">{course.classNo}</span>
                </div>
                <div className="course-title">{course.title}</div>
                <div className="course-details">
                  <span className="course-day">{course.day}</span>
                  <span className="course-time">{course.startTime} - {course.endTime}</span>
                  <span className="course-room">{course.room}</span>
                </div>
                <div className="course-campus">{course.campus}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="timetable-view">
          <div id="timetable-view" className="timetable">
            <div className="timetable-header">
              <div className="time-header">Time</div>
              {days.map(day => (
                <div key={day} className="day-header">{day}</div>
              ))}
            </div>
            
            <div className="timetable-body">
              {timeSlots.map(time => (
                <div key={time} className="time-row">
                  <div className="time-cell">{time}</div>
                  {days.map((day, dayIndex) => {
                    const dayCourses = selectedCourses.filter(course => 
                      course.weekday === dayIndex + 1 &&
                      timeToMinutes(course.startTime) <= timeToMinutes(time) &&
                      timeToMinutes(course.endTime) > timeToMinutes(time)
                    );
                    
                    return (
                      <div key={day} className="day-cell">
                        {dayCourses.map(course => {
                          const duration = timeToMinutes(course.endTime) - timeToMinutes(course.startTime);
                          const rowSpan = Math.max(1, Math.round(duration / 60));
                          
                          return (
                            <div
                              key={course.id}
                              className="course-block"
                              style={{
                                backgroundColor: getCourseColor(course.code),
                                height: `${rowSpan * 60}px`
                              }}
                            >
                              <div className="course-block-header">
                                <strong>{course.code}</strong>
                                <span>{course.classNo}</span>
                              </div>
                              <div className="course-block-time">
                                {course.startTime} - {course.endTime}
                              </div>
                              <div className="course-block-room">
                                {course.room}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {conflicts.length > 0 && (
            <div className="conflicts-warning">
              <h3>⚠️ Timetable Conflicts Detected</h3>
              {conflicts.map((conflict, index) => (
                <div key={index} className="conflict-item">
                  <p>
                    <strong>{conflict.course1}</strong> conflicts with{' '}
                    <strong>{conflict.course2}</strong>
                  </p>
                  <p>
                    {conflict.day} at {conflict.time}
                  </p>
                  <p className="conflict-location">
                    Location: {conflict.campus1} & {conflict.campus2}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="timetable-stats">
            <div className="stat">
              <span className="stat-label">Total Courses:</span>
              <span className="stat-value">{selectedCourses.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Conflicts:</span>
              <span className="stat-value">{conflicts.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Credits:</span>
              <span className="stat-value">
                {selectedCourses.reduce((sum, course) => sum + 3, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
