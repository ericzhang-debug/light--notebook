# 老张的备忘录

一款简洁、优雅的个人备忘录应用，采用全栈技术构建，支持实时自动保存和响应式设计。

![Demo](https://img.shields.io/badge/Next.js-16-black)
![Demo](https://img.shields.io/badge/React-19-blue)
![Demo](https://img.shields.io/badge/Clerk-Auth-purple)
![Demo](https://img.shields.io/badge/Drizzle-ORM-orange)
![Demo](https://img.shields.io/badge/Turso-Database-green)

## ✨ 特性

- 📝 **实时自动保存** - 输入停止 500ms 后自动保存，无需手动点击
- 🎨 **MacOS 风格设计** - 简洁优雅的界面，支持浅色/深色模式
- 📱 **响应式布局** - 完美适配桌面端和移动端
- 🔐 **安全认证** - 使用 Clerk 进行用户身份验证
- 💾 **云端同步** - 数据存储在 Turso 数据库
- ⚡ **快速响应** - 基于 Next.js 16 和 React 19

## 🛠️ 技术栈

### 前端
- **Next.js 16** - React 框架（App Router）
- **React 19** - UI 库
- **TypeScript** - 类型安全
- **Tailwind CSS 4** - 样式框架
- **Lucide React** - 图标库
- **date-fns** - 日期格式化

### 后端
- **Next.js API Routes** - RESTful API
- **Drizzle ORM** - 数据库 ORM
- **Turso (LibSQL)** - 云端 SQLite 数据库

### 认证
- **Clerk** - 用户认证和会话管理

## 📦 安装

```bash
# 克隆项目
git clone <your-repo-url>
cd light-notebook

# 安装依赖
pnpm install

# 初始化数据库
pnpm db:init
```

## 🚀 运行

```bash
# 启动开发服务器
pnpm dev

# 访问 http://localhost:3000
```

## ⚙️ 环境变量

创建 `.env.local` 文件：

```bash
# Clerk 认证密钥
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Turso 数据库
TURSO_CONNECTION_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

### 获取密钥

1. **Clerk**: 访问 [Clerk Dashboard](https://dashboard.clerk.com) 创建应用并获取密钥
2. **Turso**: 访问 [Turso Dashboard](https://turso.tech) 创建数据库并获取连接信息

## 📁 项目结构

```
light-notebook/
├── app/
│   ├── api/
│   │   └── notes/           # API 路由
│   ├── dashboard/           # 主应用页面
│   ├── sign-in/             # 登录页面
│   ├── sign-up/             # 注册页面
│   ├── layout.tsx           # 根布局
│   ├── page.tsx             # 首页
│   └── globals.css          # 全局样式
├── components/
│   └── notes/               # 备忘录组件
│       ├── NoteList.tsx     # 备忘录列表
│       ├── NoteListItem.tsx # 列表项
│       ├── NoteEditor.tsx   # 编辑器
│       ├── NoteHeader.tsx   # 编辑器头部
│       └── EmptyState.tsx   # 空状态
├── lib/
│   └── db/                  # 数据库配置
│       ├── schema.ts        # 数据库模型
│       ├── index.ts         # 数据库连接
│       └── migrations/      # 数据库迁移
├── proxy.ts                # Clerk 中间件
├── drizzle.config.ts       # Drizzle 配置
└── package.json
```

## 📊 数据库模型

```sql
CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Note',
  content TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

## 🔧 可用脚本

```bash
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm start        # 启动生产服务器
pnpm db:init      # 初始化数据库
```

## 📱 功能预览

### 桌面端
- 左侧：备忘录列表 + 新建按钮
- 右侧：编辑区域（标题 + 内容）

### 移动端
- 列表视图：显示所有备忘录
- 编辑视图：点击后进入编辑模式
- 返回按钮：从编辑视图返回列表

## 🎯 API 端点

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/notes` | 获取用户所有备忘录 |
| POST | `/api/notes` | 创建新备忘录 |
| GET | `/api/notes/[id]` | 获取单个备忘录 |
| PUT | `/api/notes/[id]` | 更新备忘录 |
| DELETE | `/api/notes/[id]` | 删除备忘录 |

## 🌐 部署

### Vercel (推荐)
```bash
# 安装 Vercel CLI
pnpm add -g vercel

# 部署
vercel
```

### 其他平台
项目可部署到任何支持 Next.js 的平台：
- Cloudflare Pages
- Netlify
- AWS Amplify
- Railway
