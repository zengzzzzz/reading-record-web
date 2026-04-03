# 阅读记录管理

一个简单优雅的阅读记录管理工具，帮助你追踪书籍和文章的阅读进度。

## 功能特性

- 📚 **添加阅读记录**：记录书名/文章标题、作者、类型、阅读状态等信息
- 📝 **详细记录**：支持评分、读书笔记、开始和完成日期
- 🔍 **智能筛选**：按类型（书籍/文章）、状态（想读/在读/已读）筛选
- 🔎 **搜索功能**：快速搜索标题、作者、笔记内容
- 📊 **统计看板**：查看年度阅读统计、月度阅读量、评分分布
- 💾 **本地存储**：数据保存在本地 SQLite 数据库，无需网络

## 技术栈

- **前端**：React + TypeScript + Tailwind CSS + Vite
- **后端**：Node.js + Express + TypeScript
- **数据库**：SQLite3

## 安装运行

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 快速开始

1. **克隆仓库**
   ```bash
   git clone <repository-url>
   cd reading-record-web
   ```

2. **安装依赖**
   ```bash
   npm run install:all
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

   这将同时启动后端（端口 3001）和前端（端口 5173）。

4. **访问应用**

   打开浏览器访问 http://localhost:5173

### 生产部署

1. **构建前端**
   ```bash
   cd frontend && npm run build
   ```

2. **构建后端**
   ```bash
   cd backend && npm run build
   ```

3. **启动生产服务器**
   ```bash
   cd backend && npm start
   ```

## 项目结构

```
reading-record-web/
├── backend/              # 后端代码
│   ├── src/
│   │   ├── db.ts        # 数据库连接和初始化
│   │   ├── index.ts     # 服务器入口
│   │   ├── routes/
│   │   │   └── records.ts  # API 路由
│   │   └── types/
│   │       └── index.ts    # 类型定义
│   ├── package.json
│   └── tsconfig.json
├── frontend/             # 前端代码
│   ├── src/
│   │   ├── components/   # React 组件
│   │   │   ├── StatCards.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   ├── RecordList.tsx
│   │   │   ├── RecordCard.tsx
│   │   │   └── RecordForm.tsx
│   │   ├── api.ts        # API 调用
│   │   ├── types.ts      # 类型定义
│   │   ├── App.tsx       # 主应用
│   │   ├── main.tsx      # 入口文件
│   │   └── index.css     # 全局样式
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/records | 获取记录列表 |
| GET | /api/records/:id | 获取单条记录 |
| POST | /api/records | 创建记录 |
| PUT | /api/records/:id | 更新记录 |
| DELETE | /api/records/:id | 删除记录 |
| GET | /api/records/stats/overview | 获取统计数据 |

## 开发计划

- [x] 基础功能：增删改查阅读记录
- [x] 筛选和搜索功能
- [x] 统计看板
- [ ] 数据导入导出
- [ ] 阅读目标设定
- [ ] 阅读时长统计

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
