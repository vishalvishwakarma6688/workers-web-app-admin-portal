import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  ShieldOff,
  Trash2,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { adminApi, type CustomerAdminDTO } from '../../api/admin.api';
import './Customers.css';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerAdminDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deleteConfirmCustomer, setDeleteConfirmCustomer] = useState<CustomerAdminDTO | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getCustomers();
      setCustomers(res);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load customers:', err);
      setError('Could not load customer accounts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleStatusToggle = async (customerId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await adminApi.updateCustomerAccountStatus(customerId, nextStatus);
      setActionMsg(`Customer status updated to ${nextStatus}.`);
      fetchCustomers();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update customer status');
    }
  };

  const handleDeleteUser = async (customerId: string, name: string) => {
    try {
      await adminApi.deleteUser(customerId);
      setActionMsg(`Customer account for ${name} deleted successfully.`);
      setDeleteConfirmCustomer(null);
      fetchCustomers();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to delete customer');
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const term = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.phone.includes(term)
    );
  });

  return (
    <div className="customers-page">
      {error && <div className="login-error-alert">{error}</div>}
      {actionMsg && (
        <div className="alert-toast-success">
          <CheckCircle size={18} />
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg(null)} className="close-toast">&times;</button>
        </div>
      )}

      <div className="page-header-card">
        <div className="header-info">
          <h2>Customer Directory</h2>
          <p>Total Registered Hiring Customers: {customers.length}</p>
        </div>

        <div className="search-bar-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search customer by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="table-card">
        {isLoading ? (
          <div className="table-loading">
            <div className="spinner"></div>
            <p>Loading customer accounts...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="empty-state">
            <Users size={48} className="empty-icon" />
            <h3>No customers found</h3>
            <p>No customer accounts match your search filter.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Contact Info</th>
                  <th>Joined Date</th>
                  <th>Total Jobs Placed</th>
                  <th>Account Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="customer-info-cell">
                        <div className="customer-avatar">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="customer-name">{c.name}</div>
                          <div className="customer-role">CUSTOMER</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-cell">
                        <div><Phone size={13} /> {c.phone}</div>
                        <div className="text-muted"><Mail size={13} /> {c.email}</div>
                      </div>
                    </td>
                    <td>
                      <div className="date-cell">
                        <Calendar size={13} />
                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td>
                      <span className="job-count-badge">
                        {c._count?.customerJobs || 0} Jobs
                      </span>
                    </td>
                    <td>
                      <span className={`account-status-chip status-${c.status.toLowerCase()}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className={`btn-action icon-only ${c.status === 'ACTIVE' ? 'suspend' : 'activate'}`}
                        title={c.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
                        onClick={() => handleStatusToggle(c.id, c.status)}
                      >
                        {c.status === 'ACTIVE' ? <ShieldOff size={16} /> : <ShieldCheck size={16} />}
                      </button>

                      <button
                        className="btn-action icon-only danger"
                        title="Delete Customer Account"
                        onClick={() => setDeleteConfirmCustomer(c)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteConfirmCustomer && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmCustomer(null)}>
          <div className="modal-card delete-card" onClick={(e) => e.stopPropagation()}>
            <div className="delete-icon-wrapper">
              <AlertTriangle size={32} />
            </div>
            <h3>Delete Customer Account?</h3>
            <p>
              Are you sure you want to delete customer account for <strong>{deleteConfirmCustomer.name}</strong>?
              This action is permanent and will delete their customer profile.
            </p>
            <div className="delete-modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteConfirmCustomer(null)}>Cancel</button>
              <button
                className="btn-confirm-delete"
                onClick={() => handleDeleteUser(deleteConfirmCustomer.id, deleteConfirmCustomer.name)}
              >
                Yes, Delete Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
