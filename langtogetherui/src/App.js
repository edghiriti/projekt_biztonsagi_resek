import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import DashboardPage from './components/DashboardPage';
import LanguagePage from './components/LanguagePage';
import LearningSession from './components/LearningSession';
import Statistics from './components/Statistics';
import ProgressDecksPage from './components/ProgressDecksPage';
import GroupStatistics from './components/GroupStatistics';
import GroupsPage from './components/GroupsPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<ProtectedRoute />}>
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="languages" element={<LanguagePage />} />
            <Route path="progress" element={<ProgressDecksPage />} />
            <Route path="groups" element={<GroupsPage />} /> 
            <Route path="groups/:groupId/statistics" element={<GroupStatistics />} />
            <Route path="progress/:progressDeckId" element={<LearningSession />} />
            <Route path="progress/:progressDeckId/statistics" element={<Statistics />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
