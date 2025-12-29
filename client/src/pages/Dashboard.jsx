import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api.js';
import { useAuth } from '../utils/AuthContext.jsx';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/summary');
      if (response.data.ok) {
        setDashboardData(response.data.data);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>{error}</p>
        <button onClick={fetchDashboardData}>Retry</button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.sid}</h1>
        <p>Here's what's happening with your EFS Platform</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card credits">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Your Credits</h3>
            <p className="stat-value">{dashboardData?.user.credits || 0}</p>
            <p className="stat-desc">Available credits</p>
          </div>
        </div>

        <div className="stat-card courses">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>Total Courses</h3>
            <p className="stat-value">{dashboardData?.stats.courses || 0}</p>
            <p className="stat-desc">Available courses</p>
          </div>
        </div>

        <div className="stat-card requests">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Group Requests</h3>
            <p className="stat-value">{dashboardData?.stats.myGroupRequests || 0}</p>
            <p className="stat-desc">Your active requests</p>
          </div>
        </div>

        <div className="stat-card questionnaires">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>Questionnaires</h3>
            <p className="stat-value">{dashboardData?.stats.myQuestionnaires || 0}</p>
            <p className="stat-desc">Your questionnaires</p>
          </div>
        </div>
      </div>

      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          {dashboardData?.quickActions.map(action => (
            action.available && (
              <Link 
                key={action.id} 
                to={action.link} 
                className="action-card"
                style={{ borderLeftColor: action.color }}
              >
                <div className="action-icon" style={{ color: action.color }}>
                  {action.icon === 'calendar' && '📅'}
                  {action.icon === 'team' && '👥'}
                  {action.icon === 'file-text' && '📝'}
                  {action.icon === 'file' && '📄'}
                  {action.icon === 'user' && '👤'}
                  {action.icon === 'setting' && '⚙️'}
                </div>
                <div className="action-content">
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>
              </Link>
            )
          ))}
        </div>
      </div>

      <div className="recent-activity-section">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">🎯</div>
            <div className="activity-content">
              <p>Welcome to EFS Platform!</p>
              <span className="activity-time">Just now</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">💼</div>
            <div className="activity-content">
              <p>Complete your profile to get started</p>
              <span className="activity-time">Today</span>
            </div>
          </div>
        </div>
      </div>

      {user?.role === 'admin' && dashboardData?.stats.pendingApprovals > 0 && (
        <div className="admin-alert">
          <div className="alert-icon">⚠️</div>
          <div className="alert-content">
            <h3>Pending Approvals</h3>
            <p>You have {dashboardData.stats.pendingApprovals} account requests pending approval</p>
            <Link to="/admin" className="alert-link">
              Go to Admin Panel →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
