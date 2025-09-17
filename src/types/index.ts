export interface User {
  id: string;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  balance: number;
  totalSpent: number;
  totalWon: number;
  isBlocked: boolean;
  isAdmin: boolean;
  referralLinkId?: string;
  createdAt: string;
  updatedAt: string;
  transactions?: Transaction[];
}
export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description?: string;
  createdAt: string;
}
export type TransactionType = 
  | 'DEPOSIT' 
  | 'WITHDRAWAL' 
  | 'CASE_OPENING' 
  | 'ITEM_SALE' 
  | 'REFUND' 
  | 'ADMIN_ADJUSTMENT' 
  | 'PROMOCODE_BONUS';
export interface Promocode {
  id: string;
  code: string;
  description?: string;
  bonusAmount: number;
  bonusPercent?: number;
  maxUses?: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  userPromocodes?: UserPromocode[];
}
export interface UserPromocode {
  id: string;
  userId: string;
  promocodeId: string;
  bonusAmount: number;
  createdAt: string;
  user?: Pick<User, 'username' | 'firstName' | 'telegramId'>;
}
export interface ReferralLink {
  id: string;
  code: string;
  name?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  users?: User[];
  deposits?: ReferralDeposit[];
  totalUsers?: number;
  totalDeposits?: number;
  depositsCount?: number;
}
export interface ReferralDeposit {
  id: string;
  referralLinkId: string;
  userId: string;
  amount: number;
  createdAt: string;
}
export interface Case {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isActive: boolean;
  isLocked: boolean;
  unlockLevel?: number;
  unlockPrice?: number;
  createdAt: string;
  updatedAt: string;
  totalOpenings?: number;
  revenue?: number;
}
export interface Gift {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  target?: string;
  description?: string;
  metadata?: any;
  createdAt: string;
}
export interface AdminStats {
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
}
export interface ChartData {
  date: string;
  deposits: number;
  withdrawals: number;
}
export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}
export interface UsersResponse {
  users: User[];
  pagination: PaginationData;
}
export interface PromocodeResponse {
  promocodes: Promocode[];
}
export interface ReferralLinksResponse {
  referralLinks: ReferralLink[];
}
export interface CasesResponse {
  cases: Case[];
}
export interface GiftsResponse {
  gifts: Gift[];
}
export interface AdminLogsResponse {
  logs: AdminLog[];
  pagination: PaginationData;
}
export interface ChartResponse {
  data: ChartData[];
}