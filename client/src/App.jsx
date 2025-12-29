import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Calendar from './pages/Calendar.jsx';
import AccountCreate from './pages/AccountCreate.jsx';
import GroupFormation from './pages/GroupFormation.jsx';
import Questionnaire from './pages/Questionnaire.jsx';
import Materials from './pages/Materials.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import CourseViewer from './pages/CourseViewer.jsx';
import Profile from './pages/Profile.jsx';
import CourseEditor from './pages/CourseEditor.jsx';
import { AuthProvider } from './utils/AuthContext.jsx';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<AccountCreate />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="group-formation" element={<GroupFormation />} />
          <Route path="questionnaire" element={<Questionnaire />} />
          <Route path="materials" element={<Materials />} />
          <Route path="admin" element={<AdminPanel />} />
          <Route path="courses" element={<CourseViewer />} />
          <Route path="course-editor" element={<CourseEditor/>} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
