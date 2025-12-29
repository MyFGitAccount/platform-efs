import React, { useState, useEffect } from 'react';
import { api } from '../utils/api.js';
import { useAuth } from '../utils/AuthContext.jsx';
import './Questionnaire.css';

const Questionnaire = () => {
  const { user } = useAuth();
  const [questionnaires, setQuestionnaires] = useState([]);
  const [myQuestionnaires, setMyQuestionnaires] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [stats, setStats] = useState(null);
  
  const [formData, setFormData] = useState({
    description: '',
    link: '',
    targetResponses: 30
  });

  useEffect(() => {
    fetchQuestionnaires();
    fetchMyQuestionnaires();
    fetchStats();
  }, [user]);

  const fetchQuestionnaires = async () => {
    try {
      const response = await api.get('/questionnaire/fillable');
      if (response.data.ok) {
        setQuestionnaires(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch questionnaires:', error);
    }
  };

  const fetchMyQuestionnaires = async () => {
    try {
      const response = await api.get('/questionnaire/my');
      if (response.data.ok) {
        setMyQuestionnaires(response.data.data.created);
      }
    } catch (error) {
      console.error('Failed to fetch my questionnaires:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/questionnaire/stats');
      if (response.data.ok) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (user.credits < 3) {
      alert('You need 3 credits to post a questionnaire!');
      return;
    }

    try {
      const response = await api.post('/questionnaire', formData);
      if (response.data.ok) {
        setShowCreateForm(false);
        setFormData({ description: '', link: '', targetResponses: 30 });
        fetchQuestionnaires();
        fetchMyQuestionnaires();
        fetchStats();
        alert('Questionnaire posted successfully! 3 credits deducted.');
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to post questionnaire');
    }
  };

  const handleFill = async (questionnaireId) => {
    try {
      const response = await api.post(`/questionnaire/${questionnaireId}/fill`);
      if (response.data.ok) {
        fetchQuestionnaires();
        fetchStats();
        alert('Questionnaire filled! You earned 1 credit!');
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to fill questionnaire');
    }
  };

  const handleDelete = async (questionnaireId) => {
    if (window.confirm('Delete this questionnaire?')) {
      try {
        await api.delete(`/questionnaire/${questionnaireId}`);
        fetchMyQuestionnaires();
        fetchStats();
        alert('Questionnaire deleted!');
      } catch (error) {
        alert('Failed to delete questionnaire');
      }
    }
  };

  return (
    <div className="questionnaire-page">
      <div className="questionnaire-header">
        <h1>Questionnaire Exchange</h1>
        <p>Fill others' questionnaires to earn credits, post yours to get responses</p>
        
        {stats && (
          <div className="stats-card">
            <div className="stat-item">
              <span className="stat-value">{stats.personal.credits || 0}</span>
              <span className="stat-label">Your Credits</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.personal.availableToFill || 0}</span>
              <span className="stat-label">Available to Fill</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.personal.questionnairesCreated || 0}</span>
              <span className="stat-label">Your Questionnaires</span>
            </div>
          </div>
        )}
      </div>

      <div className="questionnaire-container">
        <div className="sidebar">
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-create"
            disabled={user.credits < 3}
          >
            {user.credits < 3 ? 'Need 3 Credits' : '+ Post Questionnaire'}
          </button>

          {showCreateForm && (
            <div className="create-form">
              <h3>Post New Questionnaire</h3>
              <form onSubmit={handleCreate}>
                <input
                  type="text"
                  placeholder="Description *"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  required
                />
                <input
                  type="url"
                  placeholder="Google Form Link *"
                  value={formData.link}
                  onChange={e => setFormData({...formData, link: e.target.value})}
                  required
                />
                <input
                  type="number"
                  placeholder="Target Responses"
                  value={formData.targetResponses}
                  onChange={e => setFormData({...formData, targetResponses: e.target.value})}
                  min="1"
                  max="100"
                />
                <div className="credit-info">
                  <p>Cost: 3 credits</p>
                  <p>You have: {user.credits} credits</p>
                </div>
                <div className="form-actions">
                  <button type="submit">Submit (Cost: 3 credits)</button>
                  <button type="button" onClick={() => setShowCreateForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="my-questionnaires">
            <h3>My Questionnaires</h3>
            {myQuestionnaires.length === 0 ? (
              <p>No questionnaires yet</p>
            ) : (
              myQuestionnaires.map(q => (
                <div key={q._id} className="questionnaire-card">
                  <p><strong>{q.description}</strong></p>
                  <p>Responses: {q.currentResponses}/{q.targetResponses}</p>
                  <p>Status: <span className={`status ${q.status}`}>{q.status}</span></p>
                  <div className="card-actions">
                    <a href={q.link} target="_blank" rel="noopener noreferrer">View</a>
                    <button onClick={() => handleDelete(q._id)}>Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="main-content">
          <h2>Questionnaires to Fill (Earn 1 credit each)</h2>
          <div className="questionnaires-list">
            {questionnaires.length === 0 ? (
              <p>No questionnaires available to fill</p>
            ) : (
              questionnaires.map(q => (
                <div key={q._id} className="questionnaire-item">
                  <div className="item-header">
                    <span className="creator">By: {q.creatorSid}</span>
                    <span className="responses">{q.currentResponses}/{q.targetResponses} responses</span>
                  </div>
                  <div className="item-body">
                    <p className="description">{q.description}</p>
                    <a href={q.link} target="_blank" rel="noopener noreferrer" className="link">
                      Open Questionnaire
                    </a>
                  </div>
                  <div className="item-footer">
                    <button onClick={() => handleFill(q._id)} className="btn-fill">
                      Fill & Earn 1 Credit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;
