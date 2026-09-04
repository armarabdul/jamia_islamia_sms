import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';

export const DashboardLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[var(--bg-app)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
          <div className="text-[var(--text-primary)] font-bold text-sm">Jamia Islamia Portal Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-shell">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="app-main">
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
