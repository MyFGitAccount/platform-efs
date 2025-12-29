import React, { useState, useEffect } from 'react';
import { api } from '../utils/api.js';
import { useAuth } from '../utils/AuthContext.jsx';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('accounts');
  const [pendingAccounts, setPendingAccounts] = useState([]);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'accounts') {
        const response = await api.get('/admin/pending/accounts');
        if (response.data.ok) {
          setPendingAccounts(response.data.data);
        }
      } else if (activeTab === 'courses') {
        const response = await api.get('/admin/pending/courses');
        if (response.data.ok) {
          setPendingCourses(response.data.data);
        }
      } else if (activeTab === 'users') {
        const response = await api.get('/admin/users');
        if (response.data.ok) {
          setAllUsers(response.data.data);
        }
      } else if (activeTab === 'stats') {
        const response = await api.get('/admin/stats');
        if (response.data.ok) {
          setStats(response.data.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAccount = async (sid) => {
    if (!window.confirm(`Approve account for ${sid}?`)) return;
    
    try {
      await api.post(`/admin/pending/accounts/${sid}/approve`);
      alert('Account approved successfully!');
      fetchData();
    } catch (error) {
      alert('Failed to approve account');
    }
  };

  const handleRejectAccount = async (sid) => {
    if (!window.confirm(`Reject account for ${sid}?`)) return;
    
    try {
      await api.post(`/admin/pending/accounts/${sid}/reject`);
      alert('Account rejected');
      fetchData();
    } catch (error) {
      alert('Failed to reject account');
    }
  };

  const handleApproveCourse = async (code) => {
    if (!window.confirm(`Approve course ${code}?`)) return;
    
    try {
      await api.post(`/admin/pending/courses/${code}/approve`);
      alert('Course approved successfully!');
      fetchData();
    } catch (error) {
      alert('Failed to approve course');
    }
  };

  const handleRejectCourse = async (code) => {
    if (!window.confirm(`Reject course ${code}?`)) return;
    
    try {
      await api.post(`/admin/pending/courses/${code}/reject`);
      alert('Course rejected');
      fetchData();
    } catch (error) {
      alert('Failed to reject course');
    }
  };

  const handleDeleteUser = async (sid) => {
    if (!window.confirm(`Delete user ${sid}?`)) return;
    
    try {
      await api.delete(`/admin/users/${sid}`);
      alert('User deleted');
      fetchData();
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  const handleAddCredits = async (sid) => {
    const amount = prompt('Enter number of credits to add:');
    if (!amount || isNaN(amount) || amount <= 0) return;
    
    try {
      await api.post(`/admin/users/${sid}/credits`, { amount: parseInt(amount) });
      alert(`${amount} credits added to user ${sid}`);
      fetchData();
    } catch (error) {
      alert('Failed to add credits');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-access-denied">
        <h2>⚠️ Access Denied</h2>
        <p>You do not have permission to access the admin panel.</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <p>Manage platform settings and user approvals</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'accounts' ? 'active' : ''}`}
          onClick={() => setActiveTab('accounts')}
        >
          Pending Accounts ({pendingAccounts.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          Pending Courses ({pendingCourses.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          All Users
        </button>
        <button
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Platform Stats
        </button>
      </div>

      <div className="admin-content">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : activeTab === 'accounts' ? (
          <div className="accounts-section">
            <h2>Pending Account Approvals</h2>
            {pendingAccounts.length === 0 ? (
              <p className="no-data">No pending account requests</p>
            ) : (
              <div className="accounts-list">
                {pendingAccounts.map(account => (
                  <div key={account.sid} className="account-card">
                    <div className="account-info">
                      <h3>{account.sid}</h3>
                      <p>{account.email}</p>
                      <p className="account-date">
                        Requested: {new Date(account.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="account-actions">
                      <button
                        onClick={() => handleApproveAccount(account.sid)}
                        className="btn-approve"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectAccount(account.sid)}
                        className="btn-reject"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'courses' ? (
          <div className="courses-section">
            <h2>Pending Course Approvals</h2>
            {pendingCourses.length === 0 ? (
              <p className="no-data">No pending course requests</p>
            ) : (
              <div className="courses-list">
                {pendingCourses.map(course => (
                  <div key={course.code} className="course-card">
                    <div className="course-info">
                      <h3>{course.code}</h3>
                      <p>{course.title}</p>
                      <p className="course-requester">
                        Requested by: {course.requestedBy}
                      </p>
                      <p className="course-date">
                        Requested: {new Date(course.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="course-actions">
                      <button
                        onClick={() => handleApproveCourse(course.code)}
                        className="btn-approve"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectCourse(course.code)}
                        className="btn-reject"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'users' ? (
          <div className="users-section">
            <h2>All Users</h2>
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>SID</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Credits</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map(user => (
                    <tr key={user.sid}>
                      <td>{user.sid}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{user.credits || 0}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="user-actions">
                        <button
                          onClick={() => handleAddCredits(user.sid)}
                          className="btn-add-credits"
                          disabled={user.role === 'admin'}
                        >
                          Add Credits
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.sid)}
                          className="btn-delete"
                          disabled={user.sid === 'admin001' || user.role === 'admin'}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'stats' ? (
          <div className="stats-section">
            <h2>Platform Statistics</h2>
            {stats ? (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-content">
                    <h3>Total Users</h3>
                    <p className="stat-value">{stats.totalUsers}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📚</div>
                  <div className="stat-content">
                    <h3>Total Courses</h3>
                    <p className="stat-value">{stats.totalCourses}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⏳</div>
                  <div className="stat-content">
                    <h3>Pending Accounts</h3>
                    <p className="stat-value">{stats.pendingAccounts}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📝</div>
                  <div className="stat-content">
                    <h3>Pending Courses</h3>
                    <p className="stat-value">{stats.pendingCourses}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📄</div>
                  <div className="stat-content">
                    <h3>Total Materials</h3>
                    <p className="stat-value">{stats.totalMaterials}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="no-data">No statistics available</p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AdminPanel;
