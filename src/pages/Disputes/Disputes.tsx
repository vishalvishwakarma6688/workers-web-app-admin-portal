import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Wrench,
  FileText,
  X,
  AlertTriangle,
} from 'lucide-react';
import { adminApi, type DisputeAdminDTO } from '../../api/admin.api';
import './Disputes.css';

type DisputeStatusFilter = 'ALL' | 'DISPUTED' | 'RESOLVED' | 'REJECTED';

export const Disputes: React.FC = () => {
  const [disputes, setDisputes] = useState<DisputeAdminDTO[]>([]);
  const [statusFilter, setStatusFilter] = useState<DisputeStatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Resolution modal state
  const [selectedDispute, setSelectedDispute] = useState<DisputeAdminDTO | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<'RESOLVED' | 'REJECTED'>('RESOLVED');
  const [resolutionText, setResolutionText] = useState('');
  const [adminNotesText, setAdminNotesText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchDisputes = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getDisputes();
      setDisputes(res);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load disputes:', err);
      setError('Could not load dispute tickets from server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const openResolveModal = (dispute: DisputeAdminDTO) => {
    setSelectedDispute(dispute);
    setResolutionStatus(dispute.status === 'REJECTED' ? 'REJECTED' : 'RESOLVED');
    setResolutionText(dispute.resolution || '');
    setAdminNotesText(dispute.adminNotes || '');
    setModalError(null);
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute) return;

    if (!resolutionText || resolutionText.trim().length < 5) {
      setModalError('Please enter detailed resolution notes (at least 5 characters).');
      return;
    }

    try {
      setIsSubmitting(true);
      setModalError(null);

      await adminApi.resolveDispute(selectedDispute.id, {
        status: resolutionStatus,
        resolution: resolutionText.trim(),
        adminNotes: adminNotesText.trim() || undefined,
      });

      setSuccessToast(`Dispute #${selectedDispute.id.slice(0, 8)} successfully updated to ${resolutionStatus}.`);
      setSelectedDispute(null);
      await fetchDisputes();
    } catch (err: any) {
      console.error('Failed to resolve dispute:', err);
      setModalError(err.response?.data?.message || err.message || 'Failed to update dispute resolution.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDisputes = disputes.filter((d) => {
    const matchStatus = statusFilter === 'ALL' || d.status === statusFilter;
    const term = searchQuery.toLowerCase();
    const matchSearch =
      d.job?.jobCode?.toLowerCase().includes(term) ||
      d.reason?.toLowerCase().includes(term) ||
      d.raisedBy?.name?.toLowerCase().includes(term) ||
      d.raisedBy?.email?.toLowerCase().includes(term) ||
      d.description?.toLowerCase().includes(term);

    return matchStatus && matchSearch;
  });

  const totalCount = disputes.length;
  const openCount = disputes.filter((d) => d.status === 'DISPUTED').length;
  const resolvedCount = disputes.filter((d) => d.status === 'RESOLVED').length;
  const rejectedCount = disputes.filter((d) => d.status === 'REJECTED').length;

  return (
    <div className="disputes-page">
      {successToast && (
        <div className="alert-toast-success">
          <CheckCircle size={18} />
          <span>{successToast}</span>
          <span className="close-toast" onClick={() => setSuccessToast(null)}>
            &times;
          </span>
        </div>
      )}

      {error && <div className="login-error-alert">{error}</div>}

      {/* Metrics Banner */}
      <div className="disputes-metrics-grid">
        <div className="dispute-stat-card">
          <div className="stat-icon-wrapper total">
            <ShieldAlert size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{totalCount}</span>
            <span className="stat-label">Total Disputes</span>
          </div>
        </div>

        <div className="dispute-stat-card highlight-open">
          <div className="stat-icon-wrapper open">
            <AlertTriangle size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{openCount}</span>
            <span className="stat-label">Active Under Review</span>
          </div>
        </div>

        <div className="dispute-stat-card">
          <div className="stat-icon-wrapper resolved">
            <CheckCircle size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{resolvedCount}</span>
            <span className="stat-label">Resolved Tickets</span>
          </div>
        </div>

        <div className="dispute-stat-card">
          <div className="stat-icon-wrapper rejected">
            <XCircle size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{rejectedCount}</span>
            <span className="stat-label">Rejected / Closed</span>
          </div>
        </div>
      </div>

      {/* Filters and Search Header */}
      <div className="page-header-card">
        <div className="tab-buttons scrollable">
          {(['ALL', 'DISPUTED', 'RESOLVED', 'REJECTED'] as DisputeStatusFilter[]).map((st) => (
            <button
              key={st}
              className={`tab-btn ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              <span>{st === 'ALL' ? 'All Disputes' : st === 'DISPUTED' ? 'Under Review' : st}</span>
              {st === 'DISPUTED' && openCount > 0 && (
                <span className="badge-pill-danger">{openCount}</span>
              )}
            </button>
          ))}
        </div>

        <div className="search-bar-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by job code, complainant, reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Disputes Table */}
      <div className="table-card">
        {isLoading ? (
          <div className="table-loading">
            <div className="spinner"></div>
            <p>Loading dispute tickets...</p>
          </div>
        ) : filteredDisputes.length === 0 ? (
          <div className="empty-state">
            <ShieldAlert size={48} className="empty-icon" />
            <h3>No Dispute Tickets Found</h3>
            <p>
              {searchQuery
                ? 'No disputes match your current search criteria.'
                : 'Great news! There are currently no complaints or disputes reported.'}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Job Code</th>
                  <th>Complainant</th>
                  <th>Dispute Category</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Date Reported</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDisputes.map((d) => (
                  <tr key={d.id}>
                    <td data-label="Job Code">
                      <span className="code-tag">{d.job?.jobCode || 'N/A'}</span>
                    </td>
                    <td data-label="Complainant">
                      <div className="person-cell">
                        <User size={14} />
                        <div>
                          <div style={{ fontWeight: 600 }}>{d.raisedBy?.name || 'Anonymous'}</div>
                          <span className={`role-chip ${d.raisedBy?.role?.toLowerCase()}`}>
                            {d.raisedBy?.role}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td data-label="Reason">
                      <span className="dispute-reason-badge">
                        {d.reason}
                      </span>
                    </td>
                    <td data-label="Description">
                      <div className="description-cell" title={d.description}>
                        {d.description}
                      </div>
                    </td>
                    <td data-label="Status">
                      <span
                        className={`status-badge ${
                          d.status === 'DISPUTED'
                            ? 'status-disputed'
                            : d.status === 'RESOLVED'
                            ? 'status-approved'
                            : 'status-rejected'
                        }`}
                      >
                        {d.status === 'DISPUTED' ? 'UNDER REVIEW' : d.status}
                      </span>
                    </td>
                    <td data-label="Reported">
                      <div className="date-cell">
                        <Clock size={13} />
                        <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="actions-cell" style={{ textAlign: 'right' }}>
                      <button
                        className={`btn-action ${d.status === 'DISPUTED' ? 'btn-mediate' : 'btn-view'}`}
                        onClick={() => openResolveModal(d)}
                        title={d.status === 'DISPUTED' ? 'Mediate & Resolve Dispute' : 'View Resolution Details'}
                      >
                        {d.status === 'DISPUTED' ? (
                          <>
                            <Wrench size={14} style={{ marginRight: 4 }} />
                            <span>Mediate</span>
                          </>
                        ) : (
                          <>
                            <FileText size={14} style={{ marginRight: 4 }} />
                            <span>View</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resolution & Details Modal Dialog */}
      {selectedDispute && (
        <div className="modal-backdrop" onClick={() => setSelectedDispute(null)}>
          <div className="modal-container dispute-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="dispute-modal-title">
                <ShieldAlert size={22} className="text-danger" />
                <div>
                  <h3>Dispute Ticket #{selectedDispute.id.slice(0, 8)}</h3>
                  <span className="subtitle">
                    Job #{selectedDispute.job?.jobCode} • Reported by {selectedDispute.raisedBy?.name} (
                    {selectedDispute.raisedBy?.role})
                  </span>
                </div>
              </div>
              <button
                className="btn-modal-close"
                onClick={() => setSelectedDispute(null)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {modalError && <div className="modal-error-alert">{modalError}</div>}

              {/* Dispute Information Box */}
              <div className="dispute-summary-card">
                <div className="summary-field">
                  <span className="field-label">Dispute Reason:</span>
                  <span className="field-value highlight">{selectedDispute.reason}</span>
                </div>
                <div className="summary-field">
                  <span className="field-label">Complainant Contact:</span>
                  <span className="field-value">
                    {selectedDispute.raisedBy?.phone} • {selectedDispute.raisedBy?.email}
                  </span>
                </div>
                <div className="summary-field">
                  <span className="field-label">Reported Description:</span>
                  <div className="field-description-box">
                    "{selectedDispute.description}"
                  </div>
                </div>
              </div>

              {selectedDispute.status !== 'DISPUTED' ? (
                /* Already Resolved Display */
                <div className="resolution-history-box">
                  <div className="resolution-header-row">
                    <CheckCircle size={18} className="text-success" />
                    <h4>Official Support Resolution:</h4>
                  </div>
                  <div className="resolution-text">
                    "{selectedDispute.resolution}"
                  </div>

                  {selectedDispute.adminNotes && (
                    <div className="admin-notes-row">
                      <span className="notes-label">Internal Admin Audit Notes:</span>
                      <p>{selectedDispute.adminNotes}</p>
                    </div>
                  )}

                  <div className="resolved-at-text">
                    Ticket Status: <strong>{selectedDispute.status}</strong> • Last Updated:{' '}
                    {new Date(selectedDispute.updatedAt).toLocaleString()}
                  </div>
                </div>
              ) : (
                /* Active Resolution Form */
                <form onSubmit={handleResolveSubmit} className="resolution-form">
                  <div className="form-group">
                    <label className="form-label">Select Resolution Outcome:</label>
                    <div className="radio-group-row">
                      <label
                        className={`radio-box ${resolutionStatus === 'RESOLVED' ? 'selected-success' : ''}`}
                      >
                        <input
                          type="radio"
                          name="resolutionStatus"
                          value="RESOLVED"
                          checked={resolutionStatus === 'RESOLVED'}
                          onChange={() => setResolutionStatus('RESOLVED')}
                        />
                        <CheckCircle size={16} />
                        <div>
                          <strong>Accept & Resolve</strong>
                          <span>Issue support mediation or refund</span>
                        </div>
                      </label>

                      <label
                        className={`radio-box ${resolutionStatus === 'REJECTED' ? 'selected-danger' : ''}`}
                      >
                        <input
                          type="radio"
                          name="resolutionStatus"
                          value="REJECTED"
                          checked={resolutionStatus === 'REJECTED'}
                          onChange={() => setResolutionStatus('REJECTED')}
                        />
                        <XCircle size={16} />
                        <div>
                          <strong>Dismiss / Reject</strong>
                          <span>Close ticket as unsubstantiated</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Official Resolution Note: <span className="required">*</span>
                    </label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="e.g. Free rework authorized with verified pro / Full refund of final amount credited to customer account..."
                      value={resolutionText}
                      onChange={(e) => setResolutionText(e.target.value)}
                      required
                    />
                    <span className="helper-text">
                      This resolution note will be dispatched directly to both the Customer and Technician.
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Internal Audit Notes (Optional):</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Optional notes for admin team audit logs..."
                      value={adminNotesText}
                      onChange={(e) => setAdminNotesText(e.target.value)}
                    />
                  </div>

                  <div className="modal-footer-actions">
                    <button
                      type="button"
                      className="btn-modal-secondary"
                      onClick={() => setSelectedDispute(null)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-modal-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting Resolution...' : 'Confirm Resolution'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
