import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, FileText, CheckCircle, Save } from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import './Settings.css';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

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
                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                    <td>{log.admin?.name || log.adminId}</td>
                    <td><span className="code-tag">{log.action}</span></td>
                    <td>{log.entityType}</td>
                    <td className="text-muted text-xs">{log.entityId}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
