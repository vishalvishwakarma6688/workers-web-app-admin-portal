import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Briefcase,
  TrendingUp,
  DollarSign,
  AlertCircle,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { adminApi, type DashboardMetricsResponse } from '../../api/admin.api';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardMetricsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getDashboard();
      setData(res);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load dashboard metrics:', err);
      setError('Could not load dashboard data. Please check backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (isLoading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Fetching platform analytics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-error">
        <AlertCircle size={40} className="error-icon" />
        <p>{error || 'Failed to display dashboard.'}</p>
        <button className="btn-retry" onClick={fetchMetrics}>Retry Loading</button>
      </div>
    );
  }

  const { metrics, recentJobs, weeklyTrends } = data;

  const chartData = weeklyTrends && weeklyTrends.length > 0
    ? weeklyTrends
    : [
        { day: 'Mon', jobs: 0, revenue: 0 },
        { day: 'Tue', jobs: 0, revenue: 0 },
        { day: 'Wed', jobs: 0, revenue: 0 },
        { day: 'Thu', jobs: 0, revenue: 0 },
        { day: 'Fri', jobs: 0, revenue: 0 },
        { day: 'Sat', jobs: 0, revenue: 0 },
        { day: 'Sun', jobs: 0, revenue: 0 },
      ];

  return (
    <div className="dashboard-page">
      {metrics.pendingWorkerApprovals > 0 && (
        <div className="approval-alert-banner">
          <div className="banner-content">
            <UserCheck size={24} className="banner-icon" />
            <div>
              <h3>{metrics.pendingWorkerApprovals} Worker Account{metrics.pendingWorkerApprovals > 1 ? 's' : ''} Awaiting Approval!</h3>
              <p>Technicians cannot receive job requests until an administrator verifies and approves their account.</p>
            </div>
          </div>
          <Link to="/workers" className="btn-banner-action">
            <span>Review Approvals</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      )}

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="card-header">
            <span className="metric-title">Total Customers</span>
            <div className="icon-wrapper blue">
              <Users size={20} />
            </div>
          </div>
          <div className="metric-value">{metrics.totalCustomers}</div>
          <div className="metric-subtext">Active hiring users</div>
        </div>

        <div className="metric-card">
          <div className="card-header">
            <span className="metric-title">Total Workers</span>
            <div className="icon-wrapper emerald">
              <UserCheck size={20} />
            </div>
          </div>
          <div className="metric-value">{metrics.totalWorkers}</div>
          <div className="metric-subtext">Registered technicians</div>
        </div>

        <div className="metric-card highlight-amber">
          <div className="card-header">
            <span className="metric-title">Pending Approvals</span>
            <div className="icon-wrapper amber">
              <Clock size={20} />
            </div>
          </div>
          <div className="metric-value">{metrics.pendingWorkerApprovals}</div>
          <div className="metric-subtext">Action required</div>
        </div>

        <div className="metric-card">
          <div className="card-header">
            <span className="metric-title">Active Jobs</span>
            <div className="icon-wrapper purple">
              <Briefcase size={20} />
            </div>
          </div>
          <div className="metric-value">{metrics.activeJobs}</div>
          <div className="metric-subtext">In progress / requested</div>
        </div>

        <div className="metric-card">
          <div className="card-header">
            <span className="metric-title">Gross Volume</span>
            <div className="icon-wrapper green">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="metric-value">₹{metrics.grossTransactionValue.toLocaleString('en-IN')}</div>
          <div className="metric-subtext">Total payments volume</div>
        </div>

        <div className="metric-card">
          <div className="card-header">
            <span className="metric-title">Platform Revenue</span>
            <div className="icon-wrapper indigo">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="metric-value">₹{metrics.platformRevenue.toLocaleString('en-IN')}</div>
          <div className="metric-subtext">Platform fees earned</div>
        </div>
      </div>

      <div className="dashboard-columns">
        <div className="dashboard-card chart-card">
          <div className="card-title-row">
            <h3>Revenue & Job Volume Trend</h3>
            <span className="time-badge">Weekly View</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="day" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (₹)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-card recent-jobs-card">
          <div className="card-title-row">
            <h3>Recent Job Orders</h3>
            <Link to="/jobs" className="view-all-link">View All Jobs →</Link>
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Job Code</th>
                  <th>Category</th>
                  <th>Customer</th>
                  <th>Worker</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-table-cell">No recent jobs found</td>
                  </tr>
                ) : (
                  recentJobs.map((job) => (
                    <tr key={job.id}>
                      <td data-label="Job Code"><span className="code-tag">{job.jobCode}</span></td>
                      <td data-label="Category">{job.category?.name || 'Service'}</td>
                      <td data-label="Customer">{job.customer?.name || 'Unknown'}</td>
                      <td data-label="Technician">{job.worker?.name || <span className="text-muted">Unassigned</span>}</td>
                      <td data-label="Status">
                        <span className={`status-badge status-${job.status.toLowerCase()}`}>
                          {job.status}
                        </span>
                      </td>
                      <td data-label="Amount" className="font-semibold">₹{job.finalAmount || 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
