import { apiClient } from './client';

export interface DashboardMetricsResponse {
  metrics: {
    totalCustomers: number;
    totalWorkers: number;
    pendingWorkerApprovals: number;
    activeJobs: number;
    completedJobs: number;
    cancelledJobs: number;
    grossTransactionValue: number;
    platformRevenue: number;
    pendingDisputes: number;
  };
  recentJobs: Array<{
    id: string;
    jobCode: string;
    status: string;
    finalAmount?: number;
    createdAt: string;
    customer: { name: string };
    worker?: { name: string };
    category: { name: string };
  }>;
  weeklyTrends?: Array<{
    day: string;
    jobs: number;
    revenue: number;
  }>;
}

export interface WorkerAdminDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  workerProfile: {
    id: string;
    businessName?: string;
    bio?: string;
    experienceYears: number;
    startingPrice: number;
    serviceAreas?: string;
    verificationStatus: 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
    averageRating: number;
    totalJobs: number;
    workerServices: Array<{
      serviceCategory: { id: string; name: string; slug: string };
    }>;
  };
}

export interface CustomerAdminDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  customerProfile?: {
    id: string;
  };
  _count?: {
    customerJobs: number;
  };
}

export interface JobAdminDTO {
  id: string;
  jobCode: string;
  customerId: string;
  workerId?: string;
  categoryId: string;
  addressId: string;
  description: string;
  budgetMin?: number;
  budgetMax?: number;
  finalAmount?: number;
  scheduledAt: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  completedAt?: string;
  category: { id: string; name: string };
  address: { title: string; street: string; city: string; state: string; postalCode: string };
  customer: { id: string; name: string; phone: string; email: string; profileImageUrl?: string };
  worker?: { id: string; name: string; phone: string; email: string; profileImageUrl?: string };
  jobImages?: Array<{ id: string; imageUrl: string; imageType: string }>;
  statusHistory?: Array<{ id: string; fromStatus?: string; toStatus: string; changedBy: string; note?: string; createdAt: string }>;
}

export const adminApi = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post('/admin/auth/login', { email, password });
    return res.data.data;
  },

  getDashboard: async (): Promise<DashboardMetricsResponse> => {
    const res = await apiClient.get('/admin/dashboard');
    return res.data.data;
  },

  getWorkers: async (statusFilter?: string): Promise<WorkerAdminDTO[]> => {
    const res = await apiClient.get('/admin/workers', {
      params: { status: statusFilter },
    });
    return res.data.data;
  },

  approveWorker: async (workerUserId: string) => {
    const res = await apiClient.post(`/admin/workers/${workerUserId}/approve`);
    return res.data.data;
  },

  rejectWorker: async (workerUserId: string) => {
    const res = await apiClient.post(`/admin/workers/${workerUserId}/reject`);
    return res.data.data;
  },

  updateWorkerAccountStatus: async (workerUserId: string, status: string) => {
    const res = await apiClient.patch(`/admin/workers/${workerUserId}/status`, { status });
    return res.data.data;
  },

  getCustomers: async (): Promise<CustomerAdminDTO[]> => {
    const res = await apiClient.get('/admin/customers');
    return res.data.data;
  },

  updateCustomerAccountStatus: async (customerId: string, status: string) => {
    const res = await apiClient.patch(`/admin/customers/${customerId}/status`, { status });
    return res.data.data;
  },

  deleteUser: async (userId: string) => {
    const res = await apiClient.delete(`/admin/users/${userId}`);
    return res.data.data;
  },

  getJobs: async (): Promise<JobAdminDTO[]> => {
    const res = await apiClient.get('/admin/jobs');
    return res.data.data;
  },

  getJobById: async (jobId: string): Promise<JobAdminDTO> => {
    const res = await apiClient.get(`/admin/jobs/${jobId}`);
    return res.data.data;
  },

  getSettings: async () => {
    const res = await apiClient.get('/admin/settings');
    return res.data.data;
  },

  updateSetting: async (key: string, value: string) => {
    const res = await apiClient.patch('/admin/settings', { key, value });
    return res.data.data;
  },

  getAuditLogs: async () => {
    const res = await apiClient.get('/admin/audit-logs');
    return res.data.data;
  },
};
