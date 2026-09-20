import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  Search,
  Eye,
  Calendar,
  User,
  Wrench,
  Image as ImageIcon,
  X,
  FileText,
} from 'lucide-react';
import { adminApi, type JobAdminDTO } from '../../api/admin.api';
import './Jobs.css';

type JobStatusFilter = 'ALL' | 'REQUESTED' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<JobAdminDTO[]>([]);
  const [statusFilter, setStatusFilter] = useState<JobStatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedJob, setSelectedJob] = useState<JobAdminDTO | null>(null);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getJobs();
      setJobs(res);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load jobs:', err);
      setError('Could not load platform jobs list.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const openJobModal = async (jobId: string) => {
    try {
      const jobDetail = await adminApi.getJobById(jobId);
      setSelectedJob(jobDetail);
    } catch (err: any) {
      alert('Could not fetch complete job details.');
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const matchStatus = statusFilter === 'ALL' || j.status === statusFilter;
    const term = searchQuery.toLowerCase();
    const matchSearch =
      j.jobCode.toLowerCase().includes(term) ||
      j.category.name.toLowerCase().includes(term) ||
      j.customer.name.toLowerCase().includes(term) ||
      (j.worker?.name && j.worker.name.toLowerCase().includes(term));

    return matchStatus && matchSearch;
  });

  return (
    <div className="jobs-page">
      {error && <div className="login-error-alert">{error}</div>}
      <div className="page-header-card">
        <div className="tab-buttons scrollable">
          {(['ALL', 'REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as JobStatusFilter[]).map(
            (status) => (
              <button
                key={status}
                className={`tab-btn ${statusFilter === status ? 'active' : ''}`}
                onClick={() => setStatusFilter(status)}
              >
                <span>{status === 'ALL' ? 'All Orders' : status.replace('_', ' ')}</span>
              </button>
            )
          )}
        </div>

        <div className="search-bar-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by job code, customer, technician..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="table-card">
        {isLoading ? (
          <div className="table-loading">
            <div className="spinner"></div>
            <p>Loading service jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="empty-state">
            <Briefcase size={48} className="empty-icon" />
            <h3>No jobs found</h3>
            <p>No job orders match the selected filter criteria.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Job Code</th>
                  <th>Service Category</th>
                  <th>Customer</th>
                  <th>Assigned Technician</th>
                  <th>Scheduled Date</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((j) => (
                  <tr key={j.id}>
                    <td>
                      <span className="code-tag">{j.jobCode}</span>
                    </td>
                    <td>
                      <div className="category-cell">
                        <Wrench size={14} className="cat-icon" />
                        <span>{j.category.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="person-cell">
                        <User size={13} />
                        <span>{j.customer.name}</span>
                      </div>
                    </td>
                    <td>
                      {j.worker ? (
                        <div className="person-cell worker">
                          <Wrench size={13} />
                          <span>{j.worker.name}</span>
                        </div>
                      ) : (
                        <span className="unassigned-text">Unassigned</span>
                      )}
                    </td>
                    <td>
                      <div className="date-cell">
                        <Calendar size={13} />
                        <span>{new Date(j.scheduledAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-${j.status.toLowerCase()}`}>
                        {j.status}
                      </span>
                    </td>
                    <td className="font-semibold">
                      ₹{j.finalAmount || j.budgetMax || j.budgetMin || 0}
                    </td>
                    <td className="actions-cell">
                      <button
                        className="btn-action inspect"
                        onClick={() => openJobModal(j.id)}
                        title="Inspect Job & Completion Proof"
                      >
                        <Eye size={16} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedJob && (
        <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
          <div className="modal-card job-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="job-modal-title">
                <span className="code-tag large">{selectedJob.jobCode}</span>
                <h3>{selectedJob.category.name} Service</h3>
              </div>
              <button className="btn-close" onClick={() => setSelectedJob(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="job-status-banner">
                <span>Current Status:</span>
                <span className={`status-badge status-${selectedJob.status.toLowerCase()}`}>
                  {selectedJob.status}
                </span>
                <span className="payment-status-chip">
                  Payment: {selectedJob.paymentStatus}
                </span>
              </div>

              {selectedJob.jobImages && selectedJob.jobImages.length > 0 && (
                <div className="proof-photos-section">
                  <h4><ImageIcon size={18} /> Work Completion Proof & Photos</h4>
                  <div className="proof-gallery">
                    {selectedJob.jobImages.map((img) => (
                      <div key={img.id} className="proof-image-card">
                        <img src={img.imageUrl} alt="Proof" />
                        <span className="image-type-badge">{img.imageType}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="details-grid">
                <div className="detail-item">
                  <label>Customer</label>
                  <span>{selectedJob.customer.name} ({selectedJob.customer.phone})</span>
                </div>
                <div className="detail-item">
                  <label>Technician</label>
                  <span>{selectedJob.worker ? `${selectedJob.worker.name} (${selectedJob.worker.phone})` : 'Unassigned'}</span>
                </div>
                <div className="detail-item col-span-2">
                  <label>Service Address</label>
                  <span>{selectedJob.address.title}: {selectedJob.address.street}, {selectedJob.address.city}, {selectedJob.address.state} - {selectedJob.address.postalCode}</span>
                </div>
                <div className="detail-item col-span-2">
                  <label>Problem Description</label>
                  <span>{selectedJob.description}</span>
                </div>
              </div>

              {selectedJob.statusHistory && selectedJob.statusHistory.length > 0 && (
                <div className="history-section">
                  <h4><FileText size={18} /> Status History & Notes</h4>
                  <div className="history-timeline">
                    {selectedJob.statusHistory.map((h) => (
                      <div key={h.id} className="timeline-item">
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                          <div className="timeline-status-row">
                            <span className="font-semibold">{h.toStatus}</span>
                            <span className="text-muted text-xs">{new Date(h.createdAt).toLocaleString()}</span>
                          </div>
                          {h.note && <p className="timeline-note">{h.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-modal-close" onClick={() => setSelectedJob(null)}>
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
