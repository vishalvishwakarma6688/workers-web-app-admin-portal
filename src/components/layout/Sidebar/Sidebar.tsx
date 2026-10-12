import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  Users,
  Briefcase,
  Grid,
  Settings,
  LogOut,
  Wrench,
  X,
  ShieldAlert,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { SignOutModal } from '../../common/SignOutModal/SignOutModal';
import './Sidebar.css';

interface SidebarProps {
  pendingApprovalsCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  pendingApprovalsCount = 0,
  isOpen = false,
  onClose,
}) => {
  const { logout, user } = useAuth();
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      path: '/workers',
      label: 'Worker Approvals',
      icon: UserCheck,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
    },
    { path: '/customers', label: 'Customers', icon: Users },
    { path: '/categories', label: 'Service Domains', icon: Grid },
    { path: '/jobs', label: 'Jobs & Inspection', icon: Briefcase },
    { path: '/disputes', label: 'Disputes & Mediation', icon: ShieldAlert },
    { path: '/payouts', label: 'Payouts & Wallet', icon: Wallet },
    { path: '/settings', label: 'Settings & Logs', icon: Settings },
  ];


  return (
    <>
      <aside className={`admin-sidebar ${isOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon-wrapper">
            <Wrench className="brand-icon" size={24} />
          </div>
          <div className="brand-text">
            <span className="brand-name">Technician</span>
            <span className="brand-tag">ADMIN PANEL</span>
          </div>
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            title="Close Menu"
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group-label">MAIN MENU</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={20} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
                {item.badge !== undefined && (
                  <span className="nav-badge-pending">{item.badge}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-mini">
            <div className="user-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.name || 'Administrator'}</div>
              <div className="user-email">{user?.email || 'admin@serviceapp.com'}</div>
            </div>
          </div>
          <button className="btn-logout" onClick={() => setShowSignOutModal(true)} title="Sign Out">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Confirmation Popup Modal for Sign Out */}
      <SignOutModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={() => {
          onClose?.();
          logout();
        }}
      />
    </>
  );
};
