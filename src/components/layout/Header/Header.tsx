import React from 'react';
import { Sun, Moon, UserCheck } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import './Header.css';

interface HeaderProps {
  title?: string;
  pendingApprovalsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ title = 'Dashboard Overview', pendingApprovalsCount = 0 }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="admin-header">
      <div className="header-left">
        <h1 className="page-title">{title}</h1>
      </div>

      <div className="header-right">
        {pendingApprovalsCount > 0 && (
          <div className="pending-alert-chip" title="Pending Worker Approvals">
            <UserCheck size={16} />
            <span>{pendingApprovalsCount} Approval{pendingApprovalsCount > 1 ? 's' : ''} Needed</span>
          </div>
        )}

        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={20} className="icon-sun" /> : <Moon size={20} className="icon-moon" />}
        </button>

        <div className="header-divider"></div>

        <div className="admin-user-badge">
          <div className="avatar-circle">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <span className="user-display-name">{user?.name || 'Admin'}</span>
        </div>
      </div>
    </header>
  );
};
