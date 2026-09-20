import React from 'react';
import { LogOut, X } from 'lucide-react';
import './SignOutModal.css';

interface SignOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const SignOutModal: React.FC<SignOutModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="signout-modal-overlay" onClick={onClose}>
      <div className="signout-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="signout-close-btn" onClick={onClose} title="Close">
          <X size={18} />
        </button>

        <div className="signout-icon-wrapper">
          <LogOut size={28} />
        </div>

        <h3>Sign Out Confirmation</h3>
        <p>
          Are you sure you want to sign out of the Admin Portal? You will need to log in again to manage the platform.
        </p>

        <div className="signout-actions">
          <button className="btn-signout-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-signout-confirm" onClick={onConfirm}>
            Yes, Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
