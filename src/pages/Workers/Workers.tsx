import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Eye,
  Trash2,
  AlertTriangle,
  UserCheck,
  ShieldOff,
  ShieldCheck,
  Star,
  Phone,
  Mail,
  X,
  FileText,
  ExternalLink,
  Maximize2,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import { adminApi, type WorkerAdminDTO } from '../../api/admin.api';
import './Workers.css';

type TabType = 'PENDING_VERIFICATION' | 'ALL' | 'APPROVED' | 'REJECTED';

export const Workers: React.FC = () => {
  const { refreshPendingCount } = useOutletContext<{ refreshPendingCount: () => void }>();

  const [workers, setWorkers] = useState<WorkerAdminDTO[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('PENDING_VERIFICATION');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedWorker, setSelectedWorker] = useState<WorkerAdminDTO | null>(null);
  const [viewingIdProof, setViewingIdProof] = useState<{ url: string; name: string; worker: WorkerAdminDTO } | null>(null);
  const [deleteConfirmWorker, setDeleteConfirmWorker] = useState<WorkerAdminDTO | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const fetchWorkers = async () => {
    try {
      setIsLoading(true);
      const statusParam = activeTab === 'ALL' ? undefined : activeTab;
      const res = await adminApi.getWorkers(statusParam);
      setWorkers(res);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch workers:', err);
      setError('Failed to load workers list.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [activeTab]);

  const handleApprove = async (workerId: string, name: string) => {
    try {
      await adminApi.approveWorker(workerId);
      setActionSuccessMsg(`Successfully APPROVED worker ${name}! They can now accept job requests.`);
      fetchWorkers();
      if (refreshPendingCount) refreshPendingCount();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to approve worker');
    }
  };

  const handleReject = async (workerId: string, name: string) => {
    try {
      await adminApi.rejectWorker(workerId);
      setActionSuccessMsg(`REJECTED profile for worker ${name}.`);
      fetchWorkers();
      if (refreshPendingCount) refreshPendingCount();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to reject worker');
    }
  };

  const handleStatusToggle = async (workerId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await adminApi.updateWorkerAccountStatus(workerId, nextStatus);
      setActionSuccessMsg(`Worker account updated to ${nextStatus}.`);
      fetchWorkers();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update status');
    }
  };

  const handleDeleteUser = async (workerId: string, name: string) => {
    try {
      await adminApi.deleteUser(workerId);
      setActionSuccessMsg(`Permanently deleted worker account for ${name}.`);
      setDeleteConfirmWorker(null);
      fetchWorkers();
      if (refreshPendingCount) refreshPendingCount();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to delete worker');
    }
  };

  const filteredWorkers = workers.filter((w) => {
    const term = searchQuery.toLowerCase();
    return (
      w.name.toLowerCase().includes(term) ||
      w.email.toLowerCase().includes(term) ||
      w.phone.includes(term) ||
      (w.workerProfile?.businessName && w.workerProfile.businessName.toLowerCase().includes(term))
    );
  });

  const pendingCount = workers.filter(
    (w) => w.workerProfile?.verificationStatus === 'PENDING_VERIFICATION'
  ).length;

  return (
    <div className="workers-page">
      {error && <div className="login-error-alert">{error}</div>}
      {actionSuccessMsg && (
        <div className="alert-toast-success">
          <CheckCircle size={18} />
          <span>{actionSuccessMsg}</span>
          <button onClick={() => setActionSuccessMsg(null)} className="close-toast">&times;</button>
        </div>
      )}

      <div className="page-header-card">
        <div className="tab-buttons">
          <button
            className={`tab-btn ${activeTab === 'PENDING_VERIFICATION' ? 'active' : ''}`}
            onClick={() => setActiveTab('PENDING_VERIFICATION')}
          >
            <Clock size={16} />
            <span>Pending Approvals</span>
            {pendingCount > 0 && <span className="tab-badge">{pendingCount}</span>}
          </button>
          <button
            className={`tab-btn ${activeTab === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveTab('ALL')}
          >
            <span>All Workers</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'APPROVED' ? 'active' : ''}`}
            onClick={() => setActiveTab('APPROVED')}
          >
            <span>Approved</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'REJECTED' ? 'active' : ''}`}
            onClick={() => setActiveTab('REJECTED')}
          >
            <span>Rejected</span>
          </button>
        </div>

        <div className="search-bar-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search technician by name, phone, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="table-card">
        {isLoading ? (
          <div className="table-loading">
            <div className="spinner"></div>
            <p>Loading worker profiles...</p>
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div className="empty-state">
            <UserCheck size={48} className="empty-icon" />
            <h3>No workers found</h3>
            <p>
              {activeTab === 'PENDING_VERIFICATION'
                ? 'Great news! There are no worker accounts waiting for verification.'
                : 'No workers match the selected tab or search query.'}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Technician</th>
                  <th>Contact Info</th>
                  <th>Categories / Experience</th>
                  <th>ID Proof Document</th>
                  <th>Approval Status</th>
                  <th>Account Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkers.map((w) => {
                  const verStatus = w.workerProfile?.verificationStatus || 'PENDING_VERIFICATION';
                  const services = w.workerProfile?.workerServices || [];
                  const idProofUrl = w.workerProfile?.idProofUrl;

                  return (
                    <tr key={w.id}>
                      <td data-label="Technician">
                        <div className="worker-info-cell">
                          <div className="worker-avatar">
                            {w.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="worker-name">{w.name}</div>
                            {w.workerProfile?.businessName && (
                              <div className="worker-business">{w.workerProfile.businessName}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td data-label="Contact">
                        <div className="contact-cell">
                          <div><Phone size={13} /> {w.phone}</div>
                          <div className="text-muted"><Mail size={13} /> {w.email}</div>
                        </div>
                      </td>
                      <td data-label="Services">
                        <div className="services-cell">
                          <div className="tags-row">
                            {services.slice(0, 2).map((s, idx) => (
                              <span key={idx} className="category-tag">
                                {s.serviceCategory.name}
                              </span>
                            ))}
                            {services.length > 2 && (
                              <span className="category-tag count">+{services.length - 2}</span>
                            )}
                          </div>
                          <div className="experience-text">
                            {w.workerProfile?.experienceYears || 0} yrs exp • ₹{w.workerProfile?.startingPrice || 0} start
                          </div>
                        </div>
                      </td>
                      <td data-label="ID Proof">
                        {idProofUrl ? (
                          <button
                            className="id-proof-thumb-btn"
                            title="Click to view & verify Government ID"
                            onClick={() => setViewingIdProof({ url: idProofUrl, name: w.name, worker: w })}
                          >
                            <img src={idProofUrl} alt="ID Document" className="id-proof-thumb-img" />
                            <span className="id-proof-thumb-label">
                              <FileText size={12} /> View ID
                            </span>
                          </button>
                        ) : (
                          <span className="id-proof-missing-tag">
                            <AlertCircle size={12} /> Missing ID
                          </span>
                        )}
                      </td>
                      <td data-label="Approval">
                        <span className={`status-chip status-${verStatus.toLowerCase()}`}>
                          {verStatus === 'PENDING_VERIFICATION' ? 'PENDING' : verStatus}
                        </span>
                      </td>
                      <td data-label="Account">
                        <span className={`account-status-chip status-${w.status.toLowerCase()}`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="actions-cell">
                        {verStatus === 'PENDING_VERIFICATION' && (
                          <>
                            <button
                              className="btn-action approve"
                              title="Approve Technician Account"
                              onClick={() => handleApprove(w.id, w.name)}
                            >
                              <CheckCircle size={16} />
                              <span>Approve</span>
                            </button>
                            <button
                              className="btn-action reject"
                              title="Reject Account"
                              onClick={() => handleReject(w.id, w.name)}
                            >
                              <XCircle size={16} />
                              <span>Reject</span>
                            </button>
                          </>
                        )}

                        <button
                          className="btn-action icon-only"
                          title="View Technician Profile"
                          onClick={() => setSelectedWorker(w)}
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          className={`btn-action icon-only ${w.status === 'ACTIVE' ? 'suspend' : 'activate'}`}
                          title={w.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
                          onClick={() => handleStatusToggle(w.id, w.status)}
                        >
                          {w.status === 'ACTIVE' ? <ShieldOff size={16} /> : <ShieldCheck size={16} />}
                        </button>

                        <button
                          className="btn-action icon-only danger"
                          title="Delete Worker Account"
                          onClick={() => setDeleteConfirmWorker(w)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedWorker && (
        <div className="modal-overlay" onClick={() => setSelectedWorker(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Technician Profile Details</h3>
              <button className="btn-close" onClick={() => setSelectedWorker(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-profile-header">
                <div className="profile-large-avatar">
                  {selectedWorker.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2>{selectedWorker.name}</h2>
                  <p className="business-subtitle">{selectedWorker.workerProfile?.businessName || 'Independent Technician'}</p>
                  <div className="rating-badge">
                    <Star size={16} className="star-icon" />
                    <span>{selectedWorker.workerProfile?.averageRating || 0.0} / 5.0</span>
                    <span className="total-jobs">({selectedWorker.workerProfile?.totalJobs || 0} jobs done)</span>
                  </div>
                </div>
              </div>

              <div className="details-grid">
                <div className="detail-item">
                  <label>Verification Status</label>
                  <span className={`status-chip status-${selectedWorker.workerProfile?.verificationStatus.toLowerCase()}`}>
                    {selectedWorker.workerProfile?.verificationStatus}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Account Status</label>
                  <span className={`account-status-chip status-${selectedWorker.status.toLowerCase()}`}>
                    {selectedWorker.status}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Phone Number</label>
                  <span>{selectedWorker.phone}</span>
                </div>
                <div className="detail-item">
                  <label>Email Address</label>
                  <span>{selectedWorker.email}</span>
                </div>
                <div className="detail-item">
                  <label>Experience</label>
                  <span>{selectedWorker.workerProfile?.experienceYears || 0} Years</span>
                </div>
                <div className="detail-item">
                  <label>Starting Price</label>
                  <span>₹{selectedWorker.workerProfile?.startingPrice || 0}</span>
                </div>
                <div className="detail-item col-span-2">
                  <label>Service Domains / Specialties</label>
                  <div className="tags-row" style={{ marginTop: '4px' }}>
                    {selectedWorker.workerProfile?.workerServices?.length ? (
                      selectedWorker.workerProfile.workerServices.map((s, idx) => (
                        <span key={idx} className="category-tag">
                          {s.serviceCategory.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted">No service domains selected</span>
                    )}
                  </div>
                </div>
                <div className="detail-item col-span-2">
                  <label>Service States / Operating Areas</label>
                  <span>{selectedWorker.workerProfile?.serviceAreas || 'Not specified'}</span>
                </div>
                <div className="detail-item col-span-2">
                  <div className="id-proof-header-row">
                    <label>Government ID Proof (Aadhar Card / ID Document)</label>
                    {selectedWorker.workerProfile?.idProofUrl && (
                      <span className="badge-id-verified">
                        <FileCheck size={13} /> Document Attached
                      </span>
                    )}
                  </div>
                  {selectedWorker.workerProfile?.idProofUrl ? (
                    <div className="id-proof-preview-card">
                      <div
                        className="id-proof-image-wrapper"
                        onClick={() =>
                          setViewingIdProof({
                            url: selectedWorker.workerProfile!.idProofUrl!,
                            name: selectedWorker.name,
                            worker: selectedWorker,
                          })
                        }
                      >
                        <img
                          src={selectedWorker.workerProfile.idProofUrl}
                          alt="Government ID Proof"
                          className="id-proof-img"
                        />
                        <div className="id-proof-overlay">
                          <Maximize2 size={20} />
                          <span>Inspect Full Resolution</span>
                        </div>
                      </div>

                      <div className="id-proof-actions-row">
                        <button
                          className="btn-id-inspect"
                          onClick={() =>
                            setViewingIdProof({
                              url: selectedWorker.workerProfile!.idProofUrl!,
                              name: selectedWorker.name,
                              worker: selectedWorker,
                            })
                          }
                        >
                          <Maximize2 size={14} />
                          <span>Inspect Document</span>
                        </button>
                        <a
                          href={selectedWorker.workerProfile.idProofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-id-external"
                        >
                          <ExternalLink size={14} />
                          <span>Open Image in New Tab</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="id-proof-empty-box">
                      <AlertCircle size={18} />
                      <span>No Government ID proof uploaded during registration</span>
                    </div>
                  )}
                </div>
                <div className="detail-item col-span-2">
                  <label>Bio / Overview</label>
                  <span>{selectedWorker.workerProfile?.bio || 'No bio provided'}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {selectedWorker.workerProfile?.verificationStatus === 'PENDING_VERIFICATION' && (
                <>
                  <button
                    className="btn-modal-approve"
                    onClick={() => {
                      handleApprove(selectedWorker.id, selectedWorker.name);
                      setSelectedWorker(null);
                    }}
                  >
                    <CheckCircle size={16} />
                    <span>Approve Account</span>
                  </button>
                  <button
                    className="btn-modal-reject"
                    onClick={() => {
                      handleReject(selectedWorker.id, selectedWorker.name);
                      setSelectedWorker(null);
                    }}
                  >
                    <XCircle size={16} />
                    <span>Reject</span>
                  </button>
                </>
              )}
              <button className="btn-modal-close" onClick={() => setSelectedWorker(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {viewingIdProof && (
        <div className="modal-overlay" onClick={() => setViewingIdProof(null)}>
          <div className="modal-card id-inspection-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Government ID Document Inspection</h3>
                <p className="business-subtitle">Technician: <strong>{viewingIdProof.name}</strong></p>
              </div>
              <button className="btn-close" onClick={() => setViewingIdProof(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="id-inspection-body">
              <img
                src={viewingIdProof.url}
                alt="Government ID Document"
                className="id-full-preview-image"
              />
            </div>

            <div className="modal-footer id-inspection-footer">
              <a
                href={viewingIdProof.url}
                target="_blank"
                rel="noreferrer"
                className="btn-id-external"
                style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px' }}
              >
                <ExternalLink size={15} />
                <span>Open Original Image</span>
              </a>

              {viewingIdProof.worker.workerProfile?.verificationStatus === 'PENDING_VERIFICATION' && (
                <div className="id-inspection-decisions">
                  <button
                    className="btn-modal-approve"
                    onClick={() => {
                      handleApprove(viewingIdProof.worker.id, viewingIdProof.name);
                      setViewingIdProof(null);
                      if (selectedWorker?.id === viewingIdProof.worker.id) {
                        setSelectedWorker(null);
                      }
                    }}
                  >
                    <CheckCircle size={16} />
                    <span>Approve Technician</span>
                  </button>
                  <button
                    className="btn-modal-reject"
                    onClick={() => {
                      handleReject(viewingIdProof.worker.id, viewingIdProof.name);
                      setViewingIdProof(null);
                      if (selectedWorker?.id === viewingIdProof.worker.id) {
                        setSelectedWorker(null);
                      }
                    }}
                  >
                    <XCircle size={16} />
                    <span>Reject</span>
                  </button>
                </div>
              )}

              <button className="btn-modal-close" onClick={() => setViewingIdProof(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmWorker && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmWorker(null)}>
          <div className="modal-card delete-card" onClick={(e) => e.stopPropagation()}>
            <div className="delete-icon-wrapper">
              <AlertTriangle size={32} />
            </div>
            <h3>Delete Technician Account?</h3>
            <p>
              Are you sure you want to delete <strong>{deleteConfirmWorker.name}</strong>?
              This action cannot be undone and will delete their technician profile.
            </p>
            <div className="delete-modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteConfirmWorker(null)}>Cancel</button>
              <button
                className="btn-confirm-delete"
                onClick={() => handleDeleteUser(deleteConfirmWorker.id, deleteConfirmWorker.name)}
              >
                Yes, Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
