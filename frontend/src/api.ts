import type {
  ReadingRecord,
  CreateRecordRequest,
  UpdateRecordRequest,
  FilterParams,
  Statistics,
  PaginatedResponse,
  ApiResponse,
} from './types';

const API_BASE = '/api';

// 辅助函数：构建查询字符串
function buildQueryString(params: Record<string, string | number | undefined>): string {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  return query ? `?${query}` : '';
}

// 获取所有记录
export async function getRecords(
  filters: FilterParams = {},
  page: number = 1,
  pageSize: number = 20,
  sortBy: string = 'created_at',
  sortOrder: string = 'desc'
): Promise<PaginatedResponse<ReadingRecord>> {
  const query = buildQueryString({
    ...filters,
    page,
    pageSize,
    sortBy,
    sortOrder,
  });

  const response = await fetch(`${API_BASE}/records${query}`);
  const result: ApiResponse<PaginatedResponse<ReadingRecord>> = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch records');
  }

  return result.data!;
}

// 获取单个记录
export async function getRecord(id: number): Promise<ReadingRecord> {
  const response = await fetch(`${API_BASE}/records/${id}`);
  const result: ApiResponse<ReadingRecord> = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch record');
  }

  return result.data!;
}

// 创建记录
export async function createRecord(data: CreateRecordRequest): Promise<ReadingRecord> {
  const response = await fetch(`${API_BASE}/records`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result: ApiResponse<ReadingRecord> = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to create record');
  }

  return result.data!;
}

// 更新记录
export async function updateRecord(id: number, data: UpdateRecordRequest): Promise<ReadingRecord> {
  const response = await fetch(`${API_BASE}/records/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result: ApiResponse<ReadingRecord> = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to update record');
  }

  return result.data!;
}

// 删除记录
export async function deleteRecord(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/records/${id}`, {
    method: 'DELETE',
  });

  const result: ApiResponse<{ id: number }> = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to delete record');
  }
}

// 获取统计数据
export async function getStatistics(year?: number): Promise<Statistics> {
  const query = year ? `?year=${year}` : '';
  const response = await fetch(`${API_BASE}/records/stats/overview${query}`);
  const result: ApiResponse<Statistics> = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch statistics');
  }

  return result.data!;
}
