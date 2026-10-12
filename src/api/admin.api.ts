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

export interface ServiceCategoryAdminDTO {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    workerServices: number;
    jobs: number;
  };
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
    idProofUrl?: string;
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
  extraCharges?: number;
  extraChargeReason?: string;
  extraChargeStatus?: string;
  category: { id: string; name: string };
  address: { title: string; street: string; city: string; state: string; postalCode: string };
  customer: { id: string; name: string; phone: string; email: string; profileImageUrl?: string };
  worker?: { id: string; name: string; phone: string; email: string; profileImageUrl?: string };
  jobImages?: Array<{ id: string; imageUrl: string; imageType: string }>;
  statusHistory?: Array<{ id: string; fromStatus?: string; toStatus: string; changedBy: string; note?: string; createdAt: string }>;
  disputes?: Array<{
    id: string;
    raisedById: string;
    reason: string;
    description: string;
    status: string;
    resolution?: string;
    adminNotes?: string;
    createdAt: string;
  }>;
}

export interface DisputeAdminDTO {
  id: string;
  jobId: string;
  raisedById: string;
  reason: string;
  description: string;
  status: 'DISPUTED' | 'RESOLVED' | 'REJECTED' | string;
  resolution?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  job: {
    jobCode: string;
    status: string;
    finalAmount?: number;
    customerId: string;
    workerId?: string;
  };
  raisedBy: {
    name: string;
    role: string;
    email: string;
    phone: string;
  };
}

export interface PayoutAdminDTO {
  id: string;
  workerId: string;
  amount: number;
  payoutMethod: 'UPI' | 'BANK_TRANSFER' | string;
  upiId?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  accountHolderName?: string;
  status: 'PENDING' | 'PROCESSED' | 'REJECTED' | string;
  referenceId?: string;
  adminNote?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
  worker: {
    id: string;
    name: string;
    email: string;
    phone: string;
    workerProfile?: {
      businessName?: string;
      startingPrice?: number;
    };
  };
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

  getCategories: async (includeInactive: boolean = true): Promise<ServiceCategoryAdminDTO[]> => {
    const res = await apiClient.get('/categories', {
      params: { includeInactive },
    });
    return res.data.data;
  },

  createCategory: async (data: { name: string; description?: string; iconUrl?: string; sortOrder?: number }) => {
    const res = await apiClient.post('/categories', data);
    return res.data.data;
  },

  updateCategory: async (id: string, data: Partial<{ name: string; description: string; iconUrl: string; sortOrder: number; isActive: boolean }>) => {
    const res = await apiClient.patch(`/categories/${id}`, data);
    return res.data.data;
  },

  deleteCategory: async (id: string) => {
    const res = await apiClient.delete(`/categories/${id}`);
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

  resetDatabase: async (data: { confirm?: string; resetSecret?: string; preserveAdmins?: boolean }) => {
    const headers: Record<string, string> = {};
    if (data.resetSecret) {
      headers['x-reset-secret'] = data.resetSecret;
    }
    const res = await apiClient.post('/admin/reset-database', data, { headers });
    return res.data.data;
  },

  getDisputes: async (): Promise<DisputeAdminDTO[]> => {
    const res = await apiClient.get('/admin/disputes');
    return res.data.data;
  },

  resolveDispute: async (
    disputeId: string,
    data: { status: 'RESOLVED' | 'REJECTED'; resolution: string; adminNotes?: string }
  ) => {
    const res = await apiClient.patch(`/admin/disputes/${disputeId}`, data);
    return res.data.data;
  },

  getPayouts: async (): Promise<PayoutAdminDTO[]> => {
    const res = await apiClient.get('/admin/payouts');
    return res.data.data;
  },

  getJobInvoice: async (jobId: string) => {
    const res = await apiClient.get(`/jobs/${jobId}/invoice`);
    return res.data.data;
  },
};

