// src/services/api.ts
import type { Member, Contribution, Loan, Meeting, MerryGoRoundCycle, Transaction, Fine, DepositRecord, WithdrawRequest, LoanRepaymentRecord, MemberStats, Notification } from '../types';

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

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
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
  setToken: (token: string) => apiClient.setToken(token),
  getToken: () => apiClient.getToken(),
};

// Members API
export const membersAPI = {
  list: (params?: { status?: string; search?: string }) => 
    apiClient.get<Member[]>(`/members${new URLSearchParams(params as any).toString()}`),
  get: (id: string) => apiClient.get<Member>(`/members/${id}`),
  create: (data: any) => apiClient.post<Member>('/members', data),
  update: (id: string, data: any) => apiClient.put<Member>(`/members/${id}`, data),
  getStats: (id: string) => apiClient.get<MemberStats>(`/members/${id}/stats`),
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
};

export default apiClient;
