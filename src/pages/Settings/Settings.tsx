import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, FileText, CheckCircle, Save, AlertTriangle, Trash2, X, RefreshCw } from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import './Settings.css';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Database Reset Modal states
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [resetSecretInput, setResetSecretInput] = useState('');
  const [preserveAdmins, setPreserveAdmins] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [sData, lData] = await Promise.all([
        adminApi.getSettings(),
        adminApi.getAuditLogs(),
      ]);
      setSettings(sData || []);
      setAuditLogs(lData || []);
    } catch (err: any) {
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateSetting = async (key: string, value: string) => {
    try {
      await adminApi.updateSetting(key, value);
      setSaveSuccessMsg(`Updated setting "${key}" successfully.`);
      fetchData();
    } catch (err: any) {
      alert('Failed to update setting');
    }
  };

  const handleExecuteReset = async () => {
    try {
      setIsResetting(true);
      setResetError(null);
      const res = await adminApi.resetDatabase({
        confirm: resetConfirmText.trim(),
        resetSecret: resetSecretInput.trim() || undefined,
        preserveAdmins,
      });
      setShowResetModal(false);
      setSaveSuccessMsg(res.message || 'Live database has been successfully reset!');
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to reset database.';
      setResetError(msg);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="settings-page">
      {saveSuccessMsg && (
        <div className="alert-toast-success">
          <CheckCircle size={18} />
          <span>{saveSuccessMsg}</span>
          <button onClick={() => setSaveSuccessMsg(null)} className="close-toast">&times;</button>
        </div>
      )}

      <div className="settings-card">
        <div className="card-header-row">
          <SettingsIcon size={20} className="icon-blue" />
          <h3>Platform Commission & Global Config</h3>
        </div>

        {isLoading ? (
          <div className="table-loading"><div className="spinner"></div></div>
        ) : (
          <div className="settings-list">
            {settings.length === 0 ? (
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-key">PLATFORM_COMMISSION_PERCENT</span>
                  <span className="setting-desc">Percentage platform commission cut per completed job order</span>
                </div>
                <div className="setting-input-wrapper">
                  <input type="text" defaultValue="10" id="setting-commission" />
                  <button
                    className="btn-save-setting"
                    onClick={() => {
                      const input = document.getElementById('setting-commission') as HTMLInputElement;
                      handleUpdateSetting('PLATFORM_COMMISSION_PERCENT', input.value);
                    }}
                  >
                    <Save size={14} />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            ) : (
              settings.map((s) => (
                <div key={s.id} className="setting-row">
                  <div className="setting-info">
                    <span className="setting-key">{s.key}</span>
                    <span className="setting-desc">{s.description || 'System parameter'}</span>
                  </div>
                  <div className="setting-input-wrapper">
                    <input type="text" defaultValue={s.value} id={`setting-${s.id}`} />
                    <button
                      className="btn-save-setting"
                      onClick={() => {
                        const input = document.getElementById(`setting-${s.id}`) as HTMLInputElement;
                        handleUpdateSetting(s.key, input.value);
                      }}
                    >
                      <Save size={14} />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="settings-card">
        <div className="card-header-row">
          <FileText size={20} className="icon-purple" />
          <h3>Administrator Action Audit Logs</h3>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Admin User</th>
                <th>Action</th>
                <th>Entity Type</th>
                <th>Entity ID</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-table-cell">No administrative audit records found</td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td data-label="Timestamp">{new Date(log.createdAt).toLocaleString()}</td>
                    <td data-label="Admin User">{log.admin?.name || log.adminId}</td>
                    <td data-label="Action"><span className="code-tag">{log.action}</span></td>
                    <td data-label="Entity Type">{log.entityType}</td>
                    <td data-label="Entity ID" className="text-muted text-xs">{log.entityId}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Danger Zone: Live Database Reset */}
      <div className="settings-card danger-zone-card">
        <div className="card-header-row danger">
          <AlertTriangle size={20} className="icon-danger" />
          <h3>Danger Zone: Live Database Reset (Render)</h3>
        </div>

        <div className="danger-zone-content">
          <div className="danger-zone-info">
            <h4>Erase All Records & Clean Reset</h4>
            <p>
              Permanently deletes all transactional data (job orders, worker profiles, customer accounts, payment records, reviews, chats, ID proofs, and notifications) from the live Render SQLite database.
              Preserves database tables, schema, and re-initializes default administrator accounts and service domains.
            </p>
          </div>
          <button
            className="btn-danger-reset"
            onClick={() => {
              setShowResetModal(true);
              setResetConfirmText('');
              setResetSecretInput('');
              setResetError(null);
            }}
          >
            <Trash2 size={16} />
            <span>Reset Live Database</span>
          </button>
        </div>
      </div>

      {/* Database Reset Confirmation Modal */}
      {showResetModal && (
        <div className="modal-overlay" onClick={() => !isResetting && setShowResetModal(false)}>
          <div className="modal-card danger-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="danger-modal-title">
                <AlertTriangle size={22} className="icon-danger" />
                <h3>Wipe & Reset Live Database</h3>
              </div>
              <button
                className="btn-close"
                disabled={isResetting}
                onClick={() => setShowResetModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="reset-warning-banner">
                <AlertTriangle size={24} className="icon-danger" style={{ flexShrink: 0 }} />
                <div>
                  <strong>Irreversible Action Warning:</strong>
                  <p>
                    All registered customer accounts, technician accounts, service requests, payments, ID proof images, and chats on Render will be permanently erased.
                  </p>
                </div>
              </div>

              {resetError && (
                <div className="login-error-alert" style={{ margin: '8px 0' }}>
                  {resetError}
                </div>
              )}

              <div className="reset-form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={preserveAdmins}
                    onChange={(e) => setPreserveAdmins(e.target.checked)}
                    disabled={isResetting}
                  />
                  <span>Preserve current Admin account sessions (keep logged in)</span>
                </label>
              </div>

              <div className="reset-form-group">
                <label htmlFor="reset-secret-input">
                  <span>Reset Secret Key (Optional if logged in as Admin, or required if configured on Render):</span>
                </label>
                <input
                  id="reset-secret-input"
                  type="password"
                  placeholder="Enter RESET_SECRET (optional for logged in admin)"
                  value={resetSecretInput}
                  onChange={(e) => setResetSecretInput(e.target.value)}
                  disabled={isResetting}
                />
              </div>

              <div className="reset-form-group">
                <label htmlFor="reset-confirm-input">
                  <span>Type <strong>RESET</strong> below to confirm deletion:</span>
                </label>
                <input
                  id="reset-confirm-input"
                  type="text"
                  placeholder="Type RESET"
                  value={resetConfirmText}
                  onChange={(e) => setResetConfirmText(e.target.value)}
                  disabled={isResetting}
                  autoFocus
                />
              </div>
            </div>

            <div className="modal-footer danger-modal-footer">
              <button
                className="btn-modal-close"
                onClick={() => setShowResetModal(false)}
                disabled={isResetting}
              >
                Cancel
              </button>
              <button
                className="btn-confirm-reset"
                disabled={resetConfirmText.trim().toUpperCase() !== 'RESET' || isResetting}
                onClick={handleExecuteReset}
              >
                {isResetting ? (
                  <>
                    <RefreshCw size={16} className="spinner-icon" />
                    <span>Wiping Database...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Yes, Permanently Reset Database</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
