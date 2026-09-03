import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { TeachersPage } from './pages/TeachersPage';
import { ClassesPage } from './pages/ClassesPage';
import { AttendancePage } from './pages/AttendancePage';
import { ExaminationsPage } from './pages/ExaminationsPage';
import { TimetablePage } from './pages/TimetablePage';
import { HomeworkPage } from './pages/HomeworkPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { MessagesPage } from './pages/MessagesPage';
import { CalendarPage } from './pages/CalendarPage';
import { LibraryPage } from './pages/LibraryPage';
import { ReportsPage } from './pages/ReportsPage';
import { ImportsPage } from './pages/ImportsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Authenticated Dashboard Shell */}
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="teachers" element={<TeachersPage />} />
        <Route path="classes" element={<ClassesPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="examinations" element={<ExaminationsPage />} />
        <Route path="timetable" element={<TimetablePage />} />
        <Route path="homework" element={<HomeworkPage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="library" element={<LibraryPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="imports" element={<ImportsPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
