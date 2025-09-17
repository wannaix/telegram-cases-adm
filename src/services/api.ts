import {
  AdminStats,
  ChartResponse,
  UsersResponse,
  PromocodeResponse,
  ReferralLinksResponse,
  CasesResponse,
  GiftsResponse,
  AdminLogsResponse,
  User,
  Promocode,
  ReferralLink,
  Case,
  Gift,
  Transaction,
  ApiResponse
} from '../types';
const API_BASE_URL = '/api/admin';
class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('admin_token');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || error.message || 'Request failed');
    }
    return response.json();
  }
  async getStats(): Promise<AdminStats> {
    return this.request<AdminStats>('/stats');
  }
  async getChartData(days: number = 30): Promise<ChartResponse> {
    return this.request<ChartResponse>(`/stats/chart?days=${days}`);
  }
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'all' | 'active' | 'blocked';
  } = {}): Promise<UsersResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    return this.request<UsersResponse>(`/users?${queryParams.toString()}`);
  }
  async updateUserBalance(userId: string, amount: number, reason?: string): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>(`/users/${userId}/balance`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    });
  }
  async blockUser(userId: string, blocked: boolean, reason?: string): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>(`/users/${userId}/block`, {
      method: 'POST',
      body: JSON.stringify({ blocked, reason }),
    });
  }
  async getUserHistory(userId: string): Promise<{
    transactions: Transaction[];
    caseOpenings: any[];
  }> {
    return this.request(`/users/${userId}/history`);
  }
  async getPromocodes(): Promise<PromocodeResponse> {
    return this.request<PromocodeResponse>('/promocodes');
  }
  async createPromocode(data: {
    code: string;
    description?: string;
    bonusAmount: number;
    bonusPercent?: number;
    maxUses?: number;
    expiresAt?: string;
  }): Promise<ApiResponse<Promocode>> {
    return this.request<ApiResponse<Promocode>>('/promocodes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  async updatePromocode(id: string, data: {
    description?: string;
    bonusAmount?: number;
    bonusPercent?: number;
    maxUses?: number;
    isActive?: boolean;
    expiresAt?: string;
  }): Promise<ApiResponse<Promocode>> {
    return this.request<ApiResponse<Promocode>>(`/promocodes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  async deletePromocode(id: string): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/promocodes/${id}`, {
      method: 'DELETE',
    });
  }
  async getReferralLinks(): Promise<ReferralLinksResponse> {
    return this.request<ReferralLinksResponse>('/referral-links');
  }
  async createReferralLink(data: {
    code: string;
    name?: string;
    description?: string;
  }): Promise<ApiResponse<ReferralLink>> {
    return this.request<ApiResponse<ReferralLink>>('/referral-links', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  async getCases(): Promise<CasesResponse> {
    return this.request<CasesResponse>('/cases');
  }
  async createCase(data: {
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    isActive?: boolean;
    isLocked?: boolean;
    unlockLevel?: number;
    unlockPrice?: number;
  }): Promise<ApiResponse<Case>> {
    return this.request<ApiResponse<Case>>('/cases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  async getGifts(): Promise<GiftsResponse> {
    return this.request<GiftsResponse>('/gifts');
  }
  async createGift(data: {
    name: string;
    description?: string;
    imageUrl?: string;
    price: number;
    isActive?: boolean;
  }): Promise<ApiResponse<Gift>> {
    return this.request<ApiResponse<Gift>>('/gifts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  async getAdminLogs(params: {
    page?: number;
    limit?: number;
  } = {}): Promise<AdminLogsResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    return this.request<AdminLogsResponse>(`/logs?${queryParams.toString()}`);
  }
}
export const apiService = new ApiService();