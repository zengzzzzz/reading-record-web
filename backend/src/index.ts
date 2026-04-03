import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import recordsRouter from './routes/records.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 请求日志
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// API 路由
app.use('/api/records', recordsRouter);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  });
});

// 静态文件（生产环境）
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(frontendDistPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
  });
});

// 错误处理
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║          📚 Reading Record API Server                   ║
╠══════════════════════════════════════════════════════════╣
║  Server running at: http://localhost:${PORT}              ║
║  API base URL:      http://localhost:${PORT}/api          ║
║  Health check:      http://localhost:${PORT}/api/health     ║
╚══════════════════════════════════════════════════════════╝
  `);
});

export default app;
