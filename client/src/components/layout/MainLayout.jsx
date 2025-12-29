import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext.jsx';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/dashboard">EFS Platform</Link>
        </div>
        
        <div className="navbar-user">
          {user ? (
            <div className="user-info">
              <span className="user-sid">{user.sid}</span>
              <span className="user-role">{user.role}</span>
              <span className="user-credits">💰 {user.credits || 0}</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-link">
              Login
            </Link>
          )}
        </div>
      </nav>

      <div className="main-layout">
        <aside className="sidebar">
          <nav className="sidebar-menu">
            <Link 
              to="/dashboard" 
              className={isActive('/dashboard') ? 'active' : ''}
            >
              📊 Dashboard
            </Link>
            <Link 
              to="/calendar" 
              className={isActive('/calendar') ? 'active' : ''}
            >
              📅 Timetable Planner
            </Link>
            <Link 
              to="/group-formation" 
              className={isActive('/group-formation') ? 'active' : ''}
            >
              👥 Group Formation
            </Link>
            <Link 
              to="/questionnaire" 
              className={isActive('/questionnaire') ? 'active' : ''}
            >
              📝 Questionnaire Exchange
            </Link>
            <Link 
              to="/materials" 
              className={isActive('/materials') ? 'active' : ''}
            >
              📚 Learning Materials
            </Link>
            <Link 
              to="/courses" 
              className={isActive('/courses') ? 'active' : ''}
            >
              🎓 Course Catalog
            </Link>
            {user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className={isActive('/admin') ? 'active' : ''}
              >
                ⚙️ Admin Panel
              </Link>
            )}
            <Link 
              to="/profile" 
              className={isActive('/profile') ? 'active' : ''}
            >
              👤 My Profile
            </Link>
          </nav>
        </aside>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
