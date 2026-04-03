import sqlite3 from 'sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '../data/reading_records.db');
const DATA_DIR = join(__dirname, '../data');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 创建数据库连接
export const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// 启用外键约束
db.run('PRAGMA foreign_keys = ON');

// 初始化数据库表和索引
export function initDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 主表
      db.run(`
        CREATE TABLE IF NOT EXISTS reading_records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          author TEXT NOT NULL DEFAULT '',
          type TEXT CHECK(type IN ('book', 'article')) NOT NULL DEFAULT 'book',
          status TEXT CHECK(status IN ('want', 'reading', 'completed')) NOT NULL DEFAULT 'want',
          rating INTEGER CHECK(rating >= 1 AND rating <= 5),
          notes TEXT,
          start_date TEXT,
          complete_date TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating table:', err);
          reject(err);
          return;
        }
      });

      // 创建索引
      const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_status ON reading_records(status)',
        'CREATE INDEX IF NOT EXISTS idx_type ON reading_records(type)',
        'CREATE INDEX IF NOT EXISTS idx_rating ON reading_records(rating)',
        'CREATE INDEX IF NOT EXISTS idx_complete_date ON reading_records(complete_date)',
        'CREATE INDEX IF NOT EXISTS idx_start_date ON reading_records(start_date)',
        'CREATE INDEX IF NOT EXISTS idx_created_at ON reading_records(created_at)',
        'CREATE INDEX IF NOT EXISTS idx_status_type ON reading_records(status, type)',
        'CREATE INDEX IF NOT EXISTS idx_status_complete_date ON reading_records(status, complete_date)',
        'CREATE INDEX IF NOT EXISTS idx_type_rating ON reading_records(type, rating)',
        'CREATE INDEX IF NOT EXISTS idx_title ON reading_records(title)',
      ];

      let completed = 0;
      indexes.forEach((sql) => {
        db.run(sql, (err) => {
          if (err) {
            console.error('Error creating index:', err);
            reject(err);
            return;
          }
          completed++;
          if (completed === indexes.length) {
            console.log('Database initialized successfully');
            resolve();
          }
        });
      });
    });
  });
}

// 关闭数据库连接
export function closeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
        reject(err);
      } else {
        console.log('Database connection closed');
        resolve();
      }
    });
  });
}

// 初始化
initDatabase().catch(console.error);
