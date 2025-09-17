export interface PartnerNft {
  id: string;
  name: string;
  photo_url: string;
  animation_url?: string;
  collection_id: string;
  external_collection_number: number;
  price?: string;
  floor_price?: string;
  status: 'listed' | 'unlisted' | 'withdrawn' | 'auction' | 'giveaway_locked' | 'bundle';
  attributes: NftAttribute[];
  emoji_id?: string;
  has_animation?: boolean;
  tg_id?: string;
  unlocks_at?: string;
}
export interface NftAttribute {
  type: string;
  value: string;
  rarity_per_mille: number;
}
export interface SearchNftsResponse {
  results: PartnerNft[];
  total_count: number;
}
export interface OwnedNftsResponse {
  nfts: PartnerNft[];
  total_count?: number;
}
export interface UserWalletInfo {
  balance: string;
  frozen_funds: string;
}
export interface MarketConfig {
  commission: string;
  deposit_wallet: string;
  usdt_course: string;
  user_cashback: string;
}
export interface UserStats {
  total_count: number;
  listed_count: number;
  unlisted_count: number;
}
class PartnersApiService {
  private baseUrl = import.meta.env.VITE_PARTNERS_API_URL || 'https://portals-market.com';
  private token = import.meta.env.VITE_PARTNERS_TOKEN || '';
  private getHeaders() {
    return {
      'Authorization': `partners ${this.token}`,
      'Content-Type': 'application/json',
    };
  }
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }
    return response.json();
  }
  async searchNfts(params: {
    name_filter?: string;
    collection_id?: string;
    min_price?: string;
    max_price?: string;
    filter_by_collections?: string[];
    filter_by_models?: string[];
    filter_by_symbols?: string[];
    filter_by_backdrops?: string[];
    status?: 'listed' | 'unlisted' | 'auction';
    sort_by?: 'listed_at desc' | 'price asc' | 'price desc' | 'external_collection_number asc' | 'external_collection_number desc' | 'model_rarity asc' | 'model_rarity desc';
    limit?: number;
    offset?: number;
    with_attributes?: boolean;
  } = {}): Promise<SearchNftsResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          searchParams.append(key, value.join(','));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });
    return this.makeRequest<SearchNftsResponse>(
      `/partners/nfts/search?${searchParams.toString()}`
    );
  }
  async getAllAvailableNfts(params: {
    limit?: number;
    offset?: number;
    status?: 'listed' | 'unlisted' | 'auction';
  } = {}): Promise<SearchNftsResponse> {
    return this.searchNfts({
      limit: params.limit || 100,
      offset: params.offset || 0,
      status: params.status || 'listed',
      with_attributes: true,
      sort_by: 'price asc'
    });
  }
  async getOwnedNfts(params: {
    collection_id?: string;
    filter_by_collections?: string[];
    filter_by_models?: string[];
    filter_by_symbols?: string[];
    filter_by_backdrops?: string[];
    status?: 'listed' | 'unlisted' | 'auction';
    sort_by?: 'listed_at desc' | 'price asc' | 'price desc' | 'external_collection_number asc' | 'external_collection_number desc' | 'model_rarity asc' | 'model_rarity desc';
    limit?: number;
    offset?: number;
    with_attributes?: boolean;
  } = {}): Promise<OwnedNftsResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          searchParams.append(key, value.join(','));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });
    return this.makeRequest<OwnedNftsResponse>(
      `/partners/nfts/owned?${searchParams.toString()}`
    );
  }
  async getUserStats(): Promise<UserStats> {
    return this.makeRequest<UserStats>('/partners/nfts/stats');
  }
  async getWalletInfo(): Promise<UserWalletInfo> {
    return this.makeRequest<UserWalletInfo>('/partners/users/wallets/');
  }
  async getMarketConfig(): Promise<MarketConfig> {
    return this.makeRequest<MarketConfig>('/partners/market/config');
  }
  async buyNfts(nftDetails: Array<{ id: string; price: string }>): Promise<any> {
    return this.makeRequest('/partners/nfts', {
      method: 'POST',
      body: JSON.stringify({
        nft_details: nftDetails
      })
    });
  }
  async checkUserExists(userId: number): Promise<{ exists: boolean }> {
    return this.makeRequest<{ exists: boolean }>(`/partners/users/${userId}`);
  }
  async transferGifts(params: {
    nft_ids: string[];
    recipient: string;
    anonymous?: boolean;
  }): Promise<any> {
    return this.makeRequest('/partners/nfts/transfer', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }
  async getCollectionFloors(): Promise<any> {
    return this.makeRequest('/partners/collections/floors');
  }
  async getAttributeFloors(): Promise<any> {
    return this.makeRequest('/partners/collections/attribute-floors');
  }
  async getCollectionsList(): Promise<{ collections: Array<{ id: string; name: string; floor_price?: string }> }> {
    try {
      const floorsData = await this.getAttributeFloors();
      const collectionsMap = new Map<string, { name: string; floor_price?: string }>();
      if (floorsData?.models) {
        floorsData.models.forEach((model: any) => {
          if (model.collection_name) {
            collectionsMap.set(model.collection_name, {
              name: model.collection_name,
              floor_price: model.floor_price
            });
          }
        });
      }
      const collections = Array.from(collectionsMap.entries()).map(([id, data]) => ({
        id,
        ...data
      }));
      return { collections };
    } catch (error) {
      console.error('Error fetching collections:', error);
      return { collections: [] };
    }
  }
}
export const partnersApi = new PartnersApiService();