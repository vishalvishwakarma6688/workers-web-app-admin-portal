import React, { useEffect, useState } from 'react';
import {
  Wallet,
  Search,
  CreditCard,
  Building,
  CheckCircle,
  Clock,
  User,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { adminApi, type PayoutAdminDTO } from '../../api/admin.api';
import './Payouts.css';

type PayoutStatusFilter = 'ALL' | 'PROCESSED' | 'PENDING' | 'REJECTED';

export const Payouts: React.FC = () => {
  const [payouts, setPayouts] = useState<PayoutAdminDTO[]>([]);
  const [statusFilter, setStatusFilter] = useState<PayoutStatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayouts = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getPayouts();
      setPayouts(res);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load payouts:', err);
      setError('Could not load technician payout records from server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const filteredPayouts = payouts.filter((p) => {
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const term = searchQuery.toLowerCase();
    const matchSearch =
      p.worker?.name?.toLowerCase().includes(term) ||
      p.worker?.email?.toLowerCase().includes(term) ||
      p.worker?.phone?.toLowerCase().includes(term) ||
      p.upiId?.toLowerCase().includes(term) ||
      p.bankAccountNumber?.toLowerCase().includes(term) ||
      p.referenceId?.toLowerCase().includes(term);

    return matchStatus && matchSearch;
  });

  const totalDisbursed = payouts
    .filter((p) => p.status === 'PROCESSED')
    .reduce((sum, p) => sum + p.amount, 0);

  const upiCount = payouts.filter((p) => p.payoutMethod === 'UPI').length;
  const bankCount = payouts.filter((p) => p.payoutMethod === 'BANK_TRANSFER').length;

  return (
    <div className="payouts-page">
      {error && <div className="login-error-alert">{error}</div>}

      {/* Metrics Grid */}
      <div className="payouts-metrics-grid">
        <div className="payout-stat-card total-card">
          <div className="stat-icon-wrapper total-disbursed">
            <TrendingUp size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-value">₹{totalDisbursed.toLocaleString('en-IN')}</span>
            <span className="stat-label">Total Withdrawn by Pros</span>
          </div>
        </div>

        <div className="payout-stat-card">
          <div className="stat-icon-wrapper total-count">
            <Wallet size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{payouts.length}</span>
            <span className="stat-label">Total Payout Requests</span>
          </div>
        </div>

        <div className="payout-stat-card">
          <div className="stat-icon-wrapper upi-count">
            <CreditCard size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{upiCount}</span>
            <span className="stat-label">Instant UPI Transfers</span>
          </div>
        </div>

        <div className="payout-stat-card">
          <div className="stat-icon-wrapper bank-count">
            <Building size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{bankCount}</span>
            <span className="stat-label">Bank IMPS Transfers</span>
          </div>
        </div>
      </div>

      {/* Page Header with Tabs and Search */}
      <div className="page-header-card">
        <div className="tab-buttons scrollable">
          {(['ALL', 'PROCESSED', 'PENDING', 'REJECTED'] as PayoutStatusFilter[]).map((st) => (
            <button
              key={st}
              className={`tab-btn ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              <span>{st === 'ALL' ? 'All Withdrawals' : st}</span>
            </button>
          ))}
        </div>

        <div className="search-bar-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by worker, UPI ID, A/C number, UTR..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="table-card">
        {isLoading ? (
          <div className="table-loading">
            <div className="spinner"></div>
            <p>Loading technician payout records...</p>
          </div>
        ) : filteredPayouts.length === 0 ? (
          <div className="empty-state">
            <Wallet size={48} className="empty-icon" />
            <h3>No Payout Records Found</h3>
            <p>
              {searchQuery
                ? 'No withdrawal records match your search criteria.'
                : 'Technicians haven’t requested any wallet withdrawals yet.'}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Technician</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Destination Credentials</th>
                  <th>Status</th>
                  <th>UTR / Reference ID</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayouts.map((p) => (
                  <tr key={p.id}>
                    <td data-label="Technician">
                      <div className="person-cell">
                        <User size={14} />
                        <div>
                          <div style={{ fontWeight: 600 }}>{p.worker?.name || 'Technician'}</div>
                          <span className="worker-subtitle">
                            {p.worker?.workerProfile?.businessName || p.worker?.phone}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td data-label="Amount">
                      <div className="amount-cell">
                        <ArrowUpRight size={14} className="text-success" />
                        <span className="payout-amount">₹{p.amount.toLocaleString('en-IN')}</span>
                      </div>
                    </td>

                    <td data-label="Method">
                      <span className={`payout-method-badge method-${p.payoutMethod?.toLowerCase()}`}>
                        {p.payoutMethod === 'UPI' ? (
                          <>
                            <CreditCard size={12} style={{ marginRight: 4 }} />
                            UPI (Instant)
                          </>
                        ) : (
                          <>
                            <Building size={12} style={{ marginRight: 4 }} />
                            Bank IMPS
                          </>
                        )}
                      </span>
                    </td>

                    <td data-label="Destination">
                      {p.payoutMethod === 'UPI' ? (
                        <div className="destination-upi">
                          <span className="code-tag">{p.upiId || 'N/A'}</span>
                        </div>
                      ) : (
                        <div className="destination-bank">
                          <span style={{ fontWeight: 600 }}>A/C: {p.bankAccountNumber || 'N/A'}</span>
                          <span className="bank-meta">
                            IFSC: {p.bankIfsc || 'N/A'} • {p.accountHolderName || ''}
                          </span>
                        </div>
                      )}
                    </td>

                    <td data-label="Status">
                      <span
                        className={`status-badge ${
                          p.status === 'PROCESSED'
                            ? 'status-approved'
                            : p.status === 'PENDING'
                            ? 'status-pending_verification'
                            : 'status-rejected'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    <td data-label="Reference ID">
                      <span className="code-tag utr-tag">
                        {p.referenceId || 'N/A'}
                      </span>
                    </td>

                    <td data-label="Date">
                      <div className="date-cell">
                        <Clock size={13} />
                        <span>
                          {new Date(p.processedAt || p.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
