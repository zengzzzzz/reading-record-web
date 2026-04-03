// 阅读记录类型
export type ReadingType = 'book' | 'article';
export type ReadingStatus = 'want' | 'reading' | 'completed';

// 阅读记录接口
export interface ReadingRecord {
  id: number;
  title: string;
  author: string;
  type: ReadingType;
  status: ReadingStatus;
  rating: number | null;
  notes: string | null;
  startDate: string | null;  // ISO 8601 format (YYYY-MM-DD)
  completeDate: string | null; // ISO 8601 format (YYYY-MM-DD)
  createdAt: string;         // ISO 8601 datetime
}

// 创建记录请求体
export interface CreateRecordRequest {
  title: string;
  author: string;
  type: ReadingType;
  status: ReadingStatus;
  rating?: number | null;
  notes?: string | null;
  startDate?: string | null;
  completeDate?: string | null;
}

// 更新记录请求体
export type UpdateRecordRequest = Partial<CreateRecordRequest>;

// 筛选参数
export interface FilterParams {
  type?: ReadingType | 'all';
  status?: ReadingStatus | 'all';
  search?: string;
  year?: number;
}

// 排序参数
export interface SortParams {
  field: 'createdAt' | 'completeDate' | 'rating' | 'title';
  order: 'asc' | 'desc';
}

// 统计数据
export interface Statistics {
  totalCompleted: number;
  totalReading: number;
  totalWant: number;
  averageRating: number | null;
  booksByMonth: { month: number; count: number }[];
  ratingDistribution: { rating: number; count: number }[];
  typeDistribution: { type: ReadingType; count: number }[];
}

// API 响应封装
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
