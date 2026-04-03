import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import {
  ReadingRecord,
  CreateRecordRequest,
  UpdateRecordRequest,
  FilterParams,
  SortParams,
  Statistics,
  PaginatedResponse,
  ApiResponse,
  ReadingType,
  ReadingStatus,
} from '../types/index.js';

const router = Router();

// 辅助函数：构建查询条件
function buildWhereClause(filters: FilterParams): { clause: string; params: (string | number)[] } {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (filters.type && filters.type !== 'all') {
    conditions.push('type = ?');
    params.push(filters.type);
  }

  if (filters.status && filters.status !== 'all') {
    conditions.push('status = ?');
    params.push(filters.status);
  }

  if (filters.search) {
    conditions.push('(title LIKE ? OR author LIKE ? OR notes LIKE ?)');
    const searchPattern = `%${filters.search}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  if (filters.year) {
    conditions.push('(strftime(\'%Y\', complete_date) = ? OR strftime(\'%Y\', start_date) = ?)');
    params.push(String(filters.year), String(filters.year));
  }

  return {
    clause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params,
  };
}

// GET /api/records - 获取所有记录（支持筛选、排序、分页）
router.get('/', (req: Request, res: Response) => {
  try {
    const filters: FilterParams = {
      type: req.query.type as ReadingType | 'all',
      status: req.query.status as ReadingStatus | 'all',
      search: req.query.search as string,
      year: req.query.year ? parseInt(req.query.year as string, 10) : undefined,
    };

    const sort: SortParams = {
      field: (req.query.sortBy as SortParams['field']) || 'createdAt',
      order: (req.query.sortOrder as SortParams['order']) || 'desc',
    };

    const page = parseInt(req.query.page as string, 10) || 1;
    const pageSize = parseInt(req.query.pageSize as string, 10) || 20;
    const offset = (page - 1) * pageSize;

    // 构建 WHERE 子句
    const { clause: whereClause, params: whereParams } = buildWhereClause(filters);

    // 查询总数
    const countStmt = db.prepare(`SELECT COUNT(*) as total FROM reading_records ${whereClause}`);
    const { total } = countStmt.get(...whereParams) as { total: number };

    // 查询数据
    const orderByMap: Record<string, string> = {
      createdAt: 'created_at',
      completeDate: 'complete_date',
      rating: 'rating',
      title: 'title',
    };
    const orderBy = orderByMap[sort.field] || 'created_at';
    const orderDirection = sort.order === 'asc' ? 'ASC' : 'DESC';

    const query = `
      SELECT
        id,
        title,
        author,
        type,
        status,
        rating,
        notes,
        start_date as startDate,
        complete_date as completeDate,
        created_at as createdAt
      FROM reading_records
      ${whereClause}
      ORDER BY ${orderBy} ${orderDirection}
      LIMIT ? OFFSET ?
    `;

    const stmt = db.prepare(query);
    const records = stmt.all(...whereParams, pageSize, offset) as ReadingRecord[];

    const response: ApiResponse<PaginatedResponse<ReadingRecord>> = {
      success: true,
      data: {
        items: records,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching records:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch records',
    };
    res.status(500).json(response);
  }
});

// GET /api/records/:id - 获取单个记录
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);

    const stmt = db.prepare(`
      SELECT
        id,
        title,
        author,
        type,
        status,
        rating,
        notes,
        start_date as startDate,
        complete_date as completeDate,
        created_at as createdAt
      FROM reading_records
      WHERE id = ?
    `);

    const record = stmt.get(id) as ReadingRecord | undefined;

    if (!record) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Record not found',
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<ReadingRecord> = {
      success: true,
      data: record,
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching record:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch record',
    };
    res.status(500).json(response);
  }
});

// POST /api/records - 创建新记录
router.post('/', (req: Request, res: Response) => {
  try {
    const body = req.body as CreateRecordRequest;

    // 验证必填字段
    if (!body.title || body.title.trim() === '') {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Title is required',
      };
      res.status(400).json(response);
      return;
    }

    // 验证 rating 范围
    if (body.rating !== undefined && body.rating !== null) {
      if (body.rating < 1 || body.rating > 5) {
        const response: ApiResponse<never> = {
          success: false,
          error: 'Rating must be between 1 and 5',
        };
        res.status(400).json(response);
        return;
      }
    }

    const stmt = db.prepare(`
      INSERT INTO reading_records (
        title, author, type, status, rating, notes, start_date, complete_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      body.title.trim(),
      body.author?.trim() || '',
      body.type || 'book',
      body.status || 'want',
      body.rating || null,
      body.notes?.trim() || null,
      body.startDate || null,
      body.completeDate || null
    );

    // 获取刚插入的记录
    const newRecord = db.prepare('SELECT * FROM reading_records WHERE id = ?').get(result.lastInsertRowid) as ReadingRecord;

    const response: ApiResponse<ReadingRecord> = {
      success: true,
      data: newRecord,
    };
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating record:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to create record',
    };
    res.status(500).json(response);
  }
});

// PUT /api/records/:id - 更新记录
router.put('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const body = req.body as UpdateRecordRequest;

    // 检查记录是否存在
    const existing = db.prepare('SELECT id FROM reading_records WHERE id = ?').get(id);
    if (!existing) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Record not found',
      };
      res.status(404).json(response);
      return;
    }

    // 验证 rating 范围
    if (body.rating !== undefined && body.rating !== null) {
      if (body.rating < 1 || body.rating > 5) {
        const response: ApiResponse<never> = {
          success: false,
          error: 'Rating must be between 1 and 5',
        };
        res.status(400).json(response);
        return;
      }
    }

    // 构建更新语句
    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (body.title !== undefined) {
      updates.push('title = ?');
      values.push(body.title.trim());
    }
    if (body.author !== undefined) {
      updates.push('author = ?');
      values.push(body.author.trim());
    }
    if (body.type !== undefined) {
      updates.push('type = ?');
      values.push(body.type);
    }
    if (body.status !== undefined) {
      updates.push('status = ?');
      values.push(body.status);
    }
    if (body.rating !== undefined) {
      updates.push('rating = ?');
      values.push(body.rating);
    }
    if (body.notes !== undefined) {
      updates.push('notes = ?');
      values.push(body.notes?.trim() || null);
    }
    if (body.startDate !== undefined) {
      updates.push('start_date = ?');
      values.push(body.startDate);
    }
    if (body.completeDate !== undefined) {
      updates.push('complete_date = ?');
      values.push(body.completeDate);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');

    if (updates.length === 0) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'No fields to update',
      };
      res.status(400).json(response);
      return;
    }

    values.push(id);

    const stmt = db.prepare(`
      UPDATE reading_records
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    // 获取更新后的记录
    const updatedRecord = db.prepare('SELECT * FROM reading_records WHERE id = ?').get(id) as ReadingRecord;

    const response: ApiResponse<ReadingRecord> = {
      success: true,
      data: updatedRecord,
    };
    res.json(response);
  } catch (error) {
    console.error('Error updating record:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to update record',
    };
    res.status(500).json(response);
  }
});

// DELETE /api/records/:id - 删除记录
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);

    // 检查记录是否存在
    const existing = db.prepare('SELECT id FROM reading_records WHERE id = ?').get(id);
    if (!existing) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Record not found',
      };
      res.status(404).json(response);
      return;
    }

    const stmt = db.prepare('DELETE FROM reading_records WHERE id = ?');
    stmt.run(id);

    const response: ApiResponse<{ id: number }> = {
      success: true,
      data: { id },
    };
    res.json(response);
  } catch (error) {
    console.error('Error deleting record:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to delete record',
    };
    res.status(500).json(response);
  }
});

// GET /api/records/stats/overview - 获取统计概览
router.get('/stats/overview', (req: Request, res: Response) => {
  try {
    const year = req.query.year ? parseInt(req.query.year as string, 10) : new Date().getFullYear();

    // 今年完成的数量
    const completedStmt = db.prepare(`
      SELECT COUNT(*) as count FROM reading_records
      WHERE status = 'completed'
      AND strftime('%Y', complete_date) = ?
    `);
    const { count: totalCompleted } = completedStmt.get(String(year)) as { count: number };

    // 正在读的数量
    const readingStmt = db.prepare(`
      SELECT COUNT(*) as count FROM reading_records WHERE status = 'reading'
    `);
    const { count: totalReading } = readingStmt.get() as { count: number };

    // 想读的数量
    const wantStmt = db.prepare(`
      SELECT COUNT(*) as count FROM reading_records WHERE status = 'want'
    `);
    const { count: totalWant } = wantStmt.get() as { count: number };

    // 平均评分（已完成的）
    const avgRatingStmt = db.prepare(`
      SELECT AVG(rating) as average FROM reading_records
      WHERE status = 'completed' AND rating IS NOT NULL
    `);
    const { average } = avgRatingStmt.get() as { average: number | null };

    // 按月份统计
    const monthlyStmt = db.prepare(`
      SELECT CAST(strftime('%m', complete_date) AS INTEGER) as month, COUNT(*) as count
      FROM reading_records
      WHERE status = 'completed' AND strftime('%Y', complete_date) = ?
      GROUP BY month
      ORDER BY month
    `);
    const monthlyResult = monthlyStmt.all(String(year)) as { month: number; count: number }[] | undefined;
    const monthlyData = Array.isArray(monthlyResult) ? monthlyResult : [];

    // 填充所有月份（1-12月，没有数据的为0）
    const booksByMonth = Array.from({ length: 12 }, (_, i) => {
      const monthData = monthlyData.find(m => m.month === i + 1);
      return { month: i + 1, count: monthData?.count || 0 };
    });

    // 评分分布
    const ratingStmt = db.prepare(`
      SELECT rating, COUNT(*) as count
      FROM reading_records
      WHERE status = 'completed' AND rating IS NOT NULL
      GROUP BY rating
      ORDER BY rating DESC
    `);
    const ratingData = ratingStmt.all() as { rating: number; count: number }[];

    // 填充所有评分（5-1星）
    const ratingDistribution = Array.from({ length: 5 }, (_, i) => {
      const rating = 5 - i;
      const ratingItem = ratingData.find(r => r.rating === rating);
      return { rating, count: ratingItem?.count || 0 };
    });

    // 类型分布
    const typeStmt = db.prepare(`
      SELECT type, COUNT(*) as count
      FROM reading_records
      GROUP BY type
    `);
    const typeDistribution = typeStmt.all() as { type: ReadingType; count: number }[];

    const stats: Statistics = {
      totalCompleted,
      totalReading,
      totalWant,
      averageRating: average ? Math.round(average * 10) / 10 : null,
      booksByMonth,
      ratingDistribution,
      typeDistribution,
    };

    const response: ApiResponse<Statistics> = {
      success: true,
      data: stats,
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch statistics',
    };
    res.status(500).json(response);
  }
});

export default router;
