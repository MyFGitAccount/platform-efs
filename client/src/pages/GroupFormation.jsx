import React, { useState, useEffect } from 'react';
import { api } from '../utils/api.js';
import { useAuth } from '../utils/AuthContext.jsx';
import './GroupFormation.css';

const GroupFormation = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [myRequest, setMyRequest] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    description: '',
    email: user?.email || '',
    phone: '',
    major: '',
    desired_groupmates: '',
    gpa: '',
    dse_score: ''
  });

  useEffect(() => {
    fetchRequests();
    fetchMyRequest();
  }, [user]);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/group/requests');
      if (response.data.ok) {
        setRequests(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  };

  const fetchMyRequest = async () => {
    try {
      const response = await api.get('/group/requests/my');
      if (response.data.ok && response.data.data.length > 0) {
        setMyRequest(response.data.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch my request:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/group/requests', formData);
      if (response.data.ok) {
        setMyRequest(response.data.data);
        setShowForm(false);
        fetchRequests();
        alert('Group request posted successfully!');
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to post request');
    }
  };

  const handleContact = async (requestId) => {
    const message = prompt('Enter your message to this student:');
    if (!message) return;
    
    try {
      await api.post(`/group/requests/${requestId}/contact`, { message });
      alert('Invitation sent successfully!');
    } catch (error) {
      alert('Failed to send invitation');
    }
  };

  const filteredRequests = requests.filter(request => 
    request.major.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="group-formation-page">
      <div className="group-header">
        <h1>Study Group Formation</h1>
        <p>Find like-minded students to form study groups</p>
      </div>

      <div className="group-container">
        <div className="sidebar">
          <div className="my-request">
            <h3>My Group Request</h3>
            {myRequest ? (
              <div className="request-card">
                <p><strong>Major:</strong> {myRequest.major}</p>
                <p><strong>Description:</strong> {myRequest.description}</p>
                <p><strong>Looking for:</strong> {myRequest.desired_groupmates}</p>
                {myRequest.gpa && <p><strong>GPA:</strong> {myRequest.gpa}</p>}
                <button onClick={() => setShowForm(true)}>Edit</button>
                <button onClick={async () => {
                  if (window.confirm('Delete this request?')) {
                    await api.delete(`/group/requests/${myRequest._id}`);
                    setMyRequest(null);
                    fetchRequests();
                  }
                }}>Delete</button>
              </div>
            ) : (
              <button onClick={() => setShowForm(true)} className="btn-create">
                + Create Group Request
              </button>
            )}
          </div>

          {showForm && (
            <div className="request-form">
              <h3>{myRequest ? 'Edit' : 'Create'} Group Request</h3>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Major *"
                  value={formData.major}
                  onChange={e => setFormData({...formData, major: e.target.value})}
                  required
                />
                <textarea
                  placeholder="Description (optional)"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Email *"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  required
                />
                <input
                  type="text"
                  placeholder="Phone (optional)"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Desired groupmates (optional)"
                  value={formData.desired_groupmates}
                  onChange={e => setFormData({...formData, desired_groupmates: e.target.value})}
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="GPA (optional)"
                  value={formData.gpa}
                  onChange={e => setFormData({...formData, gpa: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="DSE Score (optional)"
                  value={formData.dse_score}
                  onChange={e => setFormData({...formData, dse_score: e.target.value})}
                />
                <div className="form-actions">
                  <button type="submit">Submit</button>
                  <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="main-content">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by major or description..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="requests-grid">
            {filteredRequests.map(request => (
              <div key={request._id} className="request-item">
                <div className="request-header">
                  <span className="major-badge">{request.major}</span>
                  <span className="time">{new Date(request.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="request-body">
                  <p className="description">{request.description || 'No description provided'}</p>
                  <div className="request-details">
                    <p><strong>Looking for:</strong> {request.desired_groupmates || 'Any'}</p>
                    {request.gpa && <p><strong>GPA:</strong> {request.gpa}</p>}
                    {request.dse_score && <p><strong>DSE:</strong> {request.dse_score}</p>}
                  </div>
                </div>
                <div className="request-footer">
                  <button 
                    onClick={() => handleContact(request._id)}
                    disabled={request.sid === user?.sid}
                  >
                    {request.sid === user?.sid ? 'Your Request' : 'Contact'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupFormation;
