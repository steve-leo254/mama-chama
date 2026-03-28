// src/services/api.ts
import type {
  Member, Contribution, Loan, Fine, DepositRecord, WithdrawRequest,
  Transaction, LoanRepaymentRecord, LoanRepayment, MerryGoRoundCycle, MemberStats, Meeting, Notification
} from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

// Types for API requests/responses
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  user: Member;
}

// Generic API client
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async postWithFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();
    const headers = {
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

const apiClient = new ApiClient(API_BASE_URL);

// Auth API
export const authAPI = {
  login: (data: LoginRequest) => apiClient.post<LoginResponse>('/auth/login', data),
  register: (data: any) => apiClient.post<LoginResponse>('/auth/register', data),
  getMe: () => apiClient.get<Member>('/auth/me'),
  validateToken: () => apiClient.get<Member>('/auth/me'),
  changePassword: (data: any) => apiClient.post<any>('/auth/change-password', data),
  forgotPassword: (email: string) => apiClient.post<any>('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) => apiClient.post<any>('/auth/reset-password', { token, newPassword }),
  setToken: (token: string) => apiClient.setToken(token),
  getToken: () => apiClient.getToken(),
};

// Members API
export const membersAPI = {
  list: (params?: { status?: string; search?: string }) => {
    const queryString = params && Object.keys(params).length > 0 
      ? `?${new URLSearchParams(params as any).toString()}` 
      : '';
    return apiClient.get<Member[]>(`/members${queryString}`);
  },
  get: (id: string) => apiClient.get<Member>(`/members/${id}`),
  create: (data: any) => apiClient.post<Member>('/members', data),
  update: (id: string, data: any) => apiClient.put<Member>(`/members/${id}`, data),
  getStats: (id: string) => apiClient.get<MemberStats>(`/members/${id}/stats`),
  uploadAvatar: (memberId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.postWithFormData<any>(`/members/${memberId}/upload-avatar`, formData);
  },
};

// Contributions API
export const contributionsAPI = {
  list: (params?: { member_id?: string; status?: string; month?: string; type?: string }) =>
    apiClient.get<Contribution[]>(`/contributions${new URLSearchParams(params as any).toString()}`),
  create: (data: any) => apiClient.post<Contribution>('/contributions', data),
  update: (id: string, data: any) => apiClient.put<Contribution>(`/contributions/${id}`, data),
};

// Loans API
export const loansAPI = {
  list: (params?: { member_id?: string; status?: string }) =>
    apiClient.get<Loan[]>(`/loans${new URLSearchParams(params as any).toString()}`),
  create: (data: any) => apiClient.post<Loan>('/loans', data),
  approve: (id: string) => apiClient.put<Loan>(`/loans/${id}/approve`),
  reject: (id: string) => apiClient.put<Loan>(`/loans/${id}/reject`),
  repay: (data: any) => apiClient.post<any>('/loans/repay', data),
  getRepayments: (id: string) => apiClient.get<LoanRepaymentRecord[]>(`/loans/${id}/repayments`),
};

// Fines API
export const finesAPI = {
  list: (params?: { member_id?: string; status?: string }) =>
    apiClient.get<Fine[]>(`/fines${new URLSearchParams(params as any).toString()}`),
  create: (data: any) => apiClient.post<Fine>('/fines', data),
  pay: (id: string) => apiClient.put<Fine>(`/fines/${id}/pay`),
};

// Deposits API
export const depositsAPI = {
  list: (member_id?: string) =>
    apiClient.get<DepositRecord[]>(`/deposits${member_id ? `?member_id=${member_id}` : ''}`),
  create: (data: any) => apiClient.post<DepositRecord>('/deposits', data),
};

// Transactions API
export const transactionsAPI = {
  list: (member_id?: string) =>
    apiClient.get<Transaction[]>(`/transactions${member_id ? `?member_id=${member_id}` : ''}`),
  create: (data: any) => apiClient.post<Transaction>('/transactions', data),
};

// Withdraw Requests API
export const withdrawRequestsAPI = {
  list: (member_id?: string, status?: string) => {
    const params = new URLSearchParams();
    if (member_id) params.append('member_id', member_id);
    if (status && status !== 'all') params.append('status', status);
    const queryString = params.toString();
    return apiClient.get<WithdrawRequest[]>(`/withdrawals${queryString ? `?${queryString}` : ''}`);
  },
  create: (data: any) => apiClient.post<WithdrawRequest>('/withdrawals', data),
  approve: (id: string) => apiClient.put<WithdrawRequest>(`/withdrawals/${id}/approve`),
  reject: (id: string) => apiClient.put<WithdrawRequest>(`/withdrawals/${id}/reject`),
};

// Loan Repayments API
export const loanRepaymentsAPI = {
  list: (loan_id?: string) => {
    const params = new URLSearchParams();
    if (loan_id) params.append('loan_id', loan_id);
    const queryString = params.toString();
    return apiClient.get<LoanRepayment[]>(`/loan-repayments${queryString ? `?${queryString}` : ''}`);
  },
  create: (data: any) => apiClient.post<LoanRepayment>('/loan-repayments', data),
};

// Merry-Go-Round API
export const merryGoRoundAPI = {
  list: () => apiClient.get<MerryGoRoundCycle[]>('/merry-go-round'),
  create: (data: any) => apiClient.post<MerryGoRoundCycle>('/merry-go-round', data),
  update: (id: string, data: any) => apiClient.put<MerryGoRoundCycle>(`/merry-go-round/${id}`, data),
  delete: (id: string) => apiClient.delete<any>(`/merry-go-round/${id}`),
};

// Meetings API
export const meetingsAPI = {
  list: (status?: string) => {
    const params = status && status !== 'all' ? `?status=${status}` : '';
    return apiClient.get<Meeting[]>(`/meetings${params}`);
  },
  create: (data: any) => apiClient.post<Meeting>('/meetings', data),
  update: (id: string, data: any) => apiClient.put<Meeting>(`/meetings/${id}`, data),
};

// Notifications API
export const notificationsAPI = {
  list: () => apiClient.get<Notification[]>('/notifications'),
  markRead: (id: string) => apiClient.put<any>(`/notifications/${id}/read`),
  markAllRead: () => apiClient.put<any>('/notifications/read-all'),
};

// Chama Settings API
export const chamaSettingsAPI = {
  get: () => apiClient.get<any>('/settings'),
  update: (data: any) => apiClient.put<any>('/settings', data),
};

export default apiClient;
