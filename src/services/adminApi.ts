export interface CreateCaseWithNftsRequest {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isActive?: boolean;
  isLocked?: boolean;
  unlockLevel?: number;
  unlockPrice?: number;
  nftItems: Array<{
    nftId: string;
    name: string;
    imageUrl: string;
    rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'CONTRABAND';
    dropChance: number;
    estimatedPrice?: number;
  }>;
}
export interface CaseData {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isActive: boolean;
  isLocked: boolean;
  unlockLevel?: number;
  unlockPrice?: number;
  totalOpenings?: number;
  revenue?: number;
  items?: Array<{
    id: string;
    dropChance: number;
    item: {
      id: string;
      name: string;
      imageUrl?: string;
      rarity: string;
      partnersNftId?: string;
      estimatedPrice?: number;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}
export interface AdminStatsResponse {
  users: {
    total: number;
    today: number;
    month: number;
    payingToday: number;
    payingMonth: number;
  };
  finances: {
    today: {
      deposits: number;
      withdrawals: number;
      depositsCount: number;
      withdrawalsCount: number;
    };
    month: {
      deposits: number;
      withdrawals: number;
      depositsCount: number;
      withdrawalsCount: number;
    };
  };
  supplierBalance?: number; 
}
class AdminApiService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  private getToken() {
    return localStorage.getItem('admin_token') || 'mock-admin-token';
  }
  private getHeaders(hasBody = true) {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.getToken()}`,
    };
    if (hasBody) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  }
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}, isAdminRoute = true): Promise<T> {
    const url = isAdminRoute ? `${this.baseUrl}/admin${endpoint}` : `${this.baseUrl}${endpoint}`;
    const hasBody = !!(options.body);
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(hasBody),
        ...options.headers,
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.status} - ${response.statusText}`);
    }
    return response.json();
  }
  async getStats(): Promise<AdminStatsResponse> {
    return this.makeRequest<AdminStatsResponse>('/stats');
  }
  async getChartData(days: number = 30): Promise<{ data: Array<{ date: string; deposits: number; withdrawals: number }> }> {
    return this.makeRequest(`/stats/chart?days=${days}`);
  }
  async getCases(): Promise<{ cases: CaseData[] }> {
    return this.makeRequest<{ cases: CaseData[] }>('/cases', {}, false);
  }
  async createCase(data: any): Promise<{ success: boolean; case: CaseData }> {
    return this.makeRequest('/cases', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  async createCaseWithNfts(data: CreateCaseWithNftsRequest): Promise<{ success: boolean; case: CaseData }> {
    return this.makeRequest<{ success: boolean; case: CaseData }>('/public-admin/cases/with-nfts', {
      method: 'POST',
      body: JSON.stringify(data)
    }, false);
  }
  async updateCase(id: string, data: any): Promise<{ success: boolean; case: CaseData }> {
    return this.makeRequest(`/cases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  async deleteCase(id: string): Promise<{ success: boolean }> {
    return this.makeRequest<{ success: boolean }>(`/public-admin/cases/${id}`, {
      method: 'DELETE'
    }, false).catch(() => {
      return this.makeRequest<{ success: boolean }>(`/cases/${id}`, {
        method: 'DELETE'
      });
    });
  }
  async deleteEmptyCases(): Promise<{ success: boolean; deletedCount: number; message: string }> {
    return this.makeRequest<{ success: boolean; deletedCount: number; message: string }>('/public-admin/cases/empty', {
      method: 'DELETE'
    }, false);
  }
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'all' | 'active' | 'blocked';
  } = {}): Promise<any> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    return this.makeRequest(`/users?${searchParams.toString()}`);
  }
  async updateUserBalance(userId: string, amount: number, reason?: string): Promise<any> {
    return this.makeRequest(`/users/${userId}/balance`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason })
    });
  }
  async blockUser(userId: string, blocked: boolean, reason?: string): Promise<any> {
    return this.makeRequest(`/users/${userId}/block`, {
      method: 'POST',
      body: JSON.stringify({ blocked, reason })
    });
  }
  async getUserHistory(userId: string): Promise<any> {
    return this.makeRequest(`/users/${userId}/history`);
  }
  async getPromocodes(): Promise<any> {
    return this.makeRequest('/promocodes');
  }
  async createPromocode(data: any): Promise<any> {
    return this.makeRequest('/promocodes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  async updatePromocode(id: string, data: any): Promise<any> {
    return this.makeRequest(`/promocodes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  async deletePromocode(id: string): Promise<any> {
    return this.makeRequest(`/promocodes/${id}`, {
      method: 'DELETE'
    });
  }
  async getReferralLinks(): Promise<any> {
    return this.makeRequest('/referral-links');
  }
  async createReferralLink(data: any): Promise<any> {
    return this.makeRequest('/referral-links', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  async getGifts(): Promise<any> {
    return this.makeRequest('/gifts');
  }
  async createGift(data: any): Promise<any> {
    return this.makeRequest('/gifts', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  async getLogs(params: { page?: number; limit?: number } = {}): Promise<any> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    return this.makeRequest(`/logs?${searchParams.toString()}`);
  }
  async uploadCaseImage(file: File): Promise<{ success: boolean; imageUrl?: string; imageBase64?: string; filename: string; size: number }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${this.baseUrl}/public-admin/upload/case-image`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload image');
    }
    return response.json();
  }
  async deleteCaseImage(imagePath: string): Promise<{ success: boolean }> {
    return this.makeRequest('/upload/case-image', {
      method: 'DELETE',
      body: JSON.stringify({ imagePath })
    });
  }
}
export const adminApi = new AdminApiService();