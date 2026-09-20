import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Sidebar } from '../Sidebar/Sidebar';
import { Header } from '../Header/Header';
import { adminApi } from '../../../api/admin.api';
import './AdminLayout.css';

export const AdminLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/dashboard':
        return 'Analytics Dashboard';
      case '/workers':
        return 'Worker Approval & Accounts';
      case '/customers':
        return 'Customer Accounts';
      case '/jobs':
        return 'Job Orders & Inspection';
      case '/settings':
        return 'System Settings & Audit Logs';
      default:
        return 'Admin Portal';
    }
  };

  const fetchPendingCount = async () => {
    try {
      const workers = await adminApi.getWorkers('PENDING_VERIFICATION');
      setPendingApprovalsCount(workers.length);
    } catch (err) {
      console.error('Failed to fetch pending approvals count:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPendingCount();
      const interval = setInterval(fetchPendingCount, 15000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, location.pathname]);

  if (isLoading) {
    return (
      <div className="layout-loading">
        <div className="spinner"></div>
        <span>Loading Admin Portal...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="admin-layout-container">
      <Sidebar pendingApprovalsCount={pendingApprovalsCount} />
      <div className="admin-main-wrapper">
        <Header title={getPageTitle(location.pathname)} pendingApprovalsCount={pendingApprovalsCount} />
        <main className="admin-content">
          <Outlet context={{ refreshPendingCount: fetchPendingCount }} />
        </main>
      </div>
    </div>
  );
};
