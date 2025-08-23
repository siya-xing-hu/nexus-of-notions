# Nexus of Notions (NoN)

一个基于 Nuxt 3 + Vue 3 + Tailwind CSS 的奇思妙想收集平台，使用 Vercel PostgreSQL 作为数据库。

## 项目理念

Nexus of Notions (NoN) 是一个用于收集、管理和展示各种奇思妙想的平台。每个功能模块都是你脑海中的一个想法，通过技术实现成为现实。

## 功能模块

### 📊 体重记录系统 (Weight Tracker)
- **功能描述**: 跟踪体重变化，保持健康生活
- **核心特性**: 
  - 体重记录管理 - 添加、查看体重记录
  - 可视化图表 - 使用 Chart.js 展示体重变化趋势
  - 数据表格 - 详细的体重记录列表
  - API 接口 - 支持外部程序调用添加体重记录
  - 响应式设计 - 适配各种设备屏幕
  - 现代 UI - 使用 Tailwind CSS 构建美观界面

### 🎮 五子棋小游戏 (Gomoku Game)
- **功能描述**: 经典五子棋对战游戏，支持实时多人对战
- **核心特性**: 
  - 实时对战 - 使用 Server-Sent Events 实现实时通信
  - 自动重连 - 连接中断时自动重新建立连接
  - 游戏房间 - 创建和加入游戏房间
  - 五子棋规则 - 完整的五子棋游戏逻辑
  - 响应式棋盘 - 适配各种设备屏幕
  - 游戏状态管理 - 等待、进行中、结束状态
  - 获胜检测 - 自动检测五子连珠获胜条件

### 🔍 影视资源搜索 (Movie Search)
- **功能描述**: 通过向 Telegram 机器人或频道发送指令，异步搜索并获取影视资源。
- **核心特性**: 
  - **分类搜索**: 支持在预设的多个资源频道或机器人中进行选择性搜索。
  - **异步获取**: 采用发送指令后轮询结果的异步模式，优化用户等待体验。
  - **重试机制**: 在结果获取超时后，支持一键重试查询。
  - **响应式设计**: 界面兼容桌面和移动设备，提供流畅的搜索体验。
  - **动态结果展示**: 模拟搜索引擎，结构化展示标题、摘要和来源。
  - **关键词高亮**: 在搜索结果摘要中自动高亮用户输入的关键词。
  - **一键复制**: 方便地复制原始消息内容。

### 🚀 更多模块开发中...
- 待添加的奇思妙想功能模块

## 技术栈

- **前端框架**: Nuxt 3 + Vue 3
- **样式框架**: Tailwind CSS
- **图表库**: Chart.js + vue-chartjs
- **数据库**: Vercel PostgreSQL + Prisma ORM
- **开发语言**: TypeScript

## 项目结构

```
components/              # Vue 组件
├── AddWeightForm.vue    # 体重记录表单
├── WeightChart.vue      # 体重图表
├── WeightTable.vue      # 体重表格
├── gomoku/             # 五子棋游戏组件
│   └── GameStatusBadge.vue  # 游戏状态徽章
└── telegram/           # Telegram 搜索组件
    ├── MessageCard.vue     # 消息卡片
    └── SearchHistory.vue   # 搜索历史
pages/                   # 页面
├── index.vue           # 主页面
├── weight-tracker/     # 体重记录页面
├── gomoku/             # 五子棋游戏页面
│   ├── index.vue       # 游戏列表页面
│   └── game/[id].vue   # 游戏对战页面
└── telegram/           # Telegram 搜索页面
    └── index.vue       # 搜索主页面
server/                  # API 路由
└── api/                # API 路由
    ├── weight/         # 体重相关 API
    ├── game/           # 五子棋游戏 API
    │   ├── index.ts    # 游戏管理 API
    │   └── [id]/       # 游戏详情 API
    │       ├── index.ts
    │       ├── move.ts # 移动 API
    │       └── stream.ts # SSE 实时更新
    └── telegram/       # Telegram API
        └── index.ts    # 搜索和消息 API
lib/                     # 核心库
├── api/                # API 客户端
│   ├── client/         # API 客户端
│   │   ├── user.ts     # 用户 API
│   │   ├── weight.ts   # 体重 API
│   │   ├── game.ts     # 游戏 API
│   │   └── telegram.ts # Telegram API
│   └── index.ts        # API 聚合
└── telegram/           # Telegram 服务
    └── TelegramService.ts # Telegram API 服务
prisma/                  # 数据库模型
└── schema.prisma       # Prisma schema (包含 Game 模型)
```

## 快速开始

### 1. 运行设置脚本

```bash
./setup.sh
```

### 2. 配置环境变量

编辑 `.env` 文件，填入你的数据库连接信息（只需要配置 `POSTGRES_URL`）。

### 3. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 部署

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量（参考 env.example）
4. 部署项目

## 开发理念

### 🧠 奇思妙想驱动开发
每个功能模块都源于一个想法，通过技术实现成为现实。

### 🔧 模块化设计
- 每个功能模块独立开发
- 共享技术栈和基础设施
- 便于扩展和维护

### 🎨 用户体验优先
- 简洁直观的界面设计
- 响应式布局适配各种设备
- 流畅的交互体验

## 许可证

MIT License